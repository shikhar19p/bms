// apps/backend/src/services/email-service/index.ts

export * from './base-email.service';
export * from './auth/user/interfaces/email.interface';
export * from './utils/email-templates'; // Export templates for other services to use
export * from './otp-email-sender.service'