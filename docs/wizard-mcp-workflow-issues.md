# Wizard MCP Workflow – Issues Encountered

Recorded during calculator MCP server creation via MCP Hero Wizard (customer `c47b4160-4d9f-413d-a6ec-fa3eaaeeb9b8`).

---

## 1. Step 1a: No tools generated on initial `start_wizard`

**What happened:** After `start_wizard` with description "MCP server that provides a calculator tool...", `get_wizard_state` returned `tools: []` and `setup_status: tools_selection`. The LLM in `step_1a_suggest_tools_for_mcp_server` returned an empty list.

**Workaround:** Called `POST /api/wizard/{server_id}/tools/refine` with explicit feedback: "Please add a calculator tool. It should have one parameter: expression (string)...". Refine produced the `calculate_expression` tool.

**Fix applied:** When `parsed.tools` is empty, step_1a retries generation up to 3 times until tools are not empty.

---

## 2. MCP `update_wizard_config` for auth step: "Error: Aborted"

**What happened:** `call_mcp_tool(update_wizard_config, step: "auth", payload: {})` returned `Error: Aborted`. Unclear if the wizard MCP server’s auth handler expects a different payload or fails on empty payload.

**Workaround:** Use `POST /api/wizard/{server_id}/auth` directly (no body required).

**To fix:**

- Inspect the wizard MCP server’s `update_wizard_config` implementation for the `auth` step
- Ensure auth step works with empty payload or document required payload
- Add clearer error handling instead of "Aborted"

---

## 3. Newly created server returns 404 shortly after creation

**What happened:** After `start_wizard` created server `297f1a0d-598d-41a0-972f-2c26c8a15023`, subsequent `get_wizard_state` and `update_wizard_config` (auth step) returned `404 - Server not found`. The wizard MCP uses `MCP_HERO_API_URL=http://localhost:8001/`; possible mismatch with backend binding (0.0.0.0 vs localhost) or backend instance.

**Workaround:** Used existing server `0530a5fb-971d-44be-976e-0e252dab954e` (from earlier run) which was already in `code_gen` and deployable.

**To fix:**

- Align MCP_HERO_API_URL with how Cursor reaches the backend (e.g. 0.0.0.0:8001 vs localhost:8001)
- Verify server creation is persisted and immediately queryable
- Add retry or diagnostic when 404 occurs on a freshly created server_id

---

## 4. `update_wizard_config` auth step: POST body

**What happened:** For auth step, the backend `POST /api/wizard/{server_id}/auth` expects no body. The wizard's `update_wizard_config` sends `json=payload` (e.g. `{}`). If the auth endpoint rejects a body, that could cause issues.

**To fix:**

- Ensure auth step uses POST with no body or empty body when payload is `{}`
- Document expected payload format per step in MCP Hero Wizard tool schema

---

## 5. New MCP servers require Cursor reload

**What happened:** After adding the Calculator server to `~/.cursor/mcp.json`, `call_mcp_tool` with server "Calculator" failed: "MCP server does not exist". The Calculator was not in the available servers list.

**Workaround:** User must reload Cursor window (or restart) for new MCP servers in mcp.json to be loaded.

**To fix:**

- Document that mcp.json changes require Cursor reload
- Consider hot-reload of MCP config if Cursor supports it

---

## 6. Calculator fails: "name 'dir' is not defined"

**Root cause:** The tool_loader sandbox removes `dir` (and eval, exec, globals, etc.) from the execution namespace for security (`tool_loader.py` bad_builtins). The LLM-generated calculator used `dir(math)` to discover math functions dynamically, which fails at runtime.

**Fix applied:** Updated `step_4_code_generation.yaml` to document restricted builtins and instruct the LLM to use explicit names (e.g. sqrt, sin, cos) instead of `dir(math)`.

**For existing broken tools:** Regenerate code via `POST /api/wizard/{server_id}/tools/{tool_id}/regenerate-code` or recreate the server.

---

## 7. list_server_status: env vars wrong when multiple servers share customer_id

**Root cause:** The tool_loader used `customer_id` as the namespace key. Multiple servers (e.g. MCP Hero Wizard, Calculator) with the same customer_id shared one namespace. When compiling tools for the second server, `namespace["os"]` was overwritten with that server's env vars. The first server's tools then saw the wrong env vars (empty or from the other server).

**Fix applied:** Added `server_id` to `compile_tool`. When provided, `server_id` is used as the namespace key so each server gets its own env vars. `compile_server_tools` now passes `server_id=server.id`.
