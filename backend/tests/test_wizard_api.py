"""Tests for wizard API endpoints."""

from typing import Type
from unittest.mock import patch
from uuid import uuid4

import pytest
from httpx import AsyncClient

from infrastructure.models import Customer
from infrastructure.models.mcp_server import MCPServer, MCPServerSetupStatus
from infrastructure.repositories.mcp_server import (
    MCPEnvironmentVariableCreate,
    MCPServerCreate,
    MCPToolCreate,
)
from infrastructure.repositories.repo_provider import Provider


@pytest.fixture
async def wizard_server(provider: Type[Provider], customer: Customer) -> MCPServer:
    """Create an MCP server for wizard testing."""
    server = await Provider.mcp_server_repo().create(
        MCPServerCreate(
            name="wizard_test_server",
            description="Test server for wizard",
            customer_id=customer.id,
            auth_type="none",
        )
    )
    return server


@pytest.fixture
async def server_with_tools(
    provider: Type[Provider], wizard_server: MCPServer
) -> MCPServer:
    """Create a server with tools for testing."""
    for i in range(3):
        await Provider.mcp_tool_repo().create(
            MCPToolCreate(
                server_id=wizard_server.id,
                name=f"tool_{i}",
                description=f"Test tool {i}",
                parameters_schema=[],
                code="return 'test'",
            )
        )
    return wizard_server


@pytest.fixture
async def server_with_env_vars(
    provider: Type[Provider], wizard_server: MCPServer
) -> MCPServer:
    """Create a server with environment variables for testing."""
    for i in range(2):
        await Provider.environment_variable_repo().create(
            MCPEnvironmentVariableCreate(
                server_id=wizard_server.id,
                name=f"ENV_VAR_{i}",
                description=f"Test environment variable {i}",
            )
        )
    return wizard_server


