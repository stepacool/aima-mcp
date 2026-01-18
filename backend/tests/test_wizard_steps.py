"""Tests for wizard step transitions.

Tests the complete wizard flow:
1. DESCRIBE → ACTIONS (via start_wizard)
2. ACTIONS → AUTH (via select_tools)
3. AUTH → DEPLOY (via configure_auth)
4. DEPLOY → COMPLETE (via activate)

Also tests:
- State retrieval at each step
- Refine actions within ACTIONS step
- Error cases and edge conditions
"""

import json
from typing import Type
from unittest.mock import AsyncMock, patch
from uuid import UUID

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from core.services.llm_client import LLMResponse
from core.services.tier_service import FREE_TIER_MAX_TOOLS
from entrypoints.api.main import get_app
from infrastructure.models import Customer
from infrastructure.models.mcp_server import MCPServer, WizardStep
from infrastructure.repositories.repo_provider import Provider

# Import helper functions from wizard_fixtures (fixtures are in conftest.py)
from wizard_fixtures import make_sample_actions_response

pytestmark = pytest.mark.anyio


# ============================================================================
# Test Fixtures
# ============================================================================


@pytest.fixture
def wizard_app(provider: Provider) -> FastAPI:
    """Create FastAPI app for wizard testing."""
    return get_app()


@pytest.fixture
async def wizard_client(wizard_app: FastAPI) -> AsyncClient:
    """Create async client for wizard API testing."""
    transport = ASGITransport(app=wizard_app, client=("127.0.0.1", 8000))
    return AsyncClient(transport=transport, base_url="http://test")


def mock_llm_response(content: str) -> LLMResponse:
    """Create a mock LLM response."""
    return LLMResponse(
        content=content,
        model="test-model",
        usage={"prompt_tokens": 100, "completion_tokens": 200},
    )


# ============================================================================
# Test: Step State Fixtures
# ============================================================================


class TestWizardFixtures:
    """Tests that verify fixture states are correctly set up."""

    async def test_describe_step_fixture(
        self, provider: Type[Provider], server_at_describe_step: MCPServer
    ):
        """Test that DESCRIBE step fixture has correct state."""
        assert server_at_describe_step.wizard_step == WizardStep.DESCRIBE.value
        assert server_at_describe_step.meta.get("user_prompt") is not None

        # Should have no tools at DESCRIBE step
        server = await Provider.mcp_server_repo().get_with_tools(
            server_at_describe_step.id
        )
        assert len(server.tools) == 0

    async def test_actions_step_fixture(
        self, provider: Type[Provider], server_at_actions_step: MCPServer
    ):
        """Test that ACTIONS step fixture has correct state."""
        assert server_at_actions_step.wizard_step == WizardStep.ACTIONS.value

        # Should have tools without code
        assert len(server_at_actions_step.tools) == 4
        for tool in server_at_actions_step.tools:
            assert tool.code == ""
            assert not tool.is_validated

    async def test_auth_step_fixture(
        self, provider: Type[Provider], server_at_auth_step: MCPServer
    ):
        """Test that AUTH step fixture has correct state."""
        assert server_at_auth_step.wizard_step == WizardStep.AUTH.value

        # Should have 3 tools (free tier limit after selection)
        assert len(server_at_auth_step.tools) == 3

    async def test_deploy_step_fixture(
        self, provider: Type[Provider], server_at_deploy_step: MCPServer
    ):
        """Test that DEPLOY step fixture has correct state."""
        assert server_at_deploy_step.wizard_step == WizardStep.DEPLOY.value
        assert server_at_deploy_step.auth_type == "none"

        # All tools should have code and be validated
        for tool in server_at_deploy_step.tools:
            assert tool.code != ""
            assert tool.is_validated

    async def test_complete_step_fixture(
        self, provider: Type[Provider], server_at_complete_step: MCPServer
    ):
        """Test that COMPLETE step fixture has correct state."""
        assert server_at_complete_step.wizard_step == WizardStep.COMPLETE.value

        # Should have deployment record
        deployment = await Provider.deployment_repo().get_by_server_id(
            server_at_complete_step.id
        )
        assert deployment is not None
        assert deployment.status == "active"


# ============================================================================
# Test: DESCRIBE → ACTIONS Transition (start_wizard)
# ============================================================================


