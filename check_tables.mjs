import { createClient } from '@supabase/supabase-js';
const sb = createClient(
  'https://szfsulbbbhhuviewjlbf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZnN1bGJiYmhodXZpZXdqbGJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI3MjQzNSwiZXhwIjoyMDg2ODQ4NDM1fQ.3MM-9h2k3L_ZmXBrJ9Tuu9vyIZ9U9uvxcBlbJ1r-Jio'
);

// Try to query each known table to see what exists
const tables = [
  'profiles', 'user_streaks', 'user_xp', 'user_achievements',
  'morality_profiles', 'sparring_sessions', 'dilemma_responses',
  'court_cases', 'court_verdicts', 'arena_progress',
  'market_analyses', 'market_watchlists', 'market_analysis_cache'
];

for (const t of tables) {
  const { data, error } = await sb.from(t).select('*').limit(1);
  if (error) {
    console.log(`❌ ${t}: ${error.message}`);
  } else {
    console.log(`✅ ${t}: exists (${data.length} sample rows)`);
  }
}
