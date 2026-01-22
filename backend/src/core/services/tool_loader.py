"""Dynamic tool loader for shared MCP runtime."""

import textwrap
from typing import Any, Callable
from uuid import UUID

from fastmcp.tools.tool import FunctionTool
from loguru import logger

from core.services.tier_service import CodeValidator, Tier


class ToolCompilationError(Exception):
    """Raised when tool compilation fails."""

    pass


class DynamicToolLoader:
    """Loads and compiles customer tools for the shared runtime."""

    def __init__(self):
        self._compiled_tools: dict[str, FunctionTool] = {}
        self._customer_namespaces: dict[str, dict[str, Any]] = {}

    def compile_tool(
        self,
        tool_id: str,
        name: str,
        description: str,
        parameters: list[dict[str, Any]],
        code: str,
        customer_id: UUID,
        tier: Tier = Tier.FREE,
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

        Returns:
            Compiled fastmcp FunctionTool ready for injection
        """
        # Validate code for free tier
        if tier == Tier.FREE:
            validator = CodeValidator(tier)
            errors = validator.validate(code)
            if errors:
                raise ToolCompilationError(f"Code validation failed: {errors}")

        # Create a namespace for this customer if not exists
        if customer_id not in self._customer_namespaces:
            self._customer_namespaces[customer_id] = self._create_safe_namespace()

        namespace = self._customer_namespaces[customer_id]

        # Compile the function
        try:
            func = self._compile_function(
                name, description, parameters, code, namespace
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

        cache_key = f"{customer_id}:{tool_id}"
        self._compiled_tools[cache_key] = tool

        return tool

    def get_customer_tools(
        self, customer_id: UUID, tool_specs: list[dict]
    ) -> list[FunctionTool]:
        """
        Get all tools for a customer, compiling them if needed.

        Args:
            customer_id: Customer ID
            tool_specs: List of tool specifications with id, name, description, parameters, code

        Returns:
            List of compiled Tools
        """
        tools = []
        for spec in tool_specs:
            cache_key = f"{customer_id}:{spec['id']}"

            if cache_key in self._compiled_tools:
                tools.append(self._compiled_tools[cache_key])
            else:
                try:
                    tool = self.compile_tool(
                        tool_id=spec["id"],
                        name=spec["name"],
                        description=spec["description"],
                        parameters=spec.get("parameters", []),
                        code=spec["code"],
                        customer_id=customer_id,
                        tier=Tier(spec.get("tier", "free")),
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
        """Create a namespace with allowed imports for free tier."""
        namespace = {
            "__builtins__": {
                # Safe builtins only
                "len": len,
                "str": str,
                "int": int,
                "float": float,
                "bool": bool,
                "list": list,
                "dict": dict,
                "tuple": tuple,
                "set": set,
                "range": range,
                "enumerate": enumerate,
                "zip": zip,
                "map": map,
                "filter": filter,
                "sorted": sorted,
                "reversed": reversed,
                "min": min,
                "max": max,
                "sum": sum,
                "any": any,
                "all": all,
                "abs": abs,
                "round": round,
                "isinstance": isinstance,
                "issubclass": issubclass,
                "hasattr": hasattr,
                "getattr": getattr,
                "setattr": setattr,
                "type": type,
                "Exception": Exception,
                "ValueError": ValueError,
                "TypeError": TypeError,
                "KeyError": KeyError,
                "IndexError": IndexError,
                "RuntimeError": RuntimeError,
                "print": print,  # For debugging
            }
        }

        # Pre-import curated libraries
        try:
            import httpx

            namespace["httpx"] = httpx
        except ImportError:
            pass

        try:
            import json

            namespace["json"] = json
        except ImportError:
            pass

        try:
            import datetime

            namespace["datetime"] = datetime
        except ImportError:
            pass

        try:
            import re

            namespace["re"] = re
        except ImportError:
            pass

        try:
            from pydantic import BaseModel, Field

            namespace["BaseModel"] = BaseModel
            namespace["Field"] = Field
        except ImportError:
            pass

        return namespace

    def _compile_function(
        self,
        name: str,
        description: str,
        parameters: list[dict[str, Any]],
        code: str,
        namespace: dict[str, Any],
    ) -> Callable:
        """Compile user code into an async function."""
        # Build parameter signature
        params = []
        for p in parameters:
            param_name = p.get("name", "arg")
            # param_type is available but we use untyped params for simplicity
            default = p.get("default")
            if default is not None:
                params.append(f"{param_name}={repr(default)}")
            else:
                params.append(param_name)
        namespace["__builtins__"] = __builtins__
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
