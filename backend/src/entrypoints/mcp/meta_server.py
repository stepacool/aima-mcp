"""Meta MCP Server – exposes the MCPHero wizard API as MCP tools.

Mounted at /mcp/meta and authenticated via org API keys.
The authenticated customer_id is automatically resolved from the
request_customer_id ContextVar set by MCPAccessMiddleware.
"""

import asyncio
from typing import Any
from uuid import UUID

from core.services.tier_service import FREE_TIER_MAX_TOOLS
from core.services.wizard_steps_services import WizardStepsService, openai_client
from fastmcp import Context, FastMCP
from infrastructure.models.mcp_server import MCPServerSetupStatus
from infrastructure.repositories.mcp_server import MCPServerUpdate
from infrastructure.repositories.repo_provider import Provider
from loguru import logger
from settings import settings

meta_mcp = FastMCP("MCPHero Meta Server")

# Will be set during FastAPI lifespan startup so deploy tool can access
# the app and stack for shared runtime registration.
_app_ref: Any = None
_stack_ref: Any = None


def set_app_refs(app: Any, stack: Any) -> None:
    """Called during lifespan to store references for the deploy tool."""
    global _app_ref, _stack_ref
    _app_ref = app
    _stack_ref = stack


def _get_customer_id(ctx: Context) -> UUID:
    """Resolve the authenticated customer ID from the fastmcp Context."""
    if not ctx.request_context or not ctx.request_context.request:
        raise ValueError("Not authenticated – missing request context")

    # Grab from request state populated by MCPAccessMiddleware
    customer_id = getattr(ctx.request_context.request.state, "mcp_customer_id", None)
    if customer_id is None:
        raise ValueError("Not authenticated – missing customer context")
    return customer_id


async def _require_server_ownership(ctx: Context, server_id: UUID) -> None:
    """Verify the server belongs to the authenticated customer."""
    customer_id = _get_customer_id(ctx)
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise ValueError(f"Server {server_id} not found")
    if server.customer_id != customer_id:
        raise ValueError("Access denied – server does not belong to your organization")


def _get_wizard_service() -> WizardStepsService:
    return WizardStepsService()


# ---------------------------------------------------------------------------
# Wizard tools
# ---------------------------------------------------------------------------


@meta_mcp.tool()
async def wizard_create_session(
    ctx: Context,
    customer_id: str | None = None,
) -> dict[str, Any]:
    """Create a new wizard session to start gathering requirements.

    Creates an MCP server in gathering_requirements status with an empty
    chat history. Use wizard_chat to iterate on requirements with the AI,
    then call wizard_start once the AI indicates readiness.

    Args:
        customer_id: Optional customer UUID (for org API keys with multiple customers).
    """
    resolved_customer_id = _get_customer_id(ctx)
    if customer_id:
        resolved_customer_id = UUID(customer_id)

    service = _get_wizard_service()
    server = await service.start_wizard_session(customer_id=resolved_customer_id)
    return {"server_id": str(server.id)}


@meta_mcp.tool()
async def wizard_chat(
    server_id: str,
    message: str,
    ctx: Context,
) -> dict[str, Any]:
    """Send a message in the wizard requirements-gathering chat.

    Iterate on server requirements with the AI until it indicates readiness
    (is_ready=True). Then call wizard_start with the server_id to kick off
    tool suggestion.

    Args:
        server_id: Server UUID (from wizard_create_session).
        message: Your message to the AI.
    """
    sid = UUID(server_id)
    await _require_server_ownership(ctx, sid)

    server = await Provider.mcp_server_repo().get_by_uuid(sid)
    if not server:
        raise ValueError(f"Server {sid} not found")
    if server.setup_status != MCPServerSetupStatus.gathering_requirements:
        raise ValueError(
            "Server is not in gathering_requirements state. "
            f"Current state: {server.setup_status.value}"
        )

    service = _get_wizard_service()
    response_text = await service.process_wizard_chat_message(
        mcp_server_id=sid,
        message=message,
    )
    return {
        "server_id": server_id,
        "content": response_text,
        "is_ready": service.is_ready_to_start(response_text),
    }


