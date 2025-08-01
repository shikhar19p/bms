// packages/backend-common/src/logger/transports/db-transport.ts

import { ILogTransport } from "../i-log-transport";
import { FormattedLogPayload } from "../log-formatter";
import { AppLogLevel, toPrismaLogLevel } from "../log-level";
import { PrismaClient, LogLevel as PrismaLogLevel, ActorType } from '@workspace/db/client'; // ✅ Import from your db package
import { AuditService, CreateAuditLogData } from '../../audit/audit-service'; // ✅ Your AuditService

/**
 * @class DbTransport
 * @implements ILogTransport
 * @description A log transport that persists audit-related log payloads to the database
 * via Prisma. It filters logs based on their level and/or specific audit context.
 */
export class DbTransport implements ILogTransport {
  private auditService: AuditService;
  private prisma: PrismaClient; // Keep a reference to PrismaClient if AuditService doesn't manage it

  constructor() {
    // Instantiate AuditService. Ensure PrismaClient is initialized correctly.
    // Ideally, the PrismaClient instance should be a singleton passed around.
    // For simplicity, instantiating here, but consider dependency injection.
    this.prisma = new PrismaClient(); // Or import from your @repo/db package if exported
    this.auditService = new AuditService(this.prisma); // Pass Prisma client to AuditService
  }

  async send(log: FormattedLogPayload): Promise<void> {
    const { timestamp, level, message, context = {}, details, error } = log;

    // ✅ Define criteria for what constitutes an 'audit log' for database persistence.
    // This is crucial. For example:
    // 1. All SUCCESS logs are audit logs.
    // 2. All ERROR/FATAL logs are audit logs.
    // 3. Any log with an 'action' field in its context is an audit log.
    const isAuditLog =
      level === AppLogLevel.SUCCESS ||
      level === AppLogLevel.ERROR ||
      level === AppLogLevel.FATAL ||
     context.action !== undefined;

    if (!isAuditLog) {
      return; // Not an audit log, do not save to DB
    }

   try {
    const prismaLevel: PrismaLogLevel = toPrismaLogLevel(level) as PrismaLogLevel;

    const auditData: CreateAuditLogData = {
      timestamp: new Date(timestamp),
      level: prismaLevel,
      message: message,
      service: context.service || 'unknown',
      module: context.module,
      correlationId: context.correlationId,
      actorId: context.actorId,
      actorType: context.actorType ?? ActorType.SYSTEM,
      actorEmail: context.actorEmail,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      httpMethod: context.httpMethod,
      urlPath: context.urlPath,
      statusCode: context.statusCode,
      action: context.action ?? 'GENERIC_LOG_EVENT',
      resourceType: context.resourceType,
      resourceId: context.resourceId,
      oldValue: context.oldValue,
      newValue: context.newValue,
      details,
      error,
    };

    await this.auditService.createAuditLog(auditData);
  } catch (err) {
    console.error('DbTransport: Failed to save audit log to database:', err, log);
  }
}
  }
