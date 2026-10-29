const { z } = require('zod');
require('dotenv').config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string().min(1),
  GOOGLE_CLIENT_IDS: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  APP_RESET_URL: z.string().default('eventlycustomer://reset-password'),
  ESTIMATE_TAX_RATE: z.coerce.number().min(0).max(1).default(0),
  ESTIMATE_ADVANCE_RATE: z.coerce.number().min(0).max(1).default(0.2),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')}`);
}

module.exports = parsed.data;
