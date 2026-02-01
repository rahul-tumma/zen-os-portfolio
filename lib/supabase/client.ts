import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client (limited permissions)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (full permissions - use carefully!)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database types (will be auto-generated later)
export type APIKey = {
    id: number
    created_at: string
    updated_at: string
    provider: string
    provider_name?: string
    key_encrypted: string
    key_hash: string
    key_label?: string
    is_enabled: boolean
    is_deleted: boolean
    total_requests: number
    successful_requests: number
    failed_requests: number
    rate_limit_hits: number
    avg_latency_ms?: number
    last_used_at?: string
    last_error?: string
    last_error_at?: string
    priority: number
    notes?: string
    metadata?: any
}

export type AILog = {
    id: number
    created_at: string
    prompt_hash?: string
    prompt_preview?: string
    response_preview?: string
    provider: string
    model?: string
    api_key_id?: number
    latency_ms?: number
    tokens_used?: number
    status_code?: number
    success: boolean
    error_message?: string
    session_id?: string
    user_agent?: string
}

export type KnowledgeBase = {
    id: number
    created_at: string
    updated_at: string
    category: string
    title: string
    content: string
    tags?: string[]
    is_published: boolean
    metadata?: any
}
