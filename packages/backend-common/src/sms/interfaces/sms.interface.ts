// bms-monorepo/packages/backend-common/sms/interfaces/sms.interface.ts

/**
 * Interface for an SMS sending service.
 */
export interface ISmsService {
    /**
     * Sends an SMS message to a recipient.
     * @param toPhoneNumber The recipient's phone number (E.164 format, e.g., +1234567890).
     * @param message The text message to send.
     * @returns A Promise that resolves when the SMS is sent, or rejects on failure.
     */
    sendSms(toPhoneNumber: string, message: string): Promise<void>;
}