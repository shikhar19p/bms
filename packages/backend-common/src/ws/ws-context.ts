// // packages/backend-common/src/ws/ws-context.ts

// import { createNamespace, Namespace } from 'cls-hooked';
// import { v4 as uuidv4 } from 'uuid'; // npm install uuid @types/uuid
// import { LogContext } from '../logger/log-context';
// import { ActorType } from '@workspace/db/client'; // Assuming ActorType is defined in your db package

// /**
//  * @constant wsNamespace
//  * @description A Continuation-Local Storage (CLS) namespace for WebSocket-scoped context.
//  * This allows data like connection ID, correlation ID, and actor information
//  * to be accessible across asynchronous calls within a WebSocket connection or message processing.
//  */
// export const wsNamespace: Namespace = createNamespace('websocket');

// /**
//  * @function getWsRequestContext
//  * @description Helper function to retrieve the current WebSocket-scoped context.
//  * This can be called from anywhere in your WebSocket application code (message handlers, services)
//  * to get contextual logging data.
//  * @returns A partial LogContext object containing available WebSocket context.
//  */
// export function getWsRequestContext(): Partial<LogContext> {
//     return {
//         connectionId: wsNamespace.get('connectionId'), // New: Unique ID for the WebSocket connection
//         correlationId: wsNamespace.get('correlationId'), // Unique ID for the current message/action
//         ipAddress: wsNamespace.get('ipAddress'),
//         userAgent: wsNamespace.get('userAgent'),
//         service: wsNamespace.get('service'), // E.g., 'ws-backend-service'
//         actorId: wsNamespace.get('actorId'),
//         actorEmail: wsNamespace.get('actorEmail'),
//         actorType: wsNamespace.get('actorType'),
//         // No httpMethod or urlPath for WS context, unless you map it to WS events
//     };
// }

// // Re-export the namespace for direct use in WS connection/message handlers
// export { wsNamespace };