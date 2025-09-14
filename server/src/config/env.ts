// src/config/env.ts
import dotenv from "dotenv";
import { z } from "zod";

// Load .env only in non-production (for dev/test)
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Define schema
const envSchema = z.object({
  PORT: z
    .string()
    .default("8000")
    .refine((val) => !isNaN(Number(val)), { message: "PORT must be a number" }),

  MONGO_URI: z.string().url({ message: "MONGO_URI must be a valid URL" }),

  JWT_SECRET: z
    .string()
    .min(32, { message: "JWT_SECRET must be at least 32 characters long" }),

  CLIENT_URL: z.string().url({ message: "CLIENT_URL must be a valid URL" }),

  EMAIL: z.string().email({ message: "EMAIL must be a valid email" }),

  PASSWORD: z
    .string()
    .min(8, { message: "PASSWORD must be at least 8 characters" }),
});

// Parse and export with inferred type
const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>; // ✅ Type for autocompletion
export default env;
