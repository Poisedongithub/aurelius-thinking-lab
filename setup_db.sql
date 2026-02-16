-- ============================================
-- Aurelius Thinking Lab - Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ──
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT 'Philosopher',
  avatar_initials TEXT DEFAULT 'PH',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── User XP ──
CREATE TABLE IF NOT EXISTS user_xp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── User Streaks ──
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Sparring Sessions ──
CREATE TABLE IF NOT EXISTS sparring_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent TEXT NOT NULL,
  topic TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  score INTEGER DEFAULT 0,
  rounds_scored INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Arena Progress ──
CREATE TABLE IF NOT EXISTS arena_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  philosopher_id TEXT NOT NULL,
  arena_level INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  best_score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, philosopher_id, arena_level)
);

-- ── User Achievements ──
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ── Morality Profiles ──
CREATE TABLE IF NOT EXISTS morality_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alignment TEXT DEFAULT 'Undetermined',
  alignment_description TEXT DEFAULT '',
  compassion_vs_logic FLOAT DEFAULT 0,
  individual_vs_collective FLOAT DEFAULT 0,
  rules_vs_outcomes FLOAT DEFAULT 0,
  idealism_vs_pragmatism FLOAT DEFAULT 0,
  mercy_vs_justice FLOAT DEFAULT 0,
  total_answered INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE arena_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE morality_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User XP policies
CREATE POLICY "Users can view own xp" ON user_xp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own xp" ON user_xp FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own xp" ON user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Streaks policies
CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON user_streaks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sparring Sessions policies
CREATE POLICY "Users can view own sessions" ON sparring_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON sparring_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON sparring_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Arena Progress policies
CREATE POLICY "Users can view own arena progress" ON arena_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own arena progress" ON arena_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own arena progress" ON arena_progress FOR UPDATE USING (auth.uid() = user_id);

-- User Achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Morality Profiles policies
CREATE POLICY "Users can view own morality" ON morality_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own morality" ON morality_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own morality" ON morality_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Auto-create profile on signup (trigger)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_initials)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Philosopher'), COALESCE(UPPER(LEFT(NEW.raw_user_meta_data->>'display_name', 2)), 'PH'));
  
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (NEW.id, 0, 1);
  
  INSERT INTO public.user_streaks (user_id, current_streak, longest_streak)
  VALUES (NEW.id, 0, 0);
  
  INSERT INTO public.morality_profiles (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
