// apps/http-backend/src/index.ts

// ✅ 1. ABSOLUTE FIRST LINES: Load dotenv for this specific application
// This MUST be the very first thing executed in this file.
import { config as loadEnv } from 'dotenv';
import path from 'path';
// Use override: true to force your app's .env values to take precedence
loadEnv({ path: path.resolve(__dirname, '../.env'), override: true });




// ✅ 2. Now, import your Express app, logger, and the shared config
import app from './app'; // Assuming app.ts exports the Express app
import { logger } from '@workspace/backend-common/logger';
import { config } from '@workspace/backend-common/config'; // ✅ IMPORT THE SHARED CONFIG


// const ELK_ENDPOINT =config.log.elkEndpoint;
// console.log('ELK_ENDPOINT:', ELK_ENDPOINT);
// ✅ Use config.port, config.log.serviceName, and config.env directly
const PORT = config.port;
const SERVICE_NAME = config.log.serviceName;
const NODE_ENV = config.env; // For consistency, though errorHandler already reads process.env.NODE_ENV

// The comments about adjusting errorHandler.ts are now less relevant if errorHandler
// directly reads process.env.NODE_ENV, which is a good, decoupled approach.
// So, no changes needed for errorHandler.ts if it uses process.env.NODE_ENV.

app.listen(PORT, () => {
    // ✅ Use the values from the imported 'config' object
    logger.info(`🚀HTTP Backend Service (${SERVICE_NAME}) running on port ${PORT}`);
    console.log(`🚀HTTP Backend Service running on http://localhost:${PORT}`);
});