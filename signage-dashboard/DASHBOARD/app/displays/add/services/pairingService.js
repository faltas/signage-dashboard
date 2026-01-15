export async function pairDisplay(supabase, code, userId) {
  return supabase
    .from("displays")
    .update({
      user_id: userId,
      status: "on",
      pairing_code: null
    })
    .eq("pairing_code", code)
    .is("user_id", null)
    .select();
}
