
import { z } from 'zod';



const envSchema = z.object({

  NODE_ENV: z.enum(['development', 'production', 'test'])
            .default('development'),
    PORT: z.coerce.number().default(3000),

    USER_WEB_URL: z.string()
        .min(1, 'User web url is required')
        .max(200, 'User web url is too long'),

    ADMIN_WEB_URL: z.string()
        .min(1, 'Admin web url is required')
        .max(200, 'Admin web url is too long'),

    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().default(''),

    TWILIO_ACCOUNT_SID: z.string().min(1, 'Twilio Account SID is required'),
    TWILIO_AUTH_TOKEN: z.string().min(1, 'Twilio Auth Token is required'),
    TWILIO_PHONE_NUMBER: z.string().min(9, 'Phone number is required'),

    GOOGLE_CLIENT_ID: z.string().min(1, 'Google Client ID is required'),
    GOOGLE_CLIENT_SECRET: z.string().min(1, 'Google Client Secret is required'),
    GOOGLE_REDIRECT_URI: z.string().min(1, 'Google OAuth2 Redirect URI is required'),

    JWT_LINKING_SECRET: z.string().min(1, 'JWT Linking Secret is required'),
    JWT_LINKING_EXPIRY: z.coerce.number().default(60 * 60 * 24 * 7), // 7 days in seconds

    DEFAULT_USER_ROLE_ID: z.string().min(1, 'Default user role ID is required')
    .max(200, 'Default user role ID is too long'),

    EMAIL_HOST: z.string().min(1, 'Email host is required')
    .max(200, 'Email host is too long'),
    EMAIL_PORT: z.coerce.number().default(587),
    EMAIL_USER: z.string().min(1, 'Email user is required'),
    EMAIL_PASSWORD: z.string().min(1, 'Email password is required'),
    EMAIL_FROM: z.string().min(1, 'Email from is required'),

    LOCK_THRESHOLD: z.coerce.number().default(3),
    LOCK_DURATION_MINUTES: z.coerce.number().default(15*60), // 15 minutes in seconds

 LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'success'])
            .default('info'),
 SERVICE_NAME: z.string()
    .min(1, 'Service name is required')
    .default('default-service'),
    ELK_ENDPOINT: z.string().url().optional().describe('Optional URL for the ELK/centralized logging endpoint'),

    OTP_EXPIRATION_SECONDS: z.coerce.number().default(60 * 1), 
    PASSWORD_MIN_LENGTH: z.coerce.number().default(8),
    PASSWORD_MAX_LENGTH: z.coerce.number().default(128),
}); 

const envVars = envSchema.parse(process.env);

export const  config = {

  env: envVars.NODE_ENV,
  port:envVars.PORT,
userWebUrl: envVars.USER_WEB_URL,
adminWebUrl: envVars.ADMIN_WEB_URL,
auth:{
  otpExpirationSeconds: envVars.OTP_EXPIRATION_SECONDS,
  passwordMinLength: envVars.PASSWORD_MIN_LENGTH,
  passwordMaxLength: envVars.PASSWORD_MAX_LENGTH,
  lockThreshold: envVars.LOCK_THRESHOLD,
  lockDurationMinutes: envVars.LOCK_DURATION_MINUTES,
},
redis: {
    host: envVars.REDIS_HOST || 'localhost',
    port: envVars.REDIS_PORT || 6379,
    password: envVars.REDIS_PASSWORD || '',
  },
  twilio: {
    accountSid: envVars.TWILIO_ACCOUNT_SID,
    authToken: envVars.TWILIO_AUTH_TOKEN,
    phoneNumber: envVars.TWILIO_PHONE_NUMBER,
  },

  google: {
    clientId: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
    redirectUri: envVars.GOOGLE_REDIRECT_URI,   
  },
  jwtLinking: {
    secret: envVars.JWT_LINKING_SECRET,
    expiry: envVars.JWT_LINKING_EXPIRY,
  },
  email: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    user: envVars.EMAIL_USER,
    password: envVars.EMAIL_PASSWORD,
    from: envVars.EMAIL_FROM,
  },

  log: {
    level: envVars.LOG_LEVEL,
    serviceName: envVars.SERVICE_NAME,
    elkEndpoint: envVars.ELK_ENDPOINT,
},

};