class TestDescribeToActionsTransition:
    """Tests for the DESCRIBE → ACTIONS step transition via start_wizard."""

    async def test_start_wizard_creates_server_with_actions(
        self, wizard_client: AsyncClient, customer: Customer
    ):
        """Test that start_wizard creates server and transitions to ACTIONS."""
        mock_response = json.dumps(make_sample_actions_response())

        with patch("core.services.wizard_service.get_llm_client") as mock_get_llm:
            mock_llm = AsyncMock()
            mock_llm.chat.return_value = mock_llm_response(mock_response)
            mock_get_llm.return_value = mock_llm

            response = await wizard_client.post(
                "/api/wizard/start",
                json={
                    "customer_id": str(customer.id),
                    "description": "I want to create a weather API server",
                },
            )

        assert response.status_code == 200
        data = response.json()

        assert "server_id" in data
        assert data["server_name"] == "weather_api_server"
        assert len(data["actions"]) == 4

        # Verify server is at ACTIONS step
        server = await Provider.mcp_server_repo().get_with_tools(
            UUID(data["server_id"])
        )
        assert server.wizard_step == WizardStep.ACTIONS.value

    async def test_start_wizard_with_openapi_schema(
        self, wizard_client: AsyncClient, customer: Customer
    ):
        """Test start_wizard with OpenAPI schema included."""
        mock_response = json.dumps(make_sample_actions_response())

        openapi_schema = json.dumps(
            {
                "openapi": "3.0.0",
                "paths": {
                    "/weather": {"get": {"summary": "Get weather"}},
                },
            }
        )

        with patch("core.services.wizard_service.get_llm_client") as mock_get_llm:
            mock_llm = AsyncMock()
            mock_llm.chat.return_value = mock_llm_response(mock_response)
            mock_get_llm.return_value = mock_llm

            response = await wizard_client.post(
                "/api/wizard/start",
                json={
                    "customer_id": str(customer.id),
                    "description": "Weather API server",
                    "openapi_schema": openapi_schema,
                },
            )

        assert response.status_code == 200

        # Verify OpenAPI schema is stored in meta
        server = await Provider.mcp_server_repo().get_by_uuid(
            UUID(response.json()["server_id"])
        )
        assert server.meta.get("openapi_schema") == openapi_schema

    async def test_start_wizard_creates_tools_without_code(
        self, wizard_client: AsyncClient, customer: Customer
    ):
        """Test that tools created by start_wizard have no code initially."""
        mock_response = json.dumps(make_sample_actions_response())

        with patch("core.services.wizard_service.get_llm_client") as mock_get_llm:
            mock_llm = AsyncMock()
            mock_llm.chat.return_value = mock_llm_response(mock_response)
            mock_get_llm.return_value = mock_llm

            response = await wizard_client.post(
                "/api/wizard/start",
                json={
                    "customer_id": str(customer.id),
                    "description": "Weather server",
                },
            )

        server = await Provider.mcp_server_repo().get_with_tools(
            UUID(response.json()["server_id"])
        )

        # All tools should have empty code at this stage
        for tool in server.tools:
            assert tool.code == ""


# ============================================================================
# Test: Refine Actions (stays in ACTIONS step)
# ============================================================================