class TestStartWizard:
    """Tests for POST /wizard/start endpoint."""

    @pytest.mark.anyio
    async def test_start_wizard_creates_server(
        self, api_client: AsyncClient, customer: Customer, provider: Type[Provider]
    ) -> None:
        """Test that starting wizard creates a server."""
        with patch(
            "core.services.wizard_steps_services.WizardStepsService"
            ".step_1a_suggest_tools_for_mcp_server"
        ) as mock_suggest:
            mock_suggest.return_value = []

            response = await api_client.post(
                "/api/wizard/start",
                json={
                    "customer_id": str(customer.id),
                    "description": "A test server for managing tasks",
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert "server_id" in data
        assert data["status"] == "processing"

    @pytest.mark.anyio
    async def test_start_wizard_with_invalid_customer_id(
        self, api_client: AsyncClient, provider: Type[Provider]
    ) -> None:
        """Test that starting wizard with invalid customer fails."""
        response = await api_client.post(
            "/api/wizard/start",
            json={
                "customer_id": str(uuid4()),
                "description": "Test description",
            },
        )
        # Should fail at database level due to FK constraint
        assert response.status_code == 500


class TestRefineTools:
    """Tests for POST /wizard/{server_id}/tools/refine endpoint."""

    @pytest.mark.anyio
    async def test_refine_tools_returns_refining_status(
        self,
        api_client: AsyncClient,
        server_with_tools: MCPServer,
        provider: Type[Provider],
    ) -> None:
        """Test that refine tools returns refining status."""
        with patch(
            "core.services.wizard_steps_services.WizardStepsService"
            ".step_1b_refine_suggested_tools"
        ):
            response = await api_client.post(
                f"/api/wizard/{server_with_tools.id}/tools/refine",
                json={"feedback": "Add more tools for file management"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "refining"

    @pytest.mark.anyio
    async def test_refine_tools_with_tool_ids(
        self,
        api_client: AsyncClient,
        server_with_tools: MCPServer,
        provider: Type[Provider],
    ) -> None:
        """Test that refine tools accepts specific tool IDs."""
        tools = await Provider.mcp_tool_repo().get_tools_for_server(
            server_with_tools.id
        )

        with patch(
            "core.services.wizard_steps_services.WizardStepsService"
            ".step_1b_refine_suggested_tools"
        ):
            response = await api_client.post(
                f"/api/wizard/{server_with_tools.id}/tools/refine",
                json={
                    "feedback": "Improve these tools",
                    "tool_ids": [str(tools[0].id)],
                },
            )

        assert response.status_code == 200

    @pytest.mark.anyio
    async def test_refine_tools_server_not_found(
        self, api_client: AsyncClient, provider: Type[Provider]
    ) -> None:
        """Test that refine tools returns 404 for non-existent server."""
        response = await api_client.post(
            f"/api/wizard/{uuid4()}/tools/refine",
            json={"feedback": "Test feedback"},
        )
        assert response.status_code == 404


class TestSubmitTools:
    """Tests for POST /wizard/{server_id}/tools/submit endpoint."""

    @pytest.mark.anyio
    async def test_submit_tools_transitions_status(
        self,
        api_client: AsyncClient,
        server_with_tools: MCPServer,
        provider: Type[Provider],
    ) -> None:
        """Test that submitting tools updates server status."""
        tools = await Provider.mcp_tool_repo().get_tools_for_server(
            server_with_tools.id
        )
        selected_ids = [str(tools[0].id), str(tools[1].id)]

        response = await api_client.post(
            f"/api/wizard/{server_with_tools.id}/tools/submit",
            json={"selected_tool_ids": selected_ids},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "tools_submitted"
        assert data["tools_count"] == 2

        # Verify server status was updated
        server = await Provider.mcp_server_repo().get_by_uuid(server_with_tools.id)
        assert server.setup_status == MCPServerSetupStatus.env_vars_setup

    @pytest.mark.anyio
    async def test_submit_tools_deletes_unselected(
        self,
        api_client: AsyncClient,
        server_with_tools: MCPServer,
        provider: Type[Provider],
    ) -> None:
        """Test that unselected tools are deleted."""
        tools = await Provider.mcp_tool_repo().get_tools_for_server(
            server_with_tools.id
        )
        selected_ids = [str(tools[0].id)]

        await api_client.post(
            f"/api/wizard/{server_with_tools.id}/tools/submit",
            json={"selected_tool_ids": selected_ids},
        )

        remaining_tools = await Provider.mcp_tool_repo().get_tools_for_server(
            server_with_tools.id
        )
        assert len(remaining_tools) == 1
        assert remaining_tools[0].id == tools[0].id

    @pytest.mark.anyio
    async def test_submit_tools_exceeds_free_tier_limit(
        self,
        api_client: AsyncClient,
        wizard_server: MCPServer,
        provider: Type[Provider],
    ) -> None:
        """Test that exceeding free tier tool limit fails."""
        # Create 5 tools
        for i in range(5):
            await Provider.mcp_tool_repo().create(
                MCPToolCreate(
                    server_id=wizard_server.id,
                    name=f"tool_{i}",
                    description=f"Test tool {i}",
                    parameters_schema=[],
                    code="return 'test'",
                )
            )

        tools = await Provider.mcp_tool_repo().get_tools_for_server(wizard_server.id)
        all_ids = [str(t.id) for t in tools]

        response = await api_client.post(
            f"/api/wizard/{wizard_server.id}/tools/submit",
            json={"selected_tool_ids": all_ids},
        )

        assert response.status_code == 400
        assert "Free tier allows max" in response.json()["detail"]


class TestGetTools:
    """Tests for GET /wizard/{server_id}/tools endpoint."""

    @pytest.mark.anyio
    async def test_get_tools_returns_list(
        self,
        api_client: AsyncClient,
        server_with_tools: MCPServer,
        provider: Type[Provider],
    ) -> None:
        """Test that get tools returns list of tools."""
        response = await api_client.get(f"/api/wizard/{server_with_tools.id}/tools")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        assert all("id" in t and "name" in t for t in data)


class TestSuggestEnvVars:
    """Tests for POST /wizard/{server_id}/env-vars/suggest endpoint."""

    @pytest.mark.anyio
    async def test_suggest_env_vars_returns_suggesting_status(
        self,
        api_client: AsyncClient,
        wizard_server: MCPServer,
        provider: Type[Provider],
    ) -> None:
        """Test that suggest env vars returns suggesting status."""
        with patch(
            "core.services.wizard_steps_services.WizardStepsService"
            ".step_2a_suggest_environment_variables_for_mcp_server"
        ):
            response = await api_client.post(
                f"/api/wizard/{wizard_server.id}/env-vars/suggest"
            )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "suggesting"


class TestSubmitEnvVars:
    """Tests for POST /wizard/{server_id}/env-vars/submit endpoint."""

    @pytest.mark.anyio
    async def test_submit_env_vars_updates_values(
        self,
        api_client: AsyncClient,
        server_with_env_vars: MCPServer,
        provider: Type[Provider],
    ) -> None:
        """Test that submit env vars updates values."""
        env_vars = await Provider.environment_variable_repo().get_vars_for_server(
            server_with_env_vars.id
        )

        values = {str(v.id): f"value_{i}" for i, v in enumerate(env_vars)}

        response = await api_client.post(
            f"/api/wizard/{server_with_env_vars.id}/env-vars/submit",
            json={"values": values},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "env_vars_submitted"

        # Verify server status was updated
        server = await Provider.mcp_server_repo().get_by_uuid(server_with_env_vars.id)
        assert server.setup_status == MCPServerSetupStatus.auth_selection


class TestGetEnvVars:
    """Tests for GET /wizard/{server_id}/env-vars endpoint."""

    @pytest.mark.anyio
    async def test_get_env_vars_returns_list(
        self,
        api_client: AsyncClient,
        server_with_env_vars: MCPServer,
        provider: Type[Provider],
    ) -> None:
        """Test that get env vars returns list of variables."""
        response = await api_client.get(
            f"/api/wizard/{server_with_env_vars.id}/env-vars"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all("id" in v and "name" in v for v in data)


class TestSetAuth:
    """Tests for POST /wizard/{server_id}/auth endpoint."""

    @pytest.mark.anyio
    async def test_set_auth_returns_bearer_token(
        self,
        api_client: AsyncClient,
        wizard_server: MCPServer,
        provider: Type[Provider],
    ) -> None:
        """Test that set auth returns a bearer token."""
        response = await api_client.post(f"/api/wizard/{wizard_server.id}/auth")

        assert response.status_code == 200
        data = response.json()
        assert "bearer_token" in data
        assert len(data["bearer_token"]) > 20  # Token should be substantial

        # Verify server auth_type was updated
        server = await Provider.mcp_server_repo().get_by_uuid(wizard_server.id)
        assert server.auth_type == "bearer"
        assert server.setup_status == MCPServerSetupStatus.code_gen


class TestGetWizardState:
    """Tests for GET /wizard/{server_id}/state endpoint."""

    @pytest.mark.anyio
    async def test_get_state_returns_aggregated_state(
        self,
        api_client: AsyncClient,
        server_with_tools: MCPServer,
        provider: Type[Provider],
    ) -> None:
        """Test that get state returns aggregated wizard state."""
        response = await api_client.get(f"/api/wizard/{server_with_tools.id}/state")

        assert response.status_code == 200
        data = response.json()
        assert data["server_id"] == str(server_with_tools.id)
        assert "setup_status" in data
        assert "tools" in data
        assert len(data["tools"]) == 3
        assert "env_vars" in data
        assert "has_auth" in data
        assert data["has_auth"] is False

    @pytest.mark.anyio
    async def test_get_state_shows_auth_status(
        self,
        api_client: AsyncClient,
        wizard_server: MCPServer,
        provider: Type[Provider],
    ) -> None:
        """Test that get state shows auth status after setting auth."""
        # First set auth
        await api_client.post(f"/api/wizard/{wizard_server.id}/auth")

        # Then get state
        response = await api_client.get(f"/api/wizard/{wizard_server.id}/state")

        assert response.status_code == 200
        data = response.json()
        assert data["has_auth"] is True
