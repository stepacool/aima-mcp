"""Fixtures for wizard step states and transitions.

Provides fixtures representing MCP servers at each wizard step:
- DESCRIBE: Initial state (just created or resuming)
- ACTIONS: Actions suggested by LLM, waiting for user selection
- AUTH: Actions confirmed, waiting for auth configuration
- DEPLOY: Auth configured and code generated, ready for deployment
- COMPLETE: Server activated and running
"""

from typing import Any, Type
from uuid import UUID

import pytest

from infrastructure.models import Customer
from infrastructure.models.mcp_server import MCPServer, MCPTool, WizardStep
from infrastructure.repositories.mcp_server import MCPServerCreate, MCPToolCreate
from infrastructure.repositories.repo_provider import Provider


# ============================================================================
# Sample Data
# ============================================================================


def make_sample_tool_parameters() -> list[dict[str, Any]]:
    """Sample parameters for a tool."""
    return [
        {
            "name": "query",
            "type": "string",
            "description": "Search query text",
            "required": True,
        },
        {
            "name": "limit",
            "type": "integer",
            "description": "Maximum number of results",
            "required": False,
        },
    ]


def make_sample_tool_code(tool_name: str) -> str:
    """Generate sample tool code for testing."""
    return f'''async def {tool_name}(query: str, limit: int = 10) -> str:
    """Execute {tool_name} operation."""
    import json
    return json.dumps({{"query": query, "limit": limit, "result": "success"}})
'''


def make_sample_actions_response() -> dict[str, Any]:
    """Sample LLM response for action suggestions."""
    return {
        "server_name": "weather_api_server",
        "description": "MCP server for weather data operations",
        "actions": [
            {
                "name": "get_current_weather",
                "description": "Get current weather for a location",
                "parameters": [
                    {
                        "name": "location",
                        "type": "string",
                        "description": "City name or coordinates",
                        "required": True,
                    }
                ],
                "auth_required": False,
            },
            {
                "name": "get_forecast",
                "description": "Get weather forecast for upcoming days",
                "parameters": [
                    {
                        "name": "location",
                        "type": "string",
                        "description": "City name",
                        "required": True,
                    },
                    {
                        "name": "days",
                        "type": "integer",
                        "description": "Number of days to forecast",
                        "required": False,
                    },
                ],
                "auth_required": False,
            },
            {
                "name": "get_alerts",
                "description": "Get weather alerts for a region",
                "parameters": [
                    {
                        "name": "region",
                        "type": "string",
                        "description": "Region code",
                        "required": True,
                    }
                ],
                "auth_required": True,
            },
            {
                "name": "get_historical",
                "description": "Get historical weather data",
                "parameters": [
                    {
                        "name": "location",
                        "type": "string",
                        "description": "Location",
                        "required": True,
                    },
                    {
                        "name": "date",
                        "type": "string",
                        "description": "Date in YYYY-MM-DD format",
                        "required": True,
                    },
                ],
                "auth_required": True,
            },
        ],
    }


# ============================================================================
# Step 1: DESCRIBE - Server just created, no actions yet
# ============================================================================


@pytest.fixture
async def server_at_describe_step(
    provider: Type[Provider], customer: Customer
) -> MCPServer:
    """
    Server at DESCRIBE step - initial state before LLM suggestions.

    This represents the very beginning of the wizard, where a user has
    provided a description but no actions have been generated yet.
    """
    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="weather_server_draft",
            description="A server for weather data",
            customer_id=str(customer.id),
            auth_type="none",
            meta={
                "wizard_step": WizardStep.DESCRIBE.value,
                "user_prompt": "I want to create an MCP server for weather data",
            },
        )
    )
    return server


# ============================================================================
# Step 2: ACTIONS - Actions suggested, waiting for user selection
# ============================================================================


