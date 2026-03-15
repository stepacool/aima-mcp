## Dynamic tool loader for shared MCP runtime.
from __future__ import annotations

import importlib
import os
from types import ModuleType
from typing import TYPE_CHECKING, Any, Callable
from uuid import UUID

from fastmcp.tools.tool import FunctionTool
from loguru import logger

from core.services.request_context import DynamicEnvDict
from core.services.tier_service import CURATED_LIBRARIES, CodeValidator, Tier

if TYPE_CHECKING:
    from infrastructure.models.mcp_server import MCPServer, MCPTool
    from infrastructure.repositories.mcp_server import MCPEnvironmentVariableRepo


class ToolCompilationError(Exception):
    """Raised when tool compilation fails."""

    pass


def make_mock_os(static_env_override: dict[str, str]) -> ModuleType:
    """
    Create a mock os module with environment variable overrides.

    The returned module's environ attribute is a DynamicEnvDict that checks:
    1. Per-request context (from headers via middleware)
    2. Static env vars (from DB, passed here)
    3. Real os.environ (fallback)

    Also overrides os.getenv() and os.getenvb() to use the same lookup.

    Args:
        static_env_override: Static environment variables from DB

    Returns:
        Mock os module with dynamic environ
    """
    mock_os = ModuleType("os")

    for attr in dir(os):
        setattr(mock_os, attr, getattr(os, attr))

    # Use DynamicEnvDict for layered env var lookup
    mock_environ = DynamicEnvDict({**os.environ, **static_env_override})
    setattr(mock_os, "environ", mock_environ)

    # Override getenv to use our mock environ
    def mock_getenv(key: str, default: str | None = None) -> str | None:
        return mock_environ.get(key, default)

    setattr(mock_os, "getenv", mock_getenv)

    # Override getenvb (bytes version) - falls back to real if key not in mock
    def mock_getenvb(key: bytes, default: bytes | None = None) -> bytes | None:
        str_key = key.decode("utf-8", errors="replace")
        result = mock_environ.get(str_key)
        if result is not None:
            return result.encode("utf-8")
        return default

    setattr(mock_os, "getenvb", mock_getenvb)

    return mock_os


def _import_module(path: str):
    """Import a module from a dotted path."""
    return importlib.import_module(path)


