// apps/http-backend/src/types/express/index.d.ts

declare namespace Express {
  interface Request {
    correlationId: string;
  }
}
