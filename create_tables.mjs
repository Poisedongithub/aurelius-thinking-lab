import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://szfsulbbbhhuviewjlbf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZnN1bGJiYmhodXZpZXdqbGJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI3MjQzNSwiZXhwIjoyMDg2ODQ4NDM1fQ.3MM-9h2k3L_ZmXBrJ9Tuu9vyIZ9U9uvxcBlbJ1r-Jio'
);

// We'll use the Supabase REST API to execute SQL via the management API
// Since we can't run raw SQL through supabase-js, we'll use fetch to the SQL endpoint

const SUPABASE_URL = 'https://szfsulbbbhhuviewjlbf.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZnN1bGJiYmhodXZpZXdqbGJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI3MjQzNSwiZXhwIjoyMDg2ODQ4NDM1fQ.3MM-9h2k3L_ZmXBrJ9Tuu9vyIZ9U9uvxcBlbJ1r-Jio';

async function execSQL(sql) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    // If exec_sql doesn't exist, we'll need another approach
    throw new Error(`SQL exec failed: ${resp.status} ${text}`);
  }
  return resp.json();
}

// Alternative: use the pg REST endpoint directly
async function createTableViaRest(tableName, testInsert) {
  // Try inserting a test row - if table doesn't exist, it will fail
  const { data, error } = await sb.from(tableName).select('*').limit(1);
  if (!error) {
    console.log(`✅ ${tableName} already exists`);
    return true;
  }
  console.log(`❌ ${tableName} needs to be created`);
  return false;
}

// Check which tables need creation
const tablesToCheck = ['court_cases', 'court_verdicts', 'market_analysis_cache', 'market_watchlists', 'market_ticker_views'];

console.log('=== Checking tables ===');
for (const t of tablesToCheck) {
  await createTableViaRest(t);
}

console.log('\n=== Attempting to create tables via SQL ===');

const createStatements = [
  // Court cases table
  `CREATE TABLE IF NOT EXISTS court_cases (
    id TEXT PRIMARY KEY,
    case_date DATE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    scenario TEXT,
    defendant TEXT,
    charge TEXT,
    prosecution JSONB,
    defense JSONB,
    verdict_options JSONB,
    moral_dimensions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Court verdicts table
  `CREATE TABLE IF NOT EXISTS court_verdicts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    case_id TEXT NOT NULL,
    case_date DATE,
    verdict TEXT NOT NULL,
    reasoning TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, case_id)
  )`,

  // Market analysis cache
  `CREATE TABLE IF NOT EXISTS market_analysis_cache (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL,
    section TEXT NOT NULL,
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, section)
  )`,

  // Market watchlists
  `CREATE TABLE IF NOT EXISTS market_watchlists (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    symbols TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Market ticker views (recently viewed)
  `CREATE TABLE IF NOT EXISTS market_ticker_views (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    symbol TEXT NOT NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
  )`
];

for (const sql of createStatements) {
  try {
    const result = await execSQL(sql);
    console.log('✅ Executed:', sql.slice(0, 60) + '...');
  } catch (err) {
    console.log('⚠️  Could not execute via RPC:', err.message.slice(0, 100));
    console.log('   SQL:', sql.slice(0, 60) + '...');
  }
}
