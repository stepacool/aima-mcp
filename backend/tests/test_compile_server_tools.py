"""Unit tests for the compile_server_tools helper.

These tests mock the DB layer (env-var repo) and the DynamicToolLoader so
they can run without a real database.
"""

from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from core.services.tool_loader import compile_server_tools


def _make_server(customer_id=None):
    return SimpleNamespace(id=uuid4(), customer_id=customer_id or uuid4())


def _make_tool(name: str, code: str | None = "print('hi')", description="desc"):
    return SimpleNamespace(
        id=uuid4(),
        name=name,
        code=code,
        description=description,
        parameters_schema=[],
    )


def _make_env_var(name: str, value: str | None):
    return SimpleNamespace(name=name, value=value)


def _make_env_var_repo(env_vars=None):
    repo = AsyncMock()
    repo.get_vars_for_server.return_value = env_vars or []
    return repo


# ---- Happy-path tests ----


@pytest.mark.anyio
async def test_compile_all_tools_successfully():
    server = _make_server()
    tools = [_make_tool("tool_a"), _make_tool("tool_b")]
    env_repo = _make_env_var_repo([_make_env_var("API_KEY", "secret")])

    loader = MagicMock()
    loader.compile_tool.return_value = MagicMock(name="compiled")

    result = await compile_server_tools(
        server=server,
        tools=tools,
        env_var_repo=env_repo,
        tool_loader=loader,
    )

    assert len(result) == 2
    assert loader.compile_tool.call_count == 2
    # Verify env vars were fetched
    env_repo.get_vars_for_server.assert_awaited_once_with(server.id)
    # Verify env vars were passed to compile_tool
    call_kwargs = loader.compile_tool.call_args_list[0].kwargs
    assert call_kwargs["env_vars"] == {"API_KEY": "secret"}


@pytest.mark.anyio
async def test_compile_filters_none_env_var_values():
    server = _make_server()
    tools = [_make_tool("t")]
    env_repo = _make_env_var_repo(
        [_make_env_var("SET", "val"), _make_env_var("UNSET", None)]
    )

    loader = MagicMock()
    loader.compile_tool.return_value = MagicMock()

    await compile_server_tools(
        server=server, tools=tools, env_var_repo=env_repo, tool_loader=loader
    )

    call_kwargs = loader.compile_tool.call_args.kwargs
    assert call_kwargs["env_vars"] == {"SET": "val"}


# ---- Skipping / raising on missing code ----


@pytest.mark.anyio
async def test_skip_tool_without_code_by_default():
    server = _make_server()
    tools = [_make_tool("no_code", code=None), _make_tool("has_code")]
    env_repo = _make_env_var_repo()

    loader = MagicMock()
    loader.compile_tool.return_value = MagicMock()

    result = await compile_server_tools(
        server=server, tools=tools, env_var_repo=env_repo, tool_loader=loader
    )

    assert len(result) == 1
    assert loader.compile_tool.call_count == 1


@pytest.mark.anyio
async def test_raise_on_missing_code_when_flag_set():
    server = _make_server()
    tools = [_make_tool("no_code", code=None)]
    env_repo = _make_env_var_repo()

    loader = MagicMock()

    with pytest.raises(ValueError, match="no code"):
        await compile_server_tools(
            server=server,
            tools=tools,
            env_var_repo=env_repo,
            tool_loader=loader,
            raise_on_missing_code=True,
        )


# ---- Compilation errors ----


@pytest.mark.anyio
async def test_compilation_error_logged_but_skipped_by_default():
    server = _make_server()
    tools = [_make_tool("bad"), _make_tool("good")]
    env_repo = _make_env_var_repo()

    loader = MagicMock()
    loader.compile_tool.side_effect = [RuntimeError("boom"), MagicMock()]

    result = await compile_server_tools(
        server=server, tools=tools, env_var_repo=env_repo, tool_loader=loader
    )

    assert len(result) == 1  # only the "good" tool


@pytest.mark.anyio
async def test_compilation_error_raised_with_flag():
    server = _make_server()
    tools = [_make_tool("bad")]
    env_repo = _make_env_var_repo()

    loader = MagicMock()
    loader.compile_tool.side_effect = RuntimeError("kaboom")

    with pytest.raises(ValueError, match="kaboom"):
        await compile_server_tools(
            server=server,
            tools=tools,
            env_var_repo=env_repo,
            tool_loader=loader,
            raise_on_missing_code=True,
        )


# ---- Tier default ----


@pytest.mark.anyio
async def test_default_tier_is_free():
    """When tier=None (default), compile_tool should be called with Tier.FREE."""
    from core.services.tier_service import Tier

    server = _make_server()
    tools = [_make_tool("t")]
    env_repo = _make_env_var_repo()

    loader = MagicMock()
    loader.compile_tool.return_value = MagicMock()

    await compile_server_tools(
        server=server, tools=tools, env_var_repo=env_repo, tool_loader=loader
    )

    call_kwargs = loader.compile_tool.call_args.kwargs
    assert call_kwargs["tier"] == Tier.FREE


@pytest.mark.anyio
async def test_explicit_tier_is_used():
    from core.services.tier_service import Tier

    server = _make_server()
    tools = [_make_tool("t")]
    env_repo = _make_env_var_repo()

    loader = MagicMock()
    loader.compile_tool.return_value = MagicMock()

    await compile_server_tools(
        server=server,
        tools=tools,
        env_var_repo=env_repo,
        tool_loader=loader,
        tier=Tier.PAID,
    )

    call_kwargs = loader.compile_tool.call_args.kwargs
    assert call_kwargs["tier"] == Tier.PAID


# ---- Empty tools list ----


@pytest.mark.anyio
async def test_empty_tools_returns_empty_list():
    server = _make_server()
    env_repo = _make_env_var_repo()
    loader = MagicMock()

    result = await compile_server_tools(
        server=server, tools=[], env_var_repo=env_repo, tool_loader=loader
    )

    assert result == []
    loader.compile_tool.assert_not_called()
