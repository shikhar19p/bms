// // bms-monorepo/packages/backend-common/src/types/express/index.d.ts



 declare namespace Express {
    interface Request {
      correlationId: string;
      // Add other custom properties here if needed in the future
      // actorId?: string;
      // actorEmail?: string;
      // actorType?: LogContext['actorType'];
    }
  }
