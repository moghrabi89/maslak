import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL starting with postgresql:// or postgres://"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  UPLOADTHING_SECRET: z.string().min(1, "UPLOADTHING_SECRET is required"),
  UPLOADTHING_APP_ID: z.string().min(1, "UPLOADTHING_APP_ID is required"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
});

const isServer = typeof window === "undefined";

const serverEnv = isServer
  ? serverSchema.safeParse({
      DATABASE_URL: process.env.DATABASE_URL,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
      UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    })
  : { success: true, data: {} as any, error: null };

const clientEnv = clientSchema.safeParse({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

if (!clientEnv.success) {
  console.error("❌ Invalid client environment variables:", clientEnv.error.format());
  throw new Error("Invalid client environment variables");
}

if (isServer && !serverEnv.success) {
  console.error("❌ Invalid server environment variables:", serverEnv.error?.format());
  throw new Error("Invalid server environment variables");
}

export const env = {
  ...clientEnv.data,
  ...(isServer ? serverEnv.data : {}),
} as typeof clientEnv.data & typeof serverEnv.data;
export default env;
