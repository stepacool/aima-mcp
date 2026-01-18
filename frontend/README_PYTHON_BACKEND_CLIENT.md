# Python Backend HTTP Client

A configured axios client for communicating with Python backend services, featuring automatic case conversion between JavaScript (camelCase) and Python (snake_case) conventions.

## Setup

### Environment Variables

Add these to your `.env` file:

```bash
PYTHON_BACKEND_URL="https://your-python-api.example.com"
PYTHON_BACKEND_API_KEY="your-secret-api-key"
```

Both variables are optional. If `PYTHON_BACKEND_URL` is not set, requests will fail. If `PYTHON_BACKEND_API_KEY` is not set, no Authorization header will be sent.

## Usage

### Basic Requests

```typescript
import { pythonBackendClient } from "@/lib/python-backend";

// POST request
const response = await pythonBackendClient.post("/api/users", {
  firstName: "John",    // Sent as first_name
  lastName: "Doe",      // Sent as last_name
  emailAddress: "john@example.com"  // Sent as email_address
});

// Response data is auto-converted to camelCase
console.log(response.data.userId);      // Received as user_id
console.log(response.data.createdAt);   // Received as created_at

// GET request with query params
const users = await pythonBackendClient.get("/api/users", {
  params: {
    pageSize: 10,       // Sent as page_size in query string
    sortOrder: "desc"   // Sent as sort_order in query string
  }
});

// PUT request
await pythonBackendClient.put(`/api/users/${userId}`, {
  displayName: "John D."  // Sent as display_name
});

// DELETE request
await pythonBackendClient.delete(`/api/users/${userId}`);
```

### Using Case Conversion Utilities Directly

```typescript
import { keysToCamelCase, keysToSnakeCase } from "@/lib/python-backend";

// Convert snake_case to camelCase
const pythonData = {
  user_id: 123,
  first_name: "John",
  nested_object: {
    created_at: "2024-01-01"
  }
};
const jsData = keysToCamelCase(pythonData);
// Result: { userId: 123, firstName: "John", nestedObject: { createdAt: "2024-01-01" } }

// Convert camelCase to snake_case
const jsPayload = {
  userId: 123,
  firstName: "John"
};
const pythonPayload = keysToSnakeCase(jsPayload);
// Result: { user_id: 123, first_name: "John" }
```

## Features

| Feature | Description |
|---------|-------------|
| **Auto Case Conversion** | Request bodies converted to snake_case, responses converted to camelCase |
| **Authentication** | Bearer token from `PYTHON_BACKEND_API_KEY` |
| **Timeout** | 15 second default timeout |
| **Query Strings** | Array format: repeat (e.g., `?id=1&id=2&id=3`) |
| **Error Logging** | Errors logged via application logger (not console.log) |

## Error Handling

```typescript
import { pythonBackendClient } from "@/lib/python-backend";
import { AxiosError } from "axios";

try {
  const response = await pythonBackendClient.post("/api/resource", data);
  return response.data;
} catch (error) {
  if (error instanceof AxiosError) {
    // Access error details
    console.error(error.response?.status);  // HTTP status code
    console.error(error.response?.data);    // Response body (already camelCase)
    console.error(error.message);           // Error message
  }
  throw error;
}
```

Errors are automatically logged with context (status, URL, method, message) before being re-thrown.

## Configuration

The client is pre-configured with these defaults:

```typescript
{
  baseURL: env.PYTHON_BACKEND_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${env.PYTHON_BACKEND_API_KEY}`  // if API key is set
  }
}
```

## File Structure

```
lib/python-backend/
├── client.ts    # Axios client and case conversion utilities
├── index.ts     # Public exports
└── README_PYTHON_BACKEND_CLIENT.md
```

## Exports

```typescript
// Main client
export { pythonBackendClient } from "@/lib/python-backend";

// Utility functions
export { keysToCamelCase, keysToSnakeCase } from "@/lib/python-backend";
```