@pytest.fixture
async def server_at_actions_step(
    provider: Type[Provider], customer: Customer
) -> MCPServer:
    """
    Server at ACTIONS step - LLM has suggested actions, waiting for selection.

    This represents the state after start_wizard() is called:
    - Server created with suggested name/description
    - Tools created without code
    - User needs to select which actions to keep
    """
    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="weather_api_server",
            description="MCP server for weather data operations",
            customer_id=str(customer.id),
            auth_type="none",
            meta={
                "wizard_step": WizardStep.ACTIONS.value,
                "user_prompt": "I want to create an MCP server for weather data",
            },
        )
    )

    # Create tools without code (as they come from start_wizard)
    tool_specs = [
        {
            "name": "get_current_weather",
            "description": "Get current weather for a location",
            "parameters": [
                {
                    "name": "location",
                    "type": "string",
                    "description": "City name or coordinates",
                    "required": True,
                }
            ],
        },
        {
            "name": "get_forecast",
            "description": "Get weather forecast for upcoming days",
            "parameters": [
                {
                    "name": "location",
                    "type": "string",
                    "description": "City name",
                    "required": True,
                },
                {
                    "name": "days",
                    "type": "integer",
                    "description": "Number of days",
                    "required": False,
                },
            ],
        },
        {
            "name": "get_alerts",
            "description": "Get weather alerts for a region",
            "parameters": [
                {
                    "name": "region",
                    "type": "string",
                    "description": "Region code",
                    "required": True,
                }
            ],
        },
        {
            "name": "get_historical",
            "description": "Get historical weather data",
            "parameters": [
                {
                    "name": "location",
                    "type": "string",
                    "description": "Location",
                    "required": True,
                },
                {
                    "name": "date",
                    "type": "string",
                    "description": "Date in YYYY-MM-DD format",
                    "required": True,
                },
            ],
        },
    ]

    for spec in tool_specs:
        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=server.id,
                name=spec["name"],
                description=spec["description"],
                parameters_schema={"parameters": spec["parameters"]},
                code="",  # No code yet at ACTIONS step
                is_validated=False,
            )
        )

    # Refresh to get tools loaded
    server = await Provider.mcp_server_repo().get_with_tools(server.id)
    return server


# ============================================================================
# Step 3: AUTH - Actions confirmed, waiting for auth configuration
# ============================================================================


@pytest.fixture
async def server_at_auth_step(
    provider: Type[Provider], customer: Customer
) -> MCPServer:
    """
    Server at AUTH step - user has selected tools, waiting for auth config.

    This represents the state after select_tools is called:
    - Only selected tools remain (others deleted)
    - Tools still may not have code
    - Waiting for auth configuration
    """
    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="weather_api_server",
            description="MCP server for weather data operations",
            customer_id=str(customer.id),
            auth_type="none",
            meta={
                "wizard_step": WizardStep.AUTH.value,
                "user_prompt": "I want to create an MCP server for weather data",
            },
        )
    )

    # Only 3 tools remain after selection (free tier limit)
    selected_tools = [
        {
            "name": "get_current_weather",
            "description": "Get current weather for a location",
            "parameters": [
                {
                    "name": "location",
                    "type": "string",
                    "description": "City name or coordinates",
                    "required": True,
                }
            ],
        },
        {
            "name": "get_forecast",
            "description": "Get weather forecast for upcoming days",
            "parameters": [
                {
                    "name": "location",
                    "type": "string",
                    "description": "City name",
                    "required": True,
                },
                {
                    "name": "days",
                    "type": "integer",
                    "description": "Number of days",
                    "required": False,
                },
            ],
        },
        {
            "name": "get_alerts",
            "description": "Get weather alerts for a region",
            "parameters": [
                {
                    "name": "region",
                    "type": "string",
                    "description": "Region code",
                    "required": True,
                }
            ],
        },
    ]

    for spec in selected_tools:
        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=server.id,
                name=spec["name"],
                description=spec["description"],
                parameters_schema={"parameters": spec["parameters"]},
                code="",  # Code generated after auth in some flows
                is_validated=False,
            )
        )

    server = await Provider.mcp_server_repo().get_with_tools(server.id)
    return server


# ============================================================================
# Step 4: DEPLOY - Auth configured, code generated, ready for deployment
# ============================================================================


def make_validated_tool_code(tool_name: str) -> str:
    """Generate valid tool code that passes tier validation."""
    # Simple code that only uses allowed imports (httpx, json, datetime, re)
    return f'return "{tool_name} executed successfully"'


@pytest.fixture
async def server_at_deploy_step(
    provider: Type[Provider], customer: Customer
) -> MCPServer:
    """
    Server at DEPLOY step - auth configured, code generated, ready to deploy.

    This represents the state after configure_auth and generate_code:
    - Auth type set (e.g., "none", "oauth", "ephemeral")
    - All tools have generated and validated code
    - Ready for activation
    """
    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="weather_api_server",
            description="MCP server for weather data operations",
            customer_id=str(customer.id),
            auth_type="none",  # Auth configured
            auth_config=None,
            meta={
                "wizard_step": WizardStep.DEPLOY.value,
                "user_prompt": "I want to create an MCP server for weather data",
            },
        )
    )

    # Tools with generated code, validated
    tools_with_code = [
        {
            "name": "get_current_weather",
            "description": "Get current weather for a location",
            "parameters": [
                {
                    "name": "location",
                    "type": "string",
                    "description": "City name or coordinates",
                    "required": True,
                }
            ],
            "code": make_validated_tool_code("get_current_weather"),
        },
        {
            "name": "get_forecast",
            "description": "Get weather forecast for upcoming days",
            "parameters": [
                {
                    "name": "location",
                    "type": "string",
                    "description": "City name",
                    "required": True,
                },
                {
                    "name": "days",
                    "type": "integer",
                    "description": "Number of days",
                    "required": False,
                },
            ],
            "code": make_validated_tool_code("get_forecast"),
        },
        {
            "name": "get_alerts",
            "description": "Get weather alerts for a region",
            "parameters": [
                {
                    "name": "region",
                    "type": "string",
                    "description": "Region code",
                    "required": True,
                }
            ],
            "code": make_validated_tool_code("get_alerts"),
        },
    ]

    for spec in tools_with_code:
        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=server.id,
                name=spec["name"],
                description=spec["description"],
                parameters_schema={"parameters": spec["parameters"]},
                code=spec["code"],
                is_validated=True,
            )
        )

    server = await Provider.mcp_server_repo().get_with_tools(server.id)
    return server


