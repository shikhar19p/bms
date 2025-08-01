// apps/http-backend/src/app.ts

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
// @ts-ignore
import xss from 'xss-clean'; // Ensure this package is compatible with TypeScript or find type definitions
import hpp from 'hpp';
import compression from 'compression';

// ✅ Import your logger and middleware from backend-common
import { logger } from '@workspace/backend-common/logger';
import { contextMiddleware, requestLogger, errorHandler, getRequestContext } from '@workspace/backend-common/middleware';
import { requestNamespace } from '@workspace/backend-common/middleware'; // Direct import for namespaced context

import { ActorType } from '@workspace/db/client'; // Import ActorType for auth placeholder

import allRoutes from './routes';


import { authenticate } from './middleware/auth.middlware';

const app: express.Application = express();

// --- 🔐 Security and Standard Middleware ---
app.use(helmet());
app.use(express.json()); // Parses JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded request bodies
app.use(cookieParser()); // Parses cookies
// app.use(xss()); // Sanitizes user input to prevent XSS attacks
app.use(hpp()); // Protects against HTTP Parameter Pollution attacks
app.use(cors({
    origin: '*', // Adjust this to your specific frontend origins in production
    credentials: true,
}));
app.use(compression()); // Compresses response bodies for faster loading

// --- 🚦 Rate Limiting Middleware ---

// Apply a general rate limit to all API routes);

// --- ✅ Logging and Context Middleware (Order is CRUCIAL) ---

// 1. Context Middleware: Establishes request-scoped context (correlationId, IP, etc.)
// This MUST come before any other middleware or route handlers that need this context.
app.use(contextMiddleware);

// 2. Request Logger Middleware: Logs details about incoming HTTP requests.
// It uses the context established by contextMiddleware.
app.use(requestLogger);

// --- 🛡️ Authentication Middleware ---
app.use(authenticate);


// --- 🗺️ API Routes ---
app.use('/api', allRoutes); // All other application routes

// --- 🧼 404 Handler ---
// This middleware catches requests that fall through all defined routes.
// It should be placed BEFORE the global error handler.
app.use((req, res, next) => {
    const context = getRequestContext();
    logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
        ...context,
        action: 'ROUTE_NOT_FOUND',
        statusCode: 404,
        module: 'NotFoundHandler',
    });
    res.status(404).json({ message: 'Route not found' });
});

// --- 💥 Global Error Handler (MUST be the last app.use()) ---
// This middleware catches any errors that occur during request processing
// (e.g., thrown by routes or previous middleware).
app.use(errorHandler);

export default app;