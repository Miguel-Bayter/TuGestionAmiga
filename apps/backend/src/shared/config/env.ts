/**
 * Environment variable validation and configuration
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

// Load .env.local first, then .env as fallback
loadEnv({ path: resolve(process.cwd(), '.env.local') });
loadEnv(); // Load .env if .env.local doesn't exist

const requiredEnvVars = ['DATABASE_URL', 'NODE_ENV', 'PORT'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
};

export default config;
