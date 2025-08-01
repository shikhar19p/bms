import path from 'path';
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

// Load the .env from this package's root directory
loadEnv({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  EMAIL_HOST: z.string().default('smtp.example.com'),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_SECURE: z.string().default('false'),
  EMAIL_USER: z.string().default('your_email@example.com'),
  EMAIL_PASSWORD: z.string().default('your_email_password'),
  EMAIL_FROM: z.string().default('no-reply@your-app.com'),
  USER_WEB_URL: z.string().default('http://localhost:3000'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),
});

const envVars = envSchema.parse(process.env);

export const appConfig = {
  env: envVars.NODE_ENV,
  log: {
    serviceName: 'bms-backend',
    // ... other log configs
  },
  email: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    secure: envVars.EMAIL_SECURE === 'true',
    user: envVars.EMAIL_USER,
    password: envVars.EMAIL_PASSWORD,
    from: envVars.EMAIL_FROM,
  },
  userWebUrl: envVars.USER_WEB_URL,
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
  },
};