import { z } from "zod";

export const studentSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  guardian_name: z.string().min(2, "Guardian name is required"),
  dob: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  age: z.coerce.number().int().min(6).max(14),
  class: z.string().optional(),
  school_name: z.string().optional(),
  category_id: z.string().uuid().optional(),
  category_name: z.string().min(2),
  center_id: z.string().uuid().optional().nullable(),
  center_name: z.string().min(2),
  phone: z.string().min(7).max(20).optional(),
  whatsapp: z.string().min(7).max(20).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  photo_url: z.string().url().optional().nullable(),
  performance_topic: z.string().optional(),
  performance_details: z.string().optional(),
});

export type StudentInput = z.infer<typeof studentSchema>;