@meta_mcp.tool()
async def wizard_start(
    server_id: str,
    ctx: Context,
    description: str | None = None,
    technical_details: list[str] | None = None,
) -> dict[str, Any]:
    """Transition from requirements gathering to tool suggestion.

    The server must be in gathering_requirements state and the AI must have
    indicated readiness (wizard_chat returned is_ready=True). Tool suggestion
    runs in the background – poll with wizard_state to check progress.

    Args:
        server_id: Server UUID (from wizard_create_session).
        description: Optional description override (uses chat-derived value if omitted).
        technical_details: Optional technical details override.
    """
    sid = UUID(server_id)
    await _require_server_ownership(ctx, sid)

    server = await Provider.mcp_server_repo().get_by_uuid(sid)
    if not server:
        raise ValueError(f"Server {sid} not found")

    service = _get_wizard_service()

    # Enforce readiness gate
    chat_history: list[dict[str, str]] = (server.meta or {}).get(
        "step_zero_chat_history", []
    )
    has_ready_marker = any(
        service.is_ready_to_start(msg.get("content", ""))
        for msg in chat_history
        if msg.get("role") == "assistant"
    )
    if not has_ready_marker:
        raise ValueError(
            "The specification is not ready to proceed. Continue the conversation until the AI indicates readiness."
        )

    final_description: str = description or server.description or ""

    # Apply any overrides
    update_payload: dict[str, Any] = {}
    if description:
        update_payload["description"] = description
    if technical_details:
        updated_meta: dict[str, Any] = dict(server.meta or {})
        updated_meta["technical_details"] = technical_details
        update_payload["meta"] = updated_meta
    if update_payload:
        _ = await Provider.mcp_server_repo().update(
            server.id, MCPServerUpdate(**update_payload)
        )

    # Generate a descriptive name using LLM
    try:
        name_response = await openai_client.chat.completions.create(
            model=settings.SERVER_DETAILS_GENERATION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Generate a short, descriptive name "
                        "(2-4 words) for an MCP server based "
                        "on this description: "
                        f"{final_description}. "
                        "Return only the name, nothing else."
                    ),
                }
            ],
            max_tokens=30,
            temperature=0.3,
        )
        generated_name = (
            (name_response.choices[0].message.content or "")
            .strip()
            .strip('"')
            .strip("'")
        )
        if generated_name:
            _ = await Provider.mcp_server_repo().update(
                server.id,
                MCPServerUpdate(name=generated_name),
            )
    except Exception as e:
        logger.warning(f"Failed to generate server name: {e}")

    _ = asyncio.create_task(
        service.step_1a_suggest_tools_for_mcp_server(
            description=final_description,
            mcp_server_id=server.id,
        )
    )

    return {
        "server_id": server_id,
        "status": "processing",
    }


@meta_mcp.tool()
async def wizard_list_tools(server_id: str, ctx: Context) -> list[dict[str, Any]]:
    """List current tools for a server in the wizard.

    Args:
        server_id: Server UUID.
    """
    sid = UUID(server_id)
    await _require_server_ownership(ctx, sid)

    tools = await Provider.mcp_tool_repo().get_tools_for_server(sid)
    return [
        {
            "id": str(tool.id),
            "name": tool.name,
            "description": tool.description,
            "parameters": tool.parameters_schema,
            "code": tool.code,
        }
        for tool in tools
    ]


@meta_mcp.tool()
async def wizard_refine_tools(
    server_id: str,
    feedback: str,
    ctx: Context,
    tool_ids: list[str] | None = None,
) -> dict[str, Any]:
    """Refine suggested tools with feedback.

    Triggers LLM refinement in the background. Poll wizard_state for progress.

    Args:
        server_id: Server UUID.
        feedback: Feedback for the LLM to refine tools.
        tool_ids: Optional list of tool UUIDs to refine. Omit to refine all.
    """
    sid = UUID(server_id)
    await _require_server_ownership(ctx, sid)

    tool_uuid_list = [UUID(tid) for tid in tool_ids] if tool_ids else None

    service = _get_wizard_service()
    _ = asyncio.create_task(
        service.step_1b_refine_suggested_tools(
            mcp_server_id=sid,
            feedback=feedback,
            tool_ids_for_refinement=tool_uuid_list,
        )
    )

    return {
        "server_id": server_id,
        "status": "refining",
    }


