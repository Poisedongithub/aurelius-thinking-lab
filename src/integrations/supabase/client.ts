import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://szfsulbbbhhuviewjlbf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Ao5bC2ltt-nG0zeHTIfyPg_Tx3irKXa";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
