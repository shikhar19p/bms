// apps/ws-backend/src/index.ts

import { WebSocketServer, WebSocket } from 'ws'; // npm install ws @types/ws
import { logger, } from '@workspace/backend-common/logger';
import { wsNamespace, getWsRequestContext } from '@workspace/backend-common/ws'; // Import your WS context helper
import { ActorType } from '@workspace/db/client'; // Import ActorType enum from your db package
import { v4 as uuidv4 } from 'uuid'; // For generating unique correlation IDs per message

const WSS_PORT = process.env.WSS_PORT || 8080;
const SERVICE_NAME = process.env.SERVICE_NAME || 'ws-backend-service'; // ✅ IMPORTANT: Set your service name

// Augment WebSocket type to store connection-specific data
declare module 'ws' {
    interface WebSocket {
        id: string; // Unique ID for this connection
        isAuthenticated: boolean;
        userId?: string;
        userEmail?: string;
        userRole?: 'ADMIN' | 'USER';
    }
}

const wss = new WebSocketServer({ port: Number(WSS_PORT) });

wss.on('listening', () => {
    logger.info(`WebSocket Server listening on port ${WSS_PORT}`, { service: SERVICE_NAME });
    console.log(`WebSocket Server running on ws://localhost:${WSS_PORT}`);
});