def _parameters_to_json_schema(parameters: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Convert aima-mcp parameters_schema (list of param dicts) to MCP JSON Schema.

    Input format: [{"name": "url", "type": "string", "description": "...", "required": true}]
    Output format: {"type": "object", "properties": {...}, "required": [...]}
    """
    if not parameters:
        return {"type": "object", "properties": {}, "required": []}

    properties: dict[str, Any] = {}
    required: list[str] = []

    type_map = {
        "string": "string",
        "str": "string",
        "integer": "integer",
        "int": "integer",
        "number": "number",
        "float": "number",
        "boolean": "boolean",
        "bool": "boolean",
        "array": "array",
        "object": "object",
    }

    for p in parameters:
        name = p.get("name") or "arg"
        param_type = p.get("type", "string")
        json_type = type_map.get(
            str(param_type).lower() if param_type else "string", "string"
        )
        desc = p.get("description", "")
        prop: dict[str, Any] = {"type": json_type}
        if desc:
            prop["description"] = desc
        properties[name] = prop
        if p.get("required", False):
            required.append(name)

    return {"type": "object", "properties": properties, "required": required}


def _normalize_parameters(
    v: list[dict[str, Any]] | dict[str, Any],
) -> list[dict[str, Any]]:
    """Handle both dict format {'parameters': [...]} and list format [...]."""
    if isinstance(v, dict):
        return v.get("parameters", [])
    return v


class DynamicToolLoader:
    """Loads and compiles customer tools for the shared runtime."""

    def __init__(self):
        self._compiled_tools: dict[str, FunctionTool] = {}
        self._customer_namespaces: dict[UUID, dict[str, Any]] = {}

    def compile_tool(
        self,
        tool_id: str,
        name: str,
        description: str,
        parameters: list[dict[str, Any]],
        code: str,
        customer_id: UUID,
        tier: Tier = Tier.FREE,
        env_vars: dict[str, str] | None = None,
        server_id: UUID | None = None,
    ) -> FunctionTool:
        """
        Compile a tool from code and return a fastmcp FunctionTool.

        Args:
            tool_id: Unique identifier for the tool
            name: Tool name
            description: Tool description
            parameters: List of parameter definitions
            code: Python code for the tool implementation
            customer_id: Customer who owns this tool
            tier: Customer tier for validation
            env_vars: Environment variables from DB to inject into tool namespace
            server_id: When provided, use per-server namespace so tools from
                different servers (same customer) get their own env vars.

        Returns:
            Compiled fastmcp FunctionTool ready for injection
        """
        # Validate code for free tier
        if tier == Tier.FREE:
            validator = CodeValidator(tier)
            errors: list[str] = validator.validate(code)
            if errors:
                raise ToolCompilationError(f"Code validation failed: {errors}")

        # Use server_id for namespace when available so each server gets its own
        # env vars. Otherwise multiple servers with same customer_id would share
        # a namespace and the last compiled server's env vars would overwrite.
        namespace_key: UUID = server_id if server_id is not None else customer_id
        if namespace_key not in self._customer_namespaces:
            self._customer_namespaces[namespace_key] = self._create_safe_namespace()

        namespace = self._customer_namespaces[namespace_key]

        # Compile the function
        try:
            func: Callable[..., Any] = self._compile_function(
                name, description, parameters, code, namespace, env_vars or {}, tier
            )
        except Exception as e:
            logger.error(f"Failed to compile tool {name}: {e}")
            raise ToolCompilationError(f"Compilation failed: {e}")

        # Create the FunctionTool
        tool = FunctionTool.from_function(
            fn=func,
            name=name,  # Namespaced name
            description=description,
        )

        # Override parameters with stored schema so MCP clients receive argument
        # names, types, and descriptions. FunctionTool infers schema from the
        # compiled function, but LLM-generated code may omit Field(description=...),
        # and the DB is the source of truth for tool metadata.
        params_list = _normalize_parameters(parameters)
        if params_list:
            tool.parameters = _parameters_to_json_schema(params_list)

        cache_key = f"{customer_id}:{tool_id}"
        self._compiled_tools[cache_key] = tool

        return tool

    def get_customer_tools(
        self,
        customer_id: UUID,
        tool_specs: list[dict[str, Any]],
        env_vars: dict[str, str] | None = None,
    ) -> list[FunctionTool]:
        """
        Get all tools for a customer, compiling them if needed.

        Args:
            customer_id: Customer ID
            tool_specs: List of tool specifications with id, name, description,
                        parameters, code
            env_vars: Environment variables from DB to inject into tool namespace

        Returns:
            List of compiled Tools
        """
        tools: list[FunctionTool] = []
        for spec in tool_specs:
            cache_key = f"{customer_id}:{spec['id']}"

            if cache_key in self._compiled_tools:
                tools.append(self._compiled_tools[cache_key])
            else:
                try:
                    tool: FunctionTool = self.compile_tool(
                        tool_id=spec["id"],
                        name=spec["name"],
                        description=spec["description"],
                        parameters=spec.get("parameters", []),
                        code=spec["code"],
                        customer_id=customer_id,
                        tier=Tier(spec.get("tier", "free")),
                        env_vars=env_vars,
                    )
                    tools.append(tool)
                except ToolCompilationError as e:
                    logger.warning(f"Skipping tool {spec['name']}: {e}")

        return tools

    def invalidate_customer_tools(self, customer_id: UUID) -> None:
        """Remove all cached tools for a customer."""
        keys_to_remove = [
            k for k in self._compiled_tools if k.startswith(f"{customer_id}:")
        ]
        for key in keys_to_remove:
            del self._compiled_tools[key]

        if customer_id in self._customer_namespaces:
            del self._customer_namespaces[customer_id]

    def _create_safe_namespace(self) -> dict[str, Any]:
        namespace: dict[str, Any] = {}

        # ⚠️ You can further restrict this if needed
        namespace["__builtins__"] = {}

        for module_path, symbols in CURATED_LIBRARIES.items():
            try:
                module = _import_module(module_path)

                # Expose the module itself (e.g. json, itertools)
                module_name = module_path.split(".")[0]
                namespace[module_name] = module

                if not symbols:
                    # symbols=None → allow full module usage
                    continue
                for symbol in symbols:
                    try:
                        namespace[symbol] = getattr(module, symbol)
                    except AttributeError:
                        pass

            except ImportError:
                # Silently ignore unavailable libraries (free tier behavior)
                continue

        return namespace

    def _compile_function(
        self,
        name: str,
        _description: str,
        _parameters: list[dict[str, Any]],
        code: str,
        namespace: dict[str, Any],
        env_vars: dict[str, str],
        tier: Tier,
    ) -> Callable[..., Any]:
        """
        Compile user code into an async function.

        Args:
            name: Function name to extract from compiled code
            description: Tool description (unused here but part of signature)
            parameters: Parameter definitions (unused here but part of signature)
            code: Python code to compile
            namespace: Namespace for code execution
            env_vars: Static environment variables from DB
            tier: Tier for determining restrictions
        """
        real_import = __import__

        bad_builtins = [
            "eval",
            "exec",
            "compile",
            "open",
            "input",
            "__import__",
            "globals",
            "locals",
            "vars",
            "dir",
            "help",
            "breakpoint",
            "exit",
            "quit",
            "license",
            "copyright",
            "credits",
            "delattr",
        ]

        builtins_dict = dict(__builtins__)
        for bad in bad_builtins:
            builtins_dict.pop(bad, None)

        # Define guarded import
        allowed_imports: list[str] = list[str](CURATED_LIBRARIES.keys())

        def guarded_import(
            name: str,
            globals: dict[str, Any] | None = None,
            locals: dict[str, Any] | None = None,
            fromlist: tuple[str, ...] = (),
            level: int = 0,
        ) -> Any:
            if tier != Tier.FREE:
                return real_import(name, globals, locals, fromlist, level)
            if name not in allowed_imports:
                raise ImportError(f"Import of {name} not allowed in this context.")
            if name == "os":
                return namespace["os"]
            return real_import(name, globals, locals, fromlist, level)

        builtins_dict["__import__"] = guarded_import

        namespace["__builtins__"] = builtins_dict
        namespace["os"] = make_mock_os(env_vars)

        try:
            exec(code, namespace)
            return namespace[name]
        except Exception as e:
            raise ToolCompilationError(f"Failed to compile function: {e}")


_tool_loader: DynamicToolLoader | None = None


def get_tool_loader() -> DynamicToolLoader:
    global _tool_loader
    if _tool_loader is None:
        _tool_loader = DynamicToolLoader()
    return _tool_loader


async def compile_server_tools(
    server: "MCPServer",
    tools: "list[MCPTool]",
    env_var_repo: "MCPEnvironmentVariableRepo",
    tool_loader: DynamicToolLoader | None = None,
    tier: "Tier | None" = None,
    raise_on_missing_code: bool = False,
) -> "list[FunctionTool]":
    """
    Fetch env-vars and compile all tools for a server.

    This is the single source-of-truth for the env-vars → compile loop
    that was previously duplicated in activate_server, step_5_deploy_to_shared,
    remount_mcp_server, and load_and_register_all_mcp_servers.

    Args:
        server: MCPServer ORM object exposing .id and .customer_id.
        tools: List of MCPTool ORM objects to compile.
        env_var_repo: Repository used to fetch environment variables.
        tool_loader: DynamicToolLoader instance; uses the global singleton if None.
        tier: Tier enum value (defaults to Tier.FREE when None).
        raise_on_missing_code: If True, raise ValueError when a tool has no code
            (appropriate for activation / deploy paths).  If False, skip the
            tool with a warning (appropriate for startup / remount paths).

    Returns:
        List of compiled FunctionTool instances ready for FastMCP.
    """
    resolved_tier: Tier = tier if tier is not None else Tier.FREE
    resolved_loader: DynamicToolLoader = (
        tool_loader if tool_loader is not None else get_tool_loader()
    )

    env_var_records = await env_var_repo.get_vars_for_server(server.id)
    env_vars: dict[str, str] = {
        var.name: var.value for var in env_var_records if var.value is not None
    }

    compiled: list[FunctionTool] = []
    for tool in tools:
        if not tool.code:
            if raise_on_missing_code:
                raise ValueError(
                    f"Tool '{tool.name}' has no code. "
                    + "Generate code first before deploying."
                )
            logger.warning(
                f"Skipping tool '{tool.name}' for server {server.id}: no code"
            )
            continue
        try:
            result = resolved_loader.compile_tool(
                tool_id=str(tool.id),
                name=tool.name,
                description=tool.description or "",
                parameters=tool.parameters_schema,
                code=tool.code,
                customer_id=server.customer_id,
                tier=resolved_tier,
                env_vars=env_vars,
                server_id=server.id,
            )
            compiled.append(result)
        except Exception as exc:
            if raise_on_missing_code:
                raise ValueError(
                    f"Failed to compile tool '{tool.name}': {exc}"
                ) from exc
            logger.error(
                f"Failed to compile tool '{tool.name}' for server {server.id}: {exc}"
            )

    return compiled
