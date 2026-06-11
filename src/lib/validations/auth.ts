import { z } from "zod";

export const loginSchema = z.object({
  userId: z.string().min(3, "Enter your user ID"),
  password: z.string().min(4, "Enter your password"),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(7).max(20).optional(),
  center_name: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
  address: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
