import { z } from "zod";

const envSchema = z.object({
	VITE_BACKEND_URL: z.url(),
	VITE_AUTH_URL: z.url(),
});


export const ENV = envSchema.parse(import.meta.env);
