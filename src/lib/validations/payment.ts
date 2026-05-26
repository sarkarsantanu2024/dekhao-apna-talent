import { z } from "zod";

export const paymentSchema = z.object({
  amount: z.coerce.number().positive(),
  transaction_ref: z.string().optional(),
  screenshot_url: z.string().url(),
  student_ids: z.array(z.string().uuid()).optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
