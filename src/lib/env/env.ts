import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3000/api/mock"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().regex(/^\+?[1-9]\d{7,14}$/).optional(),
  ),
});

const parsedPublicEnv = publicEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
});

if (!parsedPublicEnv.success) {
  const formattedErrors = parsedPublicEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");

  throw new Error(`Invalid public environment variables: ${formattedErrors}`);
}

export const env = parsedPublicEnv.data;
