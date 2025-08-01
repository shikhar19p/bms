// bms-monorepo/packages/backend-common/notifications/sms/index.ts

// Re-export the SMS interface
export * from './interfaces/sms.interface';

// Re-export the concrete Twilio SMS service
export * from './twilio.sms.service';
