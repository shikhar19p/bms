// apps/backend/src/services/email-service/utils/email-templates.ts


interface EmailVerificationTemplateParams {
    verificationLink: string;
    expiresInMinutes: number;
}

export const getEmailVerificationTemplate = (params: EmailVerificationTemplateParams) => {
    const { verificationLink, expiresInMinutes } = params;
    const subject = 'Verify Your Email Address for Your App';
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #0056b3;">Welcome to Our Platform!</h2>
            <p>Hi there,</p>
            <p>Thank you for registering with our platform. To complete your registration and activate your account, please verify your email address by clicking the link below:</p>
            <p style="margin: 20px 0;">
                <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
            </p>
            <p>This link is valid for ${expiresInMinutes} minutes.</p>
            <p>If you did not register for this service, please ignore this email. Your account will not be activated.</p>
            <p>Thanks,</p>
            <p>The Team</p>
        </div>
    `;
    const text = `
        Welcome to Our Platform!

        Hi there,

        Thank you for registering with our platform. To complete your registration and activate your account, please verify your email address by clicking the link below:

        ${verificationLink}

        This link is valid for ${expiresInMinutes} minutes.

        If you did not register for this service, please ignore this email. Your account will not be activated.

        Thanks,
        The Team
    `;
    return { subject, html, text };
};


    interface PasswordResetTemplateParams {
    userName: string; // Added userName to the interface
    resetUrl: string;
    expiresInMinutes: number;
}


export const getPasswordResetEmailTemplate = (params: PasswordResetTemplateParams) => {
    const subject = 'Reset your password';
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #0056b3;">Password Reset Request</h2>
            <p>Hello ${params.userName},</p> <!-- Using userName here -->
            <p>You have requested to reset your password. Please click on the link below to complete the process:</p>
            <p><a href="${params.resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>This link will expire in ${params.expiresInMinutes} minutes.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>Thanks,</p>
            <p>The BookMySports Team</p>
        </div>
    `;
    const text = `
        Password Reset Request\n\n
        Hello ${params.userName},\n\n <!-- Using userName here -->
        You have requested to reset your password. Please copy and paste the link below into your browser to complete the process:\n\n
        ${params.resetUrl}\n\n
        This link will expire in ${params.expiresInMinutes} minutes.\n\n
        If you did not request a password reset, please ignore this email.\n\n
        Thanks,\n
        The BookMySports Team
    `;

    return { subject, html, text };
}

interface OtpEmailTemplateParams {
    otp: string;
    expiresInMinutes: number;
}

export const getOtpEmailTemplate = (params: OtpEmailTemplateParams) => {
    const { otp, expiresInMinutes } = params;
    const subject = 'Your One-Time Password (OTP) for Login';
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #0056b3;">Your One-Time Password</h2>
            <p>Hi,</p>
            <p>You requested a One-Time Password (OTP) for your login. Please use the following OTP to complete your sign-in:</p>
            <p style="margin: 20px 0; font-size: 24px; font-weight: bold; color: #d9534f;">${otp}</p>
            <p>This OTP is valid for ${expiresInMinutes} minutes.</p>
            <p>If you did not request this OTP, please ignore this email.</p>
            <p>Thanks,</p>
            <p>The Team</p>
        </div>
    `;
    const text = `
        Your One-Time Password (OTP) for Login

        Hi,

        You requested a One-Time Password (OTP) for your login. Please use the following OTP to complete your sign-in:

        ${otp}

        This OTP is valid for ${expiresInMinutes} minutes.

        If you did not request this OTP, please ignore this email.

        Thanks,
        The Team
    `;
    return { subject, html, text };
}