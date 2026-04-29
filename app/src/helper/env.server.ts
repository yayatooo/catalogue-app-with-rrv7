import { z } from "zod";

const envSchema = z
  .object({
    // Database
    DATABASE_URL: z.string().url(),

    // Storage strategy
    STORAGE_PROVIDER: z.enum(["local", "r2"]).default("local"),

    // R2 (required when STORAGE_PROVIDER=r2)
    S3_CLIENTS: z.string().url().optional(),
    ACCESS_KEY: z.string().optional(),
    SECRET_KEY: z.string().optional(),
    R2_BUCKET: z.string().optional(),
    R2_PUBLIC_URL: z.string().url().optional(),

    // Local storage (dev)
    UPLOAD_DIR: z.string().default("./uploads"),
  })
  .superRefine((env, ctx) => {
    if (env.STORAGE_PROVIDER === "r2") {
      const required = [
        "S3_CLIENTS",
        "ACCESS_KEY",
        "SECRET_KEY",
        "R2_BUCKET",
        "R2_PUBLIC_URL",
      ] as const;
      for (const key of required) {
        if (!env[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} is required when STORAGE_PROVIDER=r2`,
          });
        }
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
