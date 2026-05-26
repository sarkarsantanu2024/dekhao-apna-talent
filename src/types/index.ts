export type UserRole = "admin" | "center_owner";
export type PaymentStatus = "pending" | "approved" | "rejected";
export type StudentStatus = "pending" | "approved" | "rejected" | "active";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  center_id: string | null;
  phone: string | null;
  created_at: string;
}

export interface Center {
  id: string;
  center_name: string;
  owner_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  event_year: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  prefix: string;
  description: string | null;
  fee: number;
  active: boolean;
}

export interface Student {
  id: string;
  center_id: string | null;
  center_name: string;
  full_name: string;
  guardian_name: string;
  dob: string;
  age: number;
  class: string | null;
  school_name: string | null;
  category_id: string | null;
  category_name: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  photo_url: string | null;
  roll_number: string | null;
  status: StudentStatus;
  event_year: number;
  performance_topic: string | null;
  performance_details: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  center_id: string | null;
  center_name: string;
  uploaded_by: string | null;
  amount: number;
  transaction_ref: string | null;
  screenshot_url: string;
  status: PaymentStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  event_year: number;
  created_at: string;
}

export interface ChestCard {
  id: string;
  student_id: string;
  pdf_url: string | null;
  qr_payload: string;
  active: boolean;
  generated_at: string | null;
  created_at: string;
}