@meta_mcp.tool()
async def wizard_submit_tools(
    server_id: str,
    selected_tool_ids: list[str],
    ctx: Context,
) -> dict[str, Any]:
    """Submit the selected tools to proceed to env vars step.

    Unselected tools will be deleted.

    Args:
        server_id: Server UUID.
        selected_tool_ids: List of tool UUIDs to keep.
    """
    sid = UUID(server_id)
    await _require_server_ownership(ctx, sid)

    uuids = [UUID(tid) for tid in selected_tool_ids]

    if len(uuids) > FREE_TIER_MAX_TOOLS:
        raise ValueError(
            f"Free tier allows max {FREE_TIER_MAX_TOOLS} tools. "
            f"You selected {len(uuids)}. Upgrade to paid tier for more."
        )

    service = _get_wizard_service()
    await service.step_1c_submit_selected_tools(
        mcp_server_id=sid,
        selected_tool_ids=uuids,
    )

    _ = asyncio.create_task(
        service.step_2a_suggest_environment_variables_for_mcp_server(
            mcp_server_id=sid,
        )
    )

    return {
        "server_id": server_id,
        "status": "tools_submitted",
        "tools_count": len(uuids),
    }


@meta_mcp.tool()
async def wizard_suggest_env_vars(server_id: str, ctx: Context) -> dict[str, Any]:
    """Trigger environment variable suggestion via LLM.

    Args:
        server_id: Server UUID.
    """
    sid = UUID(server_id)
    await _require_server_ownership(ctx, sid)

    service = _get_wizard_service()
    _ = asyncio.create_task(
        service.step_2a_suggest_environment_variables_for_mcp_server(
            mcp_server_id=sid,
        )
    )

    return {
        "server_id": server_id,
        "status": "suggesting",
    }


@meta_mcp.tool()
async def wizard_list_env_vars(server_id: str, ctx: Context) -> list[dict[str, Any]]:
    """List current environment variables for a server.

    Args:
        server_id: Server UUID.
    """
    sid = UUID(server_id)
    await _require_server_ownership(ctx, sid)

    env_vars = await Provider.environment_variable_repo().get_vars_for_server(sid)
    return [
        {
            "id": str(var.id),
            "name": var.name,
            "description": var.description,
            "value": var.value,
        }
        for var in env_vars
    ]


@meta_mcp.tool()
async def wizard_refine_env_vars(
    server_id: str,
    feedback: str,
    ctx: Context,
) -> dict[str, Any]:
    """Refine suggested environment variables with feedback.

    Triggers LLM refinement in the background.

    Args:
        server_id: Server UUID.
        feedback: Feedback for the LLM to refine env vars.
    """
    sid = UUID(server_id)
    await _require_server_ownership(ctx, sid)

    service = _get_wizard_service()
    _ = asyncio.create_task(
        service.step_2b_refine_suggested_environment_variables_for_mcp_server(
            mcp_server_id=sid,
            feedback=feedback,
        )
    )

    return {
        "server_id": server_id,
        "status": "refining",
    }


@meta_mcp.tool()
async def wizard_submit_env_vars(
    server_id: str,
    values: dict[str, str],
    ctx: Context,
) -> dict[str, Any]:
    """Submit environment variable values.

    Provide values as a mapping of variable UUID to its value.

    Args:
        server_id: Server UUID.
        values: Dict of env var UUID -> value, e.g. {"uuid1": "sk-abc123"}.
    """
    sid = UUID(server_id)
    await _require_server_ownership(ctx, sid)

    uuid_values = {UUID(k): v for k, v in values.items()}

    service = _get_wizard_service()
    await service.step_2c_submit_variables(
        mcp_server_id=sid,
        values=uuid_values,
    )

    return {
        "server_id": server_id,
        "status": "env_vars_submitted",
    }


@meta_mcp.tool()
async def wizard_set_auth(server_id: str, ctx: Context) -> dict[str, Any]:
    """Set up bearer token authentication for the server.

    Generates and returns a Bearer token.

    Args:
        server_id: Server UUID.
    """
    sid = UUID(server_id)
    await _require_server_ownership(ctx, sid)

    service = _get_wizard_service()
    token = await service.step_3_set_header_auth(mcp_server_id=sid)

    return {
        "server_id": server_id,
        "bearer_token": token,
    }


@meta_mcp.tool()
async def wizard_generate_code(server_id: str, ctx: Context) -> dict[str, Any]:
    """Trigger code generation for all tools.

    Runs in the background. Poll wizard_state to check progress.

    Args:
        server_id: Server UUID.
    """
    sid = UUID(server_id)
    await _require_server_ownership(ctx, sid)

    service = _get_wizard_service()
    _ = asyncio.create_task(
        service.step_4_generate_code_for_tools_and_env_vars(
            mcp_server_id=sid,
        )
    )

    return {
        "server_id": server_id,
        "status": "code_generating",
    }


