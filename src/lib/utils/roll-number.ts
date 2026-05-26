import { supabaseAdmin } from "@/lib/supabase/admin";

/** Atomically generates the next roll number via the SQL function. */
export async function generateRollNumber(prefix: string, year: number): Promise<string> {
  const { data, error } = await supabaseAdmin().rpc("next_roll_number", {
    p_prefix: prefix.toUpperCase(),
    p_year: year,
  });
  if (error) throw new Error(`Roll number generation failed: ${error.message}`);
  return data as string;
}
