import { z } from "zod";

export const studentSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  guardian_name: z.string().min(2, "Guardian name is required"),
  dob: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  age: z.coerce.number().int().min(6, "Age must be 6 or above").max(14, "Age must be 14 or below"),

  // Newly required fields
  class: z.string().min(1, "Class is required"),
  school_name: z.string().min(2, "School is required"),
  phone: z.string().min(7, "Phone is required").max(20),
  whatsapp: z.string().min(7, "WhatsApp is required").max(20),
  address: z.string().min(3, "Address is required"),

  category_id: z.string().min(1, "Pick a category").optional(),
  category_name: z.string().min(2, "Pick a category"),
  center_id: z.string().min(1).optional().nullable(),
  center_name: z.string().min(2),

  // Still optional
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  photo_url: z.string().optional().nullable(),
  performance_topic: z.string().optional(),
  performance_details: z.string().optional(),
});

export type StudentInput = z.infer<typeof studentSchema>;