@meta_mcp.tool()
async def wizard_regenerate_tool_code(
    server_id: str,
    tool_id: str,
    ctx: Context,
) -> dict[str, Any]:
    """Regenerate code for a single tool (synchronous, waits for LLM).

    Args:
        server_id: Server UUID.
        tool_id: Tool UUID to regenerate code for.
    """
    sid = UUID(server_id)
    tid = UUID(tool_id)
    await _require_server_ownership(ctx, sid)

    service = _get_wizard_service()
    code = await service.regenerate_code_for_tool(
        mcp_server_id=sid,
        tool_id=tid,
    )

    # Remount if deployed so new code takes effect
    if _app_ref and _stack_ref:
        try:
            from entrypoints.mcp.shared_runtime import remount_mcp_server

            _ = await remount_mcp_server(_app_ref, sid, _stack_ref)
        except Exception as e:
            logger.warning(f"Failed to remount server {sid} after regenerate: {e}")

    return {
        "server_id": server_id,
        "tool_id": tool_id,
        "code": code,
    }


@meta_mcp.tool()
async def wizard_deploy(server_id: str, ctx: Context) -> dict[str, Any]:
    """Deploy the MCP server to the shared runtime.

    Args:
        server_id: Server UUID.
    """
    sid = UUID(server_id)
    await _require_server_ownership(ctx, sid)

    if not _app_ref or not _stack_ref:
        raise RuntimeError("MCP runtime not initialized – cannot deploy")

    server = await Provider.mcp_server_repo().get_by_uuid(sid)
    if not server:
        raise ValueError(f"Server {sid} not found")

    valid_states = {
        MCPServerSetupStatus.code_gen,
        MCPServerSetupStatus.deployment_selection,
    }
    if server.setup_status.value not in valid_states:
        raise ValueError(
            f"Server must be in code_gen or deployment_selection state. "
            f"Current state: {server.setup_status.value}"
        )

    service = _get_wizard_service()
    endpoint_url, bearer_token = await service.step_5_deploy_to_shared(
        sid, _app_ref, _stack_ref
    )

    return {
        "server_url": endpoint_url,
        "bearer_token": bearer_token,
        "step": "complete",
    }


@meta_mcp.tool()
async def wizard_state(server_id: str, ctx: Context) -> dict[str, Any]:
    """Get the current wizard state for a server.

    Use this to poll for background operation completion
    (tool suggestion, code generation, etc.).

    Args:
        server_id: Server UUID.
    """
    sid = UUID(server_id)
    await _require_server_ownership(ctx, sid)

    server = await Provider.mcp_server_repo().get_by_uuid(sid)
    if not server:
        raise ValueError(f"Server {sid} not found")

    tools = await Provider.mcp_tool_repo().get_tools_for_server(sid)
    env_vars = await Provider.environment_variable_repo().get_vars_for_server(sid)
    api_key = await Provider.static_api_key_repo().get_by_server_id(sid)

    # Deployment info
    deployment = await Provider.deployment_repo().get_by_server_id(sid)
    deployment_info = None
    if deployment:
        deployment_info = {
            "id": str(deployment.id),
            "target": deployment.target,
            "status": deployment.status,
            "endpoint_url": deployment.endpoint_url,
            "error_message": deployment.error_message,
            "deployed_at": deployment.deployed_at.isoformat()
            if deployment.deployed_at
            else None,
        }

    # Map setup_status to wizard step
    from entrypoints.api.routes.wizard import (
        get_processing_status,
        map_setup_status_to_wizard_step,
    )

    setup_status = server.setup_status
    wizard_step = map_setup_status_to_wizard_step(setup_status)
    processing_status = get_processing_status(setup_status)
    processing_error = server.processing_error

    server_url = deployment.endpoint_url if deployment else None

    return {
        "server_id": str(sid),
        "customer_id": str(server.customer_id),
        "setup_status": setup_status.value,
        "wizard_step": wizard_step.value,
        "processing_status": processing_status,
        "processing_error": processing_error,
        "description": server.description,
        "tools": [
            {
                "id": str(tool.id),
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters_schema,
                "code": tool.code,
            }
            for tool in tools
        ],
        "selected_tool_ids": [str(tool.id) for tool in tools],
        "env_vars": [
            {
                "id": str(var.id),
                "name": var.name,
                "description": var.description,
                "value": var.value,
            }
            for var in env_vars
        ],
        "auth_type": server.auth_type,
        "bearer_token": api_key.key if api_key else None,
        "server_url": server_url,
        "has_auth": api_key is not None,
        "deployment": deployment_info,
    }