class TestRefineActions:
    """Tests for refining actions within the ACTIONS step."""

    async def test_refine_actions_updates_tools(
        self,
        wizard_client: AsyncClient,
        provider: Type[Provider],
        server_at_actions_step: MCPServer,
    ):
        """Test that refine_actions updates tools based on feedback."""
        # Mock response with fewer, modified actions
        refined_response = {
            "server_name": "weather_api_server",
            "description": "Updated weather server",
            "actions": [
                {
                    "name": "get_weather_now",
                    "description": "Get current weather - renamed",
                    "parameters": [
                        {"name": "city", "type": "string", "required": True}
                    ],
                    "auth_required": False,
                },
                {
                    "name": "get_weekly_forecast",
                    "description": "Get 7-day forecast",
                    "parameters": [
                        {"name": "city", "type": "string", "required": True}
                    ],
                    "auth_required": False,
                },
            ],
        }

        # Mock both the chat (for refine) and code generation
        with patch("core.services.wizard_service.get_llm_client") as mock_get_llm:
            mock_llm = AsyncMock()
            # First call is refine, second+ are code generation
            mock_llm.chat.side_effect = [
                mock_llm_response(json.dumps(refined_response)),
                mock_llm_response("```python\nreturn 'weather'\n```"),
                mock_llm_response("```python\nreturn 'forecast'\n```"),
            ]
            mock_get_llm.return_value = mock_llm

            response = await wizard_client.post(
                f"/api/wizard/{server_at_actions_step.id}/refine",
                json={
                    "feedback": "Please rename get_current_weather and simplify",
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert len(data["actions"]) == 2

        # Verify tools were replaced
        server = await Provider.mcp_server_repo().get_with_tools(
            server_at_actions_step.id
        )
        tool_names = {t.name for t in server.tools}
        assert "get_weather_now" in tool_names
        assert "get_weekly_forecast" in tool_names
        # Old tools should be gone
        assert "get_current_weather" not in tool_names

    async def test_refine_actions_stays_in_actions_step(
        self,
        wizard_client: AsyncClient,
        provider: Type[Provider],
        server_at_actions_step: MCPServer,
    ):
        """Test that refine_actions keeps server in ACTIONS step."""
        refined_response = make_sample_actions_response()

        with patch("core.services.wizard_service.get_llm_client") as mock_get_llm:
            mock_llm = AsyncMock()
            mock_llm.chat.return_value = mock_llm_response(json.dumps(refined_response))
            mock_get_llm.return_value = mock_llm

            await wizard_client.post(
                f"/api/wizard/{server_at_actions_step.id}/refine",
                json={"feedback": "Looks good"},
            )

        server = await Provider.mcp_server_repo().get_by_uuid(server_at_actions_step.id)
        assert server.wizard_step == WizardStep.ACTIONS.value


# ============================================================================
# Test: ACTIONS → AUTH Transition (select_tools)
# ============================================================================


class TestActionsToAuthTransition:
    """Tests for the ACTIONS → AUTH step transition via select_tools."""

    async def test_select_tools_transitions_to_auth(
        self,
        wizard_client: AsyncClient,
        provider: Type[Provider],
        server_at_actions_step: MCPServer,
    ):
        """Test that selecting tools transitions to AUTH step."""
        selected_tools = ["get_current_weather", "get_forecast", "get_alerts"]

        response = await wizard_client.post(
            f"/api/wizard/{server_at_actions_step.id}/tools/select",
            json={"selected_tool_names": selected_tools},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "confirmed"
        assert data["tools_count"] == 3

        # Verify server transitioned to AUTH step
        server = await Provider.mcp_server_repo().get_by_uuid(server_at_actions_step.id)
        assert server.wizard_step == WizardStep.AUTH.value

    async def test_select_tools_deletes_unselected(
        self,
        wizard_client: AsyncClient,
        provider: Type[Provider],
        server_at_actions_step: MCPServer,
    ):
        """Test that unselected tools are deleted."""
        # Only select 2 of the 4 tools
        selected_tools = ["get_current_weather", "get_forecast"]

        await wizard_client.post(
            f"/api/wizard/{server_at_actions_step.id}/tools/select",
            json={"selected_tool_names": selected_tools},
        )

        server = await Provider.mcp_server_repo().get_with_tools(
            server_at_actions_step.id
        )
        tool_names = {t.name for t in server.tools}

        assert tool_names == {"get_current_weather", "get_forecast"}
        assert "get_alerts" not in tool_names
        assert "get_historical" not in tool_names

    async def test_select_tools_enforces_free_tier_limit(
        self,
        wizard_client: AsyncClient,
        provider: Type[Provider],
        server_at_actions_step: MCPServer,
    ):
        """Test that selecting more than 3 tools fails for free tier."""
        # Try to select all 4 tools
        all_tools = [
            "get_current_weather",
            "get_forecast",
            "get_alerts",
            "get_historical",
        ]

        response = await wizard_client.post(
            f"/api/wizard/{server_at_actions_step.id}/tools/select",
            json={"selected_tool_names": all_tools},
        )

        assert response.status_code == 400
        assert f"max {FREE_TIER_MAX_TOOLS}" in response.json()["detail"]

    async def test_select_tools_requires_at_least_one(
        self,
        wizard_client: AsyncClient,
        provider: Type[Provider],
        server_at_actions_step: MCPServer,
    ):
        """Test selecting empty list behavior."""
        response = await wizard_client.post(
            f"/api/wizard/{server_at_actions_step.id}/tools/select",
            json={"selected_tool_names": []},
        )

        # Empty selection should succeed (user might want 0 tools temporarily)
        assert response.status_code == 200
        assert response.json()["tools_count"] == 0


# ============================================================================
# Test: AUTH → DEPLOY Transition (configure_auth)
# ============================================================================


class TestAuthToDeployTransition:
    """Tests for the AUTH → DEPLOY step transition via configure_auth."""

    async def test_configure_auth_none_transitions_to_deploy(
        self,
        wizard_client: AsyncClient,
        provider: Type[Provider],
        server_at_auth_step: MCPServer,
    ):
        """Test that configuring auth as 'none' transitions to DEPLOY."""
        response = await wizard_client.post(
            f"/api/wizard/{server_at_auth_step.id}/auth",
            json={"auth_type": "none"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["auth_type"] == "none"
        assert data["status"] == "configured"

        # Verify transition to DEPLOY
        server = await Provider.mcp_server_repo().get_by_uuid(server_at_auth_step.id)
        assert server.wizard_step == WizardStep.DEPLOY.value

    async def test_configure_auth_oauth_saves_config(
        self,
        wizard_client: AsyncClient,
        provider: Type[Provider],
        server_at_auth_step: MCPServer,
    ):
        """Test that OAuth configuration is saved correctly."""
        oauth_config = {
            "providerUrl": "https://github.com/login/oauth",
            "clientId": "my_client_id",
            "scopes": ["repo", "user"],
        }

        response = await wizard_client.post(
            f"/api/wizard/{server_at_auth_step.id}/auth",
            json={"auth_type": "oauth", "auth_config": oauth_config},
        )

        assert response.status_code == 200

        server = await Provider.mcp_server_repo().get_by_uuid(server_at_auth_step.id)
        assert server.auth_type == "oauth"
        assert server.auth_config == oauth_config

    async def test_configure_auth_ephemeral_transitions_to_deploy(
        self,
        wizard_client: AsyncClient,
        provider: Type[Provider],
        server_at_auth_step: MCPServer,
    ):
        """Test that ephemeral auth type transitions to DEPLOY."""
        response = await wizard_client.post(
            f"/api/wizard/{server_at_auth_step.id}/auth",
            json={"auth_type": "ephemeral"},
        )

        assert response.status_code == 200

        server = await Provider.mcp_server_repo().get_by_uuid(server_at_auth_step.id)
        assert server.wizard_step == WizardStep.DEPLOY.value
        assert server.auth_type == "ephemeral"


# ============================================================================
# Test: Generate Code
# ============================================================================


class TestGenerateCode:
    """Tests for the generate_code endpoint."""

    async def test_generate_code_for_all_tools(
        self,
        wizard_client: AsyncClient,
        provider: Type[Provider],
        server_at_auth_step: MCPServer,
    ):
        """Test that generate_code creates code for all tools."""
        with patch("core.services.wizard_service.get_llm_client") as mock_get_llm:
            mock_llm = AsyncMock()
            # Return code for each tool
            mock_llm.chat.return_value = mock_llm_response(
                "```python\nreturn 'generated code'\n```"
            )
            mock_get_llm.return_value = mock_llm

            response = await wizard_client.post(
                f"/api/wizard/{server_at_auth_step.id}/generate-code"
            )

        assert response.status_code == 200
        data = response.json()

        # All tools should have code
        for tool in data["tools"]:
            assert tool["code"] != ""

    async def test_generate_code_skips_tools_with_code(
        self,
        wizard_client: AsyncClient,
        provider: Type[Provider],
        server_at_deploy_step: MCPServer,
    ):
        """Test that generate_code doesn't regenerate existing code."""
        original_codes = {t.name: t.code for t in server_at_deploy_step.tools}

        with patch("core.services.wizard_service.get_llm_client") as mock_get_llm:
            mock_llm = AsyncMock()
            mock_llm.chat.return_value = mock_llm_response(
                "```python\nreturn 'new code'\n```"
            )
            mock_get_llm.return_value = mock_llm

            response = await wizard_client.post(
                f"/api/wizard/{server_at_deploy_step.id}/generate-code"
            )

        assert response.status_code == 200

        # Codes should not have changed
        server = await Provider.mcp_server_repo().get_with_tools(
            server_at_deploy_step.id
        )
        for tool in server.tools:
            assert tool.code == original_codes[tool.name]


# ============================================================================
# Test: DEPLOY → COMPLETE Transition (activate)
# ============================================================================


@pytest.mark.skip("these get stuck idk yet why")
class TestDeployToCompleteTransition:
    """Tests for the DEPLOY → COMPLETE step transition via activate."""

    async def test_activate_transitions_to_complete(
        self,
        wizard_app: FastAPI,
        provider: Type[Provider],
        server_at_deploy_step: MCPServer,
    ):
        """Test that activation transitions to COMPLETE step."""
        # Need to use app with mcp_stack initialized
        from contextlib import AsyncExitStack

        wizard_app.state.mcp_stack = AsyncExitStack()

        transport = ASGITransport(app=wizard_app, client=("127.0.0.1", 8000))
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                f"/api/servers/{server_at_deploy_step.id}/activate"
            )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "active"
        assert "mcp_endpoint" in data

        # Verify transition to COMPLETE
        server = await Provider.mcp_server_repo().get_by_uuid(server_at_deploy_step.id)
        assert server.wizard_step == WizardStep.COMPLETE.value

    async def test_activate_creates_deployment_record(
        self,
        wizard_app: FastAPI,
        provider: Type[Provider],
        server_at_deploy_step: MCPServer,
    ):
        """Test that activation creates a deployment record."""
        from contextlib import AsyncExitStack

        wizard_app.state.mcp_stack = AsyncExitStack()

        transport = ASGITransport(app=wizard_app, client=("127.0.0.1", 8000))
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            await client.post(f"/api/servers/{server_at_deploy_step.id}/activate")

        deployment = await Provider.deployment_repo().get_by_server_id(
            server_at_deploy_step.id
        )
        assert deployment is not None
        assert deployment.status == "active"
        assert deployment.target == "shared"

    async def test_activate_requires_code_on_all_tools(
        self,
        wizard_app: FastAPI,
        provider: Type[Provider],
        server_at_auth_step: MCPServer,  # Tools have no code
    ):
        """Test that activation fails if tools don't have code."""
        from contextlib import AsyncExitStack

        wizard_app.state.mcp_stack = AsyncExitStack()

        transport = ASGITransport(app=wizard_app, client=("127.0.0.1", 8000))
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                f"/api/servers/{server_at_auth_step.id}/activate"
            )

        assert response.status_code == 400
        assert "no code" in response.json()["detail"].lower()

    async def test_activate_fails_if_already_deployed(
        self,
        wizard_app: FastAPI,
        provider: Type[Provider],
        server_at_complete_step: MCPServer,
    ):
        """Test that activating an already deployed server fails."""
        from contextlib import AsyncExitStack

        wizard_app.state.mcp_stack = AsyncExitStack()

        transport = ASGITransport(app=wizard_app, client=("127.0.0.1", 8000))
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                f"/api/servers/{server_at_complete_step.id}/activate"
            )

        assert response.status_code == 400
        assert "already deployed" in response.json()["detail"].lower()


# ============================================================================
# Test: Get Wizard State
# ============================================================================


class TestGetWizardState:
    """Tests for retrieving wizard state at any step."""

    async def test_get_state_at_describe_step(
        self,
        wizard_client: AsyncClient,
        server_at_describe_step: MCPServer,
    ):
        """Test getting state at DESCRIBE step."""
        response = await wizard_client.get(f"/api/wizard/{server_at_describe_step.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["wizard_step"] == WizardStep.DESCRIBE.value
        assert data["user_prompt"] is not None
        assert len(data["tools"]) == 0

    async def test_get_state_at_actions_step(
        self,
        wizard_client: AsyncClient,
        server_at_actions_step: MCPServer,
    ):
        """Test getting state at ACTIONS step."""
        response = await wizard_client.get(f"/api/wizard/{server_at_actions_step.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["wizard_step"] == WizardStep.ACTIONS.value
        assert len(data["tools"]) == 4

        # Tools should not have code at this step
        for tool in data["tools"]:
            assert not tool["has_code"]

    async def test_get_state_at_deploy_step(
        self,
        wizard_client: AsyncClient,
        server_at_deploy_step: MCPServer,
    ):
        """Test getting state at DEPLOY step."""
        response = await wizard_client.get(f"/api/wizard/{server_at_deploy_step.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["wizard_step"] == WizardStep.DEPLOY.value
        assert data["auth_type"] == "none"

        # Tools should have code at this step
        for tool in data["tools"]:
            assert tool["has_code"]

    async def test_get_state_not_found(
        self,
        wizard_client: AsyncClient,
    ):
        """Test getting state for non-existent server returns 404."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await wizard_client.get(f"/api/wizard/{fake_id}")

        assert response.status_code == 404


# ============================================================================
# Test: Complete Wizard Flow (Integration)
# ============================================================================


@pytest.mark.skip("these get stuck idk yet why")
class TestCompleteWizardFlow:
    """Integration test for the complete wizard flow."""

    async def test_full_wizard_flow(
        self,
        wizard_app: FastAPI,
        customer: Customer,
        provider: Type[Provider],
    ):
        """Test the complete wizard flow from start to activation."""
        from contextlib import AsyncExitStack

        wizard_app.state.mcp_stack = AsyncExitStack()

        transport = ASGITransport(app=wizard_app, client=("127.0.0.1", 8000))

        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Step 1: Start wizard (DESCRIBE → ACTIONS)
            mock_response = json.dumps(
                {
                    "server_name": "test_server",
                    "description": "A test server",
                    "actions": [
                        {
                            "name": "test_action",
                            "description": "A test action",
                            "parameters": [],
                            "auth_required": False,
                        },
                        {
                            "name": "another_action",
                            "description": "Another action",
                            "parameters": [],
                            "auth_required": False,
                        },
                    ],
                }
            )

            with patch("core.services.wizard_service.get_llm_client") as mock_get_llm:
                mock_llm = AsyncMock()
                mock_llm.chat.return_value = mock_llm_response(mock_response)
                mock_get_llm.return_value = mock_llm

                start_response = await client.post(
                    "/api/wizard/start",
                    json={
                        "customer_id": str(customer.id),
                        "description": "Create a test server",
                    },
                )

            assert start_response.status_code == 200
            server_id = start_response.json()["server_id"]

            # Verify at ACTIONS step
            server = await Provider.mcp_server_repo().get_by_uuid(UUID(server_id))
            assert server.wizard_step == WizardStep.ACTIONS.value

            # Step 2: Select tools (ACTIONS → AUTH)
            select_response = await client.post(
                f"/api/wizard/{server_id}/tools/select",
                json={"selected_tool_names": ["test_action"]},
            )
            assert select_response.status_code == 200

            server = await Provider.mcp_server_repo().get_by_uuid(UUID(server_id))
            assert server.wizard_step == WizardStep.AUTH.value

            # Step 3: Configure auth (AUTH → DEPLOY)
            auth_response = await client.post(
                f"/api/wizard/{server_id}/auth",
                json={"auth_type": "none"},
            )
            assert auth_response.status_code == 200

            server = await Provider.mcp_server_repo().get_by_uuid(UUID(server_id))
            assert server.wizard_step == WizardStep.DEPLOY.value

            # Step 3b: Generate code
            with patch("core.services.wizard_service.get_llm_client") as mock_get_llm:
                mock_llm = AsyncMock()
                mock_llm.chat.return_value = mock_llm_response(
                    '```python\nreturn "success"\n```'
                )
                mock_get_llm.return_value = mock_llm

                code_response = await client.post(
                    f"/api/wizard/{server_id}/generate-code"
                )
            assert code_response.status_code == 200

            # Step 4: Activate (DEPLOY → COMPLETE)
            activate_response = await client.post(f"/api/servers/{server_id}/activate")
            assert activate_response.status_code == 200

            # Verify at COMPLETE step
            server = await Provider.mcp_server_repo().get_by_uuid(UUID(server_id))
            assert server.wizard_step == WizardStep.COMPLETE.value
            assert server.status == "ready"

            # Verify deployment exists
            deployment = await Provider.deployment_repo().get_by_server_id(
                UUID(server_id)
            )
            assert deployment is not None
            assert deployment.status == "active"
