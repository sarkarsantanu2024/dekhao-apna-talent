export type UserRole = "admin" | "center_owner";
export type PaymentStatus = "pending" | "approved" | "rejected";
export type StudentStatus = "pending" | "approved" | "rejected" | "active";
export type EnquiryStatus = "new" | "read" | "archived";

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
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  /** ISO date (YYYY-MM-DD) the centre started / joined. */
  start_date: string | null;
  /** Whether this centre is participating in the Dekhao Apna Talent event. */
  participating: boolean;
  /** Generated centre-owner login (demo). Sent to the owner over WhatsApp.
   *  These won't authenticate until Supabase auth is wired up. */
  login_id: string | null;
  login_password: string | null;
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
  /** The student this payment is for — approving it unlocks that student's chest card. */
  student_id: string | null;
  student_name: string | null;
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

export type ActivityType =
  // Centre actions → shown to admin
  | "students_added"
  | "payment_uploaded"
  | "payment_resubmitted"
  // Admin actions → shown to the affected centre
  | "payment_approved"
  | "payment_rejected"
  | "payment_reverted"
  | "student_rejected";

/** A notification feed entry. `audience` decides who sees it. */
export interface ActivityEvent {
  id: string;
  type: ActivityType;
  /** "admin" = a centre acted (admin sees it); "center" = admin acted (that centre sees it). */
  audience: "admin" | "center";
  message: string;
  center_id: string | null;
  center_name: string | null;
  created_at: string;
}

/** A public "Send a message" / enquiry-form submission from the website. */
export interface Enquiry {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  message: string;
  status: EnquiryStatus;
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
