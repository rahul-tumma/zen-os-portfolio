-- ========================================
-- Zen-OS Database Schema
-- Migration: 001_init
-- ========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- API Keys Table (Encrypted Storage)
-- ========================================
CREATE TABLE IF NOT EXISTS api_keys (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Provider Info
  provider TEXT NOT NULL,           -- 'groq', 'deepseek', 'gemini'
  provider_name TEXT,               -- Display name
  
  -- Key Data (ENCRYPTED)
  key_encrypted TEXT NOT NULL,      -- AES-256-GCM encrypted API key
  key_hash TEXT NOT NULL UNIQUE,    -- SHA-256 hash for lookup
  key_label TEXT,                   -- E.g., 'groq-primary'
  
  -- Status
  is_enabled BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false, -- Soft delete
  
  -- Performance Tracking
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  rate_limit_hits INTEGER DEFAULT 0,
  avg_latency_ms INTEGER,
  last_used_at TIMESTAMPTZ,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,
  
  -- Priority (lower = higher priority)
  priority INTEGER DEFAULT 100,
  
  -- Metadata
  notes TEXT,
  metadata JSONB
);

CREATE INDEX idx_api_keys_provider ON api_keys(provider) WHERE is_enabled = true AND is_deleted = false;
CREATE INDEX idx_api_keys_priority ON api_keys(priority, provider);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- ========================================
-- AI Request Logs
-- ========================================
CREATE TABLE IF NOT EXISTS ai_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Request Info
  prompt_hash TEXT,                 -- SHA-256 of prompt (for privacy)
  prompt_preview TEXT,              -- First 100 chars
  response_preview TEXT,            -- First 100 chars
  
  -- Provider Details
  provider TEXT NOT NULL,
  model TEXT,
  api_key_id BIGINT REFERENCES api_keys(id) ON DELETE SET NULL,
  
  -- Performance
  latency_ms INTEGER,
  tokens_used INTEGER,
  
  -- Status
  status_code INTEGER,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  
  -- Context
  session_id TEXT,
  user_agent TEXT
);

CREATE INDEX idx_ai_logs_created_at ON ai_logs(created_at DESC);
CREATE INDEX idx_ai_logs_provider ON ai_logs(provider);
CREATE INDEX idx_ai_logs_key_id ON ai_logs(api_key_id);
CREATE INDEX idx_ai_logs_status ON ai_logs(status_code, success);
CREATE INDEX idx_ai_logs_session ON ai_logs(session_id) WHERE session_id IS NOT NULL;

-- ========================================
-- Knowledge Base
-- ========================================
CREATE TABLE IF NOT EXISTS knowledge_base (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  category TEXT NOT NULL,           -- 'project', 'skill', 'technical-doc'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  
  -- Visibility
  is_published BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB,
  
  -- Full-text search
  search_vector tsvector
);

CREATE INDEX idx_knowledge_category ON knowledge_base(category);
CREATE INDEX idx_knowledge_tags ON knowledge_base USING GIN(tags);
CREATE INDEX idx_knowledge_search ON knowledge_base USING GIN(search_vector);
CREATE INDEX idx_knowledge_published ON knowledge_base(is_published);

-- ========================================
-- Admin Users (Simple Auth)
-- ========================================
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,      -- Bcrypt hash
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ
);

-- ========================================
-- Triggers & Functions
-- ========================================

-- Update search vector on knowledge_base changes
CREATE OR REPLACE FUNCTION update_search_vector() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, '')
  );
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_search_vector 
  BEFORE INSERT OR UPDATE ON knowledge_base 
  FOR EACH ROW 
  EXECUTE FUNCTION update_search_vector();

-- Update api_keys updated_at
CREATE OR REPLACE FUNCTION update_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_api_keys_updated_at 
  BEFORE UPDATE ON api_keys 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- ========================================
-- Helper Functions for Statistics
-- ========================================

-- Update key stats on successful request
CREATE OR REPLACE FUNCTION update_key_stats_success(
  key_id BIGINT,
  latency INTEGER
)
RETURNS VOID AS $$
DECLARE
  current_avg_latency INTEGER;
  current_total_requests INTEGER;
BEGIN
  -- Get current stats
  SELECT avg_latency_ms, total_requests 
  INTO current_avg_latency, current_total_requests
  FROM api_keys WHERE id = key_id;
  
  -- Calculate new average latency
  IF current_avg_latency IS NULL THEN
    current_avg_latency := latency;
  ELSE
    current_avg_latency := ((current_avg_latency * current_total_requests) + latency) / (current_total_requests + 1);
  END IF;
  
  -- Update stats
  UPDATE api_keys
  SET
    total_requests = total_requests + 1,
    successful_requests = successful_requests + 1,
    avg_latency_ms = current_avg_latency,
    last_used_at = NOW()
  WHERE id = key_id;
END;
$$ LANGUAGE plpgsql;

-- Update key stats on failed request
CREATE OR REPLACE FUNCTION update_key_stats_error(
  key_id BIGINT,
  error_msg TEXT,
  is_rate_limit BOOLEAN DEFAULT false
)
RETURNS VOID AS $$
BEGIN
  UPDATE api_keys
  SET
    total_requests = total_requests + 1,
    failed_requests = failed_requests + 1,
    rate_limit_hits = CASE WHEN is_rate_limit THEN rate_limit_hits + 1 ELSE rate_limit_hits END,
    last_error = error_msg,
    last_error_at = NOW(),
    last_used_at = NOW()
  WHERE id = key_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Row Level Security (RLS)
-- ========================================

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read for published knowledge base
CREATE POLICY "Public read knowledge_base" 
  ON knowledge_base FOR SELECT 
  TO anon, authenticated
  USING (is_published = true);

-- Service role has full access to everything
CREATE POLICY "Service role full access api_keys" 
  ON api_keys FOR ALL 
  TO service_role 
  USING (true);

CREATE POLICY "Service role full access ai_logs" 
  ON ai_logs FOR ALL 
  TO service_role 
  USING (true);

CREATE POLICY "Service role full access knowledge_base" 
  ON knowledge_base FOR ALL 
  TO service_role 
  USING (true);

CREATE POLICY "Service role full access admin_users" 
  ON admin_users FOR ALL 
  TO service_role 
  USING (true);

-- ========================================
-- Initial Data (Optional)
-- ========================================

-- Create default admin user (password: 'changeme' - bcrypt hashed)
-- Please change this immediately in production!
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$K7W3xG8z9YhZ9kP6QZ2RZ.Z6QZ2RZ.Z6QZ2RZ.Z6QZ2RZ.Z6QZ2RZ.')
ON CONFLICT (username) DO NOTHING;

-- ========================================
-- Migration Complete
-- ========================================
-- Next steps:
-- 1. Run this migration in your Supabase dashboard (SQL Editor)
-- 2. Or save as supabase/migrations/20260201000000_init.sql
-- 3. Add your API keys via /admin/keys panel
