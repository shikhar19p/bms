# Logging and Monitoring Strategy

This document outlines the logging and monitoring strategy for the BookMySportz platform. Effective logging and monitoring are essential for debugging, auditing, performance analysis, and ensuring the overall health and security of the applications.

## 1. Logging

### a. Centralized Logger (`@workspace/backend-common/logger`)

All backend services (`http-backend`, `ws-backend`) utilize a centralized logging utility provided by the `@workspace/backend-common/logger` package. This ensures consistency in log format, levels, and destinations.

*   **Technology:** Winston is used as the primary logging library.
*   **Log Levels:** Standard log levels are used:
    *   `TRACE`: Very fine-grained informational events, useful for debugging.
    *   `DEBUG`: Fine-grained informational events that are most useful to debug an application.
    *   `INFO`: Informational messages that highlight the progress of the application at a coarse-grained level.
    *   `WARN`: Potentially harmful situations.
    *   `ERROR`: Error events that might still allow the application to continue running.
    *   `FATAL`: Very severe error events that will presumably lead the application to abort.
    *   `SUCCESS`: Custom level for successful operations (e.g., user login, booking creation).
*   **Log Format:** Logs are structured (e.g., JSON) to facilitate parsing and analysis by log management systems.
*   **Transports:** Logs are configured to be sent to multiple destinations:
    *   **Console:** For local development and immediate feedback.
    *   **Daily Rotate File:** For persistent storage of logs on the server, rotated daily to manage file size.
    *   **Elasticsearch (Optional/Future):** For centralized log aggregation, searching, and analysis in a production environment.

### b. Contextual Logging

Logs include contextual information to aid in debugging and tracing:

*   **`correlationId`:** A unique ID generated for each incoming request (e.g., HTTP request, WebSocket connection) and propagated across all services involved in processing that request. This allows for tracing a single transaction across multiple microservices.
*   **`actorId`, `actorType`, `actorEmail`:** Information about the user or system process that initiated the action.
*   **`service`, `module`:** Identifies the origin of the log message within the application.
*   **`httpMethod`, `urlPath`, `statusCode`:** For HTTP requests, provides details about the request and response.
*   **`resourceType`, `resourceId`:** Identifies the specific resource affected by an action.

**Example Log Entry (Conceptual):**

```json
{
  "timestamp": "2023-10-27T10:30:00.123Z",
  "level": "info",
  "message": "User logged in successfully.",
  "service": "http-backend",
  "module": "AuthController",
  "correlationId": "req-abc-123",
  "actorId": "user-xyz-456",
  "actorType": "USER",
  "actorEmail": "user@example.com",
  "httpMethod": "POST",
  "urlPath": "/api/auth/login",
  "statusCode": 200
}
```

### c. Audit Logging

Critical actions and security-sensitive events are recorded in the `AuditLog` database table (defined in `packages/db/prisma/schema.prisma`). This provides an immutable record for compliance and forensic analysis.

*   **Details:** Includes `actorId`, `action`, `resourceType`, `resourceId`, `oldValue`, `newValue`, and `details` for comprehensive tracking.
*   **Purpose:** Tracks who did what, when, and to which resource.

## 2. Monitoring

### a. Application Performance Monitoring (APM)

(Future consideration: Integrate with APM tools like Prometheus/Grafana, Datadog, or New Relic to collect metrics on request latency, error rates, throughput, and resource utilization.)

### b. Health Checks

*   **Endpoints:** Implement health check endpoints (e.g., `/health`, `/ready`, `/live`) in backend services to allow load balancers and orchestration systems (like Kubernetes) to determine service availability.
*   **Checks:** These endpoints can verify database connectivity, external service reachability, and internal component health.

### c. Alerting

*   **Thresholds:** Set up alerts based on predefined thresholds for key metrics (e.g., high error rates, increased latency, low disk space).
*   **Channels:** Alerts are sent to appropriate channels (e.g., Slack, PagerDuty, email) for immediate team awareness.

### d. Dashboards

(Future consideration: Create dashboards using tools like Grafana or Kibana to visualize key metrics, log trends, and system health at a glance.)

This comprehensive logging and monitoring strategy ensures that the BookMySportz platform remains observable, debuggable, and resilient.