wss.on('connection', (ws: WebSocket, req) => {
    const connectionId = uuidv4();
    ws.id = connectionId; // Assign a unique ID to the WebSocket connection

    // --- 1. Establish Connection-Level Context ---
    // Run the initial connection setup within the CLS namespace
    wsNamespace.run(() => {
        wsNamespace.set('connectionId', connectionId);
        wsNamespace.set('service', SERVICE_NAME);
        wsNamespace.set('ipAddress', req.socket.remoteAddress); // Capture client IP
        wsNamespace.set('userAgent', req.headers['user-agent']); // Capture user agent

        // --- Simulate Authentication (happens once per connection) ---
        // In a real app, this would involve token verification, etc.
        const isAuthenticated = Math.random() > 0.2; // 80% chance of being authenticated
        if (isAuthenticated) {
            const userId = 'ws-user-' + Math.floor(Math.random() * 1000);
            const userEmail = 'ws-user' + Math.floor(Math.random() * 1000) + '@example.com';
            const userRole: 'ADMIN' | 'USER' = Math.random() > 0.5 ? 'USER' : 'ADMIN';

            ws.isAuthenticated = true;
            ws.userId = userId;
            ws.userEmail = userEmail;
            ws.userRole = userRole;

            wsNamespace.set('actorId', userId);
            wsNamespace.set('actorEmail', userEmail);
            wsNamespace.set('actorType', userRole === 'ADMIN' ? ActorType.ADMIN : ActorType.USER);

            logger.info(`New WebSocket client connected and authenticated`, {
                ...getWsRequestContext(),
                action: 'WS_CLIENT_CONNECTED_AUTH', // Audit-worthy
                resourceType: 'WEBSOCKET_CONNECTION',
                resourceId: connectionId,
            });
        } else {
            ws.isAuthenticated = false;
            wsNamespace.set('actorType', ActorType.ANONYMOUS);
            logger.info(`New WebSocket client connected (unauthenticated)`, {
                ...getWsRequestContext(),
                action: 'WS_CLIENT_CONNECTED_UNAUTH',
                resourceType: 'WEBSOCKET_CONNECTION',
                resourceId: connectionId,
            });
        }

        // --- WebSocket Message Handling ---
        ws.on('message', (message: string) => {
            // --- 2. Establish Message-Level Context ---
            // Each incoming message processing should be wrapped in CLS to get a unique correlationId
            wsNamespace.run(() => {
                const messageCorrelationId = uuidv4();
                wsNamespace.set('correlationId', messageCorrelationId); // New correlation ID for this message
                // Reuse existing connection-level actor info
                wsNamespace.set('actorId', ws.userId);
                wsNamespace.set('actorEmail', ws.userEmail);
                wsNamespace.set('actorType', wsNamespace.get('actorType') || ActorType.ANONYMOUS); // Preserve actorType from connection context

                const messageContext = getWsRequestContext(); // Get the combined context

                try {
                    const parsedMessage = JSON.parse(message);
                    logger.info(`Received WebSocket message`, {
                        ...messageContext,
                        module: 'WebSocketHandler',
                        action: 'WS_MESSAGE_RECEIVED',
                    }, parsedMessage); // Log message content in details

                    // --- Real-time Analytics Dashboard Example ---
                    if (parsedMessage.type === 'SUBSCRIBE_ANALYTICS') {
                        logger.success(`Client subscribed to analytics feed`, {
                            ...messageContext,
                            action: 'ANALYTICS_SUBSCRIBE', // Audit-worthy action
                            resourceType: 'ANALYTICS_FEED',
                            resourceId: parsedMessage.feedId,
                            eventCategory: 'RealtimeAnalytics',
                        });
                        ws.send(JSON.stringify({ status: 'subscribed', feedId: parsedMessage.feedId }));

                        // Simulate sending real-time data
                        let counter = 0;
                        const interval = setInterval(() => {
                            if (ws.readyState === WebSocket.OPEN) {
                                const data = {
                                    type: 'ANALYTICS_DATA',
                                    feedId: parsedMessage.feedId,
                                    timestamp: new Date().toISOString(),
                                    value: Math.random() * 100,
                                    metric: 'user_activity',
                                    count: ++counter,
                                };
                                ws.send(JSON.stringify(data));
                                // Log this data point for further processing/audit if needed
                                logger.info('Sending analytics data', {
                                    ...messageContext, // Use message context for this outgoing data
                                    module: 'AnalyticsStream',
                                    action: 'ANALYTICS_DATA_SENT',
                                    resourceType: 'ANALYTICS_DATA_POINT',
                                    resourceId: parsedMessage.feedId,
                                    eventCategory: 'RealtimeAnalytics',
                                }, data);
                            } else {
                                clearInterval(interval); // Clear interval if connection closed
                            }
                        }, 2000); // Send data every 2 seconds

                        // Store interval to clear on close
                        (ws as any).activeInterval = interval;

                    } else if (parsedMessage.type === 'PING') {
                        logger.info(`Received PING from client`, { ...messageContext, action: 'WS_PING' });
                        ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
                    }
                    // Add other message types handlers here
                    else {
                        logger.warn(`Unknown WebSocket message type`, { ...messageContext, action: 'WS_UNKNOWN_MESSAGE_TYPE' }, parsedMessage);
                        ws.send(JSON.stringify({ error: 'Unknown message type' }));
                    }

                } catch (error) {
                    // --- 3. WebSocket-Specific Error Handling ---
                    // Log the error using the main logger, passing context and the actual error object
                    logger.error(
                        `Error processing WebSocket message`,
                        {
                            ...messageContext, // Use the message's context
                            action: 'WS_MESSAGE_ERROR', // Audit-worthy error action
                            eventCategory: 'WebSocket',
                            eventType: 'MessageProcessingError',
                        },
                        { rawMessage: message }, // Details: the raw message that caused the error
                        error // The actual error object
                    );
                    ws.send(JSON.stringify({ error: 'Failed to process message', details: (error as Error).message }));
                }
            }); // End wsNamespace.run() for message
        }); // End ws.on('message')

        ws.on('close', (code, reason) => {
            // Clean up any intervals if they were set
            if ((ws as any).activeInterval) {
                clearInterval((ws as any).activeInterval);
            }
            logger.info(`WebSocket client disconnected`, {
                ...getWsRequestContext(), // Use connection context for disconnect
                action: 'WS_CLIENT_DISCONNECTED', // Audit-worthy
                resourceType: 'WEBSOCKET_CONNECTION',
                resourceId: connectionId,
                wsCloseCode: code,
                closeReason: reason.toString()
            });
        });

        ws.on('error', (error) => {
            logger.fatal(`WebSocket connection error`, {
                ...getWsRequestContext(), // Use connection context for fatal error
                action: 'WS_CONNECTION_ERROR_FATAL', // Critical audit
                resourceType: 'WEBSOCKET_CONNECTION',
                resourceId: connectionId,
                eventCategory: 'WebSocket',
                eventType: 'ConnectionFailure',
            }, null, error); // Pass null for details, and the actual error
            ws.close(); // Ensure connection is closed on error
        });

    }); // End wsNamespace.run() for connection
});