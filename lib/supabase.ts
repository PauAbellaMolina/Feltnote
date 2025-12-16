import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  "https://kkonvdhldvtedruvkhkg.supabase.co",
  "sb_publishable_veSIgtezyOmP0eWaR8Tqpw_nMTsxKJI"
);
