import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const dbConfigs = {
  development: {
    url: process.env.DEV_DATABASE_URL,
  },
  testing: {
    url: process.env.TEST_DATABASE_URL,
  },
  production: {
    url: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20,
  }
};

if (!dbConfigs[env].url) {
  throw new Error(`${env.toUpperCase()}_DATABASE_URL is not defined, ensure the database is provisioned`);
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: dbConfigs[env],
  log: {
    level: "info",
    filepath: "./logs/migrations.log",
  },
});
