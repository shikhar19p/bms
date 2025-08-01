// apps/backend/src/services/email-service/interfaces/email.interface.ts

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string; // Allow overriding the default 'from' address
    // Add other nodemailer options if needed, e.g., attachments, replyTo, cc, bcc
    // attachments?: Attachment[];
}