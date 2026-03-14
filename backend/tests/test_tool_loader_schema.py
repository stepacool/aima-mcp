"""Unit tests for tool_loader parameter schema conversion."""

from core.services.tool_loader import _normalize_parameters, _parameters_to_json_schema


def test_normalize_parameters_list() -> None:
    """List format is returned as-is."""
    params = [{"name": "url", "type": "string"}]
    assert _normalize_parameters(params) == params


def test_normalize_parameters_dict() -> None:
    """Dict format with 'parameters' key extracts the list."""
    params = [{"name": "url", "type": "string"}]
    assert _normalize_parameters({"parameters": params}) == params


def test_normalize_parameters_empty() -> None:
    """Empty list and empty dict return empty list."""
    assert _normalize_parameters([]) == []
    assert _normalize_parameters({"parameters": []}) == []


def test_parameters_to_json_schema_basic() -> None:
    """Converts param list to JSON Schema with descriptions."""
    params = [
        {
            "name": "url",
            "type": "string",
            "description": "The URL to fetch",
            "required": True,
        },
        {
            "name": "count",
            "type": "integer",
            "description": "Number of items",
            "required": False,
        },
    ]
    schema = _parameters_to_json_schema(params)
    assert schema["type"] == "object"
    assert schema["properties"]["url"]["type"] == "string"
    assert schema["properties"]["url"]["description"] == "The URL to fetch"
    assert schema["properties"]["count"]["type"] == "integer"
    assert schema["properties"]["count"]["description"] == "Number of items"
    assert schema["required"] == ["url"]


def test_parameters_to_json_schema_empty() -> None:
    """Empty params produce minimal object schema."""
    schema = _parameters_to_json_schema([])
    assert schema == {"type": "object", "properties": {}, "required": []}


def test_parameters_to_json_schema_type_mapping() -> None:
    """Python type names map to JSON Schema types."""
    params = [
        {"name": "s", "type": "str", "required": False},
        {"name": "i", "type": "int", "required": False},
        {"name": "f", "type": "float", "required": False},
        {"name": "b", "type": "bool", "required": False},
    ]
    schema = _parameters_to_json_schema(params)
    assert schema["properties"]["s"]["type"] == "string"
    assert schema["properties"]["i"]["type"] == "integer"
    assert schema["properties"]["f"]["type"] == "number"
    assert schema["properties"]["b"]["type"] == "boolean"
