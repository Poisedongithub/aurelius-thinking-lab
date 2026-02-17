import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://szfsulbbbhhuviewjlbf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZnN1bGJiYmhodXZpZXdqbGJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzI0MzUsImV4cCI6MjA4Njg0ODQzNX0.87dhM0yuCF0kdfgFYQoM3Q69IRdcr6gd_P5HMwk0arA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
