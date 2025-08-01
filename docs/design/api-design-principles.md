# API Design Principles

This document outlines the core principles and best practices for designing RESTful APIs within the BookMySportz platform, primarily for the `http-backend` application. Adhering to these principles ensures consistency, usability, and maintainability of our APIs.

## 1. RESTful Principles

Our APIs strive to be RESTful, adhering to the following:

*   **Resource-Oriented:** APIs are organized around resources (e.g., `users`, `venues`, `bookings`) rather than actions.
*   **Stateless:** Each request from a client to the server must contain all the information needed to understand the request. The server should not store any client context between requests.
*   **Standard HTTP Methods:** Use standard HTTP methods (verbs) to perform actions on resources:
    *   `GET`: Retrieve a resource or a collection of resources.
    *   `POST`: Create a new resource.
    *   `PUT`: Update an existing resource (full replacement).
    *   `PATCH`: Partially update an existing resource.
    *   `DELETE`: Remove a resource.
*   **Uniform Interface:** Consistent use of URIs, HTTP methods, and media types.

## 2. Naming Conventions

*   **Resource Naming:**
    *   Use **plural nouns** for collection endpoints (e.g., `/users`, `/venues`).
    *   Use **singular nouns** for specific resource instances (e.g., `/users/{id}`, `/venues/{id}`).
    *   Avoid verbs in URIs (e.g., instead of `/getUsers`, use `/users`).
*   **Parameters:**
    *   Use `camelCase` for query parameters (e.g., `?pageSize=10&pageNumber=1`).
    *   Use `snake_case` for JSON request/response body fields (common in many API designs, though `camelCase` is also acceptable if consistently applied).

## 3. Request and Response Formats

*   **JSON Everywhere:** All request bodies and response bodies should be in JSON format (`Content-Type: application/json`).
*   **Consistent Response Structure:**
    *   **Success:**
        ```json
        {
          "status": "success",
          "data": { /* resource data */ },
          "message": "Optional success message"
        }
        ```
    *   **Error:**
        ```json
        {
          "status": "error",
          "message": "Human-readable error message",
          "code": "MACHINE_READABLE_ERROR_CODE",
          "details": { /* optional, non-sensitive error details */ }
        }
        ```
    (Refer to `./error-handling-strategy.md` for more details on error responses.)

## 4. Status Codes

Use standard HTTP status codes to indicate the outcome of an API request:

*   `200 OK`: General success.
*   `201 Created`: Resource successfully created (for `POST`).
*   `204 No Content`: Successful request with no content to return (for `DELETE`, `PUT` where no data is returned).
*   `400 Bad Request`: Invalid request payload or parameters.
*   `401 Unauthorized`: Authentication required or failed.
*   `403 Forbidden`: Authenticated but not authorized to access the resource.
*   `404 Not Found`: Resource not found.
*   `409 Conflict`: Request conflicts with the current state of the target resource.
*   `500 Internal Server Error`: Generic server error.

## 5. Pagination, Filtering, Sorting

*   **Pagination:** Use query parameters for pagination (e.g., `?page=1&limit=10` or `?offset=0&limit=10`).
*   **Filtering:** Use query parameters for filtering (e.g., `/venues?city=Bangalore&sportType=Cricket`).
*   **Sorting:** Use query parameters for sorting (e.g., `/venues?sortBy=name&sortOrder=asc`).

## 6. Versioning

API versioning is crucial for managing changes without breaking existing clients. We will use **URI Versioning** (e.g., `/v1/users`).

*   **Rationale:** Simple, clear, and widely understood.
*   **Implementation:** The version number is part of the base path for all API endpoints.

## 7. Security

*   **Authentication:** Use JWTs for authenticating API requests.
*   **Authorization:** Implement RBAC to control access to endpoints based on user roles and permissions.
*   **Input Validation:** All incoming request data must be validated using `zod` schemas to prevent malicious input and ensure data integrity.
*   **HTTPS:** All API communication must occur over HTTPS.
*   **Rate Limiting:** Implement rate limiting to prevent abuse and protect against DoS attacks.
*   **CORS:** Properly configure Cross-Origin Resource Sharing (CORS) to allow only trusted origins.

## 8. Documentation

*   **OpenAPI/Swagger:** (Future consideration: Generate OpenAPI specifications from our API code to provide interactive API documentation for developers.)

By adhering to these principles, we aim to build a robust, intuitive, and secure API for the BookMySportz platform.
