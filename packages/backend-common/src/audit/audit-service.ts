// packages/backend-common/src/audit/auditService.ts

import {
    PrismaClient,
    AuditLog,
    LogLevel as PrismaLogLevel,
    ActorType,
} from '@workspace/db/client';



export interface CreateAuditLogData {
    timestamp?: Date;
    level: PrismaLogLevel;
    message: string;
    service: string;
    module?: string | null;
    correlationId?: string | null;
    actorId?: string | null; // Keep this
    actorType?: ActorType | null; // Keep this
    actorEmail?: string | null; // Keep this
    ipAddress?: string | null;
    userAgent?: string | null;
    httpMethod?: string | null;
    urlPath?: string | null;
    statusCode?: number | null;
    action: string;
    resourceType?: string | null;
    resourceId?: string | null;
    oldValue?: object | null;
    newValue?: object | null;
    details?: object | null;
    error?: object | null;
}

export class AuditService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    public async createAuditLog(data: CreateAuditLogData): Promise<AuditLog | null> {
        try {
            const {
                actorType = ActorType.USER,
                actorId,
                ...restData
            } = data;

            const auditLog = await this.prisma.auditLog.create({
                data: {
                    ...restData,
                    actorType: actorType || undefined,
                    actorId: actorType === ActorType.ANONYMOUS ? null : actorId,
                    timestamp: data.timestamp || new Date(),
                    oldValue: data.oldValue ? JSON.stringify(data.oldValue) : undefined,
                    newValue: data.newValue ? JSON.stringify(data.newValue) : undefined,
                    details: data.details ? JSON.stringify(data.details) : undefined,
                    error: data.error ? JSON.stringify(data.error) : undefined,
                },
            });

            return auditLog;
        } catch (err: any) {
            // This is the CRITICAL point: log the failure of saving an audit log.
            // DO NOT use the main application logger to prevent recursion.
            // Use console.error or a truly independent, simple logger (e.g., file-only).

            // Extract only the most crucial, flat information from the original 'data'
            // that was intended to be logged, especially actor and action details.
            const essentialAuditDataSummary = {
                message: data.message,
                level: data.level,
                service: data.service,
                module: data.module,
                correlationId: data.correlationId,
                actorId: data.actorId,         // <-- KEEP THIS
                actorType: data.actorType,     // <-- KEEP THIS
                actorEmail: data.actorEmail,   // <-- KEEP THIS
                action: data.action,
                resourceType: data.resourceType,
                resourceId: data.resourceId,
                // OMIT: oldValue, newValue, details, error from 'data' to prevent over-nesting/size
            };

       const errorDetails = {
                name: err.name || 'UnknownError',
                message: err.message || String(err),
                stack: err.stack, // Rename to 'stack' for consistency with common error objects
            };

            // Log this critical failure to console. This output should be monitored
            // by your infrastructure (e.g., CloudWatch, Splunk).
            console.error(
                'AUDIT LOG WRITE FAILURE: Could not persist audit entry.',
                {
                    intendedAudit: { // Concise summary of what was meant to be logged
                        message: data.message,
                        level: data.level,
                        service: data.service,
                        module: data.module,
                        correlationId: data.correlationId,
                        actorId: data.actorId,
                        actorType: data.actorType,
                        actorEmail: data.actorEmail,
                        action: data.action,
                        resourceType: data.resourceType,
                        resourceId: data.resourceId,
                    },
                    databaseError: { // Details of the actual error preventing write
                        name: err.name || 'UnknownError',
                        message: err.message || String(err),
                        stack: err.stack,
                    },
                    sourceService: 'AuditService',
                    sourceMethod: 'createAuditLog',
                }
            );

            // In a highly critical production system, you might consider:
            // 1. Sending an alert (e.g., PagerDuty, Slack) directly from here.
            // 2. Writing to a fallback file system if the DB is down.

            return null; // Indicate that the audit log could not be saved
        }
    }
}