# ============================================================================
# Step 5: COMPLETE - Server activated and running
# ============================================================================


@pytest.fixture
async def server_at_complete_step(
    provider: Type[Provider], customer: Customer
) -> MCPServer:
    """
    Server at COMPLETE step - activated and running on shared runtime.

    This represents the final state after activation:
    - Deployment record created
    - Server status set to READY
    - MCP endpoint available
    """
    from infrastructure.models.deployment import DeploymentStatus, DeploymentTarget
    from infrastructure.models.mcp_server import MCPServerStatus
    from infrastructure.repositories.deployment import DeploymentCreate

    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="weather_api_server",
            description="MCP server for weather data operations",
            customer_id=str(customer.id),
            auth_type="none",
            auth_config=None,
            meta={
                "wizard_step": WizardStep.COMPLETE.value,
                "user_prompt": "I want to create an MCP server for weather data",
            },
        )
    )

    # Create validated tools with code
    tools_with_code = [
        {
            "name": "get_current_weather",
            "description": "Get current weather for a location",
            "parameters": [
                {
                    "name": "location",
                    "type": "string",
                    "description": "City name",
                    "required": True,
                }
            ],
            "code": make_validated_tool_code("get_current_weather"),
        },
        {
            "name": "get_forecast",
            "description": "Get weather forecast",
            "parameters": [
                {
                    "name": "location",
                    "type": "string",
                    "description": "City name",
                    "required": True,
                }
            ],
            "code": make_validated_tool_code("get_forecast"),
        },
    ]

    for spec in tools_with_code:
        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=server.id,
                name=spec["name"],
                description=spec["description"],
                parameters_schema={"parameters": spec["parameters"]},
                code=spec["code"],
                is_validated=True,
            )
        )

    # Create deployment record
    await Provider.deployment_repo().create(
        DeploymentCreate(
            server_id=server.id,
            target=DeploymentTarget.SHARED.value,
            status=DeploymentStatus.ACTIVE.value,
            endpoint_url=f"/mcp/{server.id}/mcp",
        )
    )

    # Update server status to READY
    await Provider.mcp_server_repo().update_status(server.id, MCPServerStatus.READY)

    server = await Provider.mcp_server_repo().get_with_tools(server.id)
    return server


# ============================================================================
# OAuth Auth Configuration Fixtures
# ============================================================================


@pytest.fixture
async def server_at_deploy_step_with_oauth(
    provider: Type[Provider], customer: Customer
) -> MCPServer:
    """
    Server at DEPLOY step with OAuth authentication configured.
    """
    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="github_api_server",
            description="MCP server for GitHub API operations",
            customer_id=str(customer.id),
            auth_type="oauth",
            auth_config={
                "providerUrl": "https://github.com/login/oauth",
                "clientId": "test_client_id",
                "scopes": ["repo", "user"],
            },
            meta={
                "wizard_step": WizardStep.DEPLOY.value,
                "user_prompt": "I want to create an MCP server for GitHub",
            },
        )
    )

    await Provider.mcp_tool_repo().create(
        MCPToolCreate(
            server_id=server.id,
            name="list_repos",
            description="List user repositories",
            parameters_schema={"parameters": []},
            code=make_validated_tool_code("list_repos"),
            is_validated=True,
        )
    )

    server = await Provider.mcp_server_repo().get_with_tools(server.id)
    return server


# ============================================================================
# Helper Functions for Tests
# ============================================================================


async def get_server_wizard_step(server_id: UUID) -> str:
    """Get the current wizard step for a server."""
    server = await Provider.mcp_server_repo().get_by_uuid(server_id)
    if not server:
        raise ValueError(f"Server {server_id} not found")
    return server.wizard_step


async def get_server_tool_count(server_id: UUID) -> int:
    """Get the number of tools for a server."""
    server = await Provider.mcp_server_repo().get_with_tools(server_id)
    if not server:
        raise ValueError(f"Server {server_id} not found")
    return len(server.tools)


async def get_server_tools_with_code(server_id: UUID) -> list[MCPTool]:
    """Get tools that have code generated."""
    server = await Provider.mcp_server_repo().get_with_tools(server_id)
    if not server:
        raise ValueError(f"Server {server_id} not found")
    return [t for t in server.tools if t.code]
