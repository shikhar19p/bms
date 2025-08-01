# `ws-backend` Application

This is the `ws-backend` application, a dedicated WebSocket server for the BookMySportz platform. It facilitates real-time communication and updates between clients and the backend, complementing the RESTful `http-backend`.

## 🚀 Getting Started

To run this application in development mode:

1.  Ensure you have completed the [monorepo's initial setup](../../README.md#getting-started).
2.  Navigate to the monorepo root and run:
    ```bash
    pnpm dev ws-backend
    ```
    Alternatively, you can run `turbo dev` from the monorepo root to start all applications concurrently.

## ✨ Features

*   Real-time updates for booking status.
*   Live notifications for users and venue owners.
*   (Potentially) Real-time chat or support features.

## 📦 Dependencies

This application utilizes the following internal packages:

*   `@workspace/backend-common`: For common backend utilities and logging.
*   `@workspace/common`: For shared types and interfaces.
*   `@workspace/db`: For database interactions (e.g., fetching data to send via WebSockets).
*   `@workspace/typescript-config`: For consistent TypeScript configurations.

Significant external dependencies include:

*   `ws`: A fast and reliable WebSocket implementation for Node.js.
*   `uuid`: For generating unique IDs.

## 🛠️ Scripts

*   `pnpm dev`: Starts the development server with `nodemon`.
*   `pnpm build`: Compiles TypeScript to JavaScript.
*   `pnpm start`: Starts the compiled application in production mode.
*   `pnpm test`: (Add details on how to run tests if applicable.)

## 📐 Design Principles & Patterns

This WebSocket backend is designed to be lightweight and focused on real-time communication. It integrates with the database via `@workspace/db` to fetch and push relevant data. Event-driven architecture principles are applied to handle incoming WebSocket messages and broadcast updates.

## 🧪 Testing

(Add details on how to run tests for `ws-backend` if applicable, e.g., `pnpm test` and what framework is used.)
