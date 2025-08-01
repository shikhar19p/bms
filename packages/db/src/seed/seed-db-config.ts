import path from 'path';
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

// Load the .env from this package's root directory
loadEnv({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  BMS_SUPER_ADMIN_EMAIL: z.string()
    .min(1, 'Super admin email is required')
    .max(100, 'Email is too long'),

  BMS_SUPER_ADMIN_PASSWORD: z.string()
    .min(1, 'Super admin password is required')
    .max(100, 'Password is too long'),

  BMS_SUPER_ADMIN_PHONE: z.string()
    .max(15, 'Phone number is too long')
    .optional(),

  BMS_SUPER_ADMIN_NAME: z.string()
    .max(50, 'Name is too long')
    .optional(),
});

const envVars = envSchema.parse(process.env);

export const seedDbConfig = {
  credentials: {
    superAdmin: {
      email: envVars.BMS_SUPER_ADMIN_EMAIL,
      password: envVars.BMS_SUPER_ADMIN_PASSWORD,
      phone: envVars.BMS_SUPER_ADMIN_PHONE,
      name: envVars.BMS_SUPER_ADMIN_NAME,
    },
  },
};

