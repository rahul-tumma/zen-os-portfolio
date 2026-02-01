import { supabaseAdmin } from '@/lib/supabase/client'
import type { AILog } from '@/lib/supabase/client'
import crypto from 'crypto'

/**
 * Log a successful AI interaction
 */
export async function logSuccess(
    keyId: number,
    provider: string,
    model: string | undefined,
    latencyMs: number,
    promptPreview: string,
    responsePreview: string,
    tokensUsed?: number
): Promise<void> {
    try {
        const promptHash = crypto.createHash('sha256').update(promptPreview).digest('hex')

        // Log to ai_logs table
        await supabaseAdmin.from('ai_logs').insert({
            provider,
            model,
            api_key_id: keyId,
            latency_ms: latencyMs,
            tokens_used: tokensUsed,
            status_code: 200,
            success: true,
            prompt_hash: promptHash,
            prompt_preview: promptPreview.slice(0, 100),
            response_preview: responsePreview.slice(0, 100),
            session_id: null, // Can be added later with user sessions
        })

        // Update key statistics
        await supabaseAdmin.rpc('update_key_stats_success', {
            key_id: keyId,
            latency: latencyMs,
        })
    } catch (error) {
        console.error('Failed to log success:', error)
        // Don't throw - logging failure shouldn't break the app
    }
}

/**
 * Log a failed AI interaction
 */
export async function logError(
    keyId: number,
    provider: string,
    statusCode: number,
    errorMessage: string,
    promptPreview: string
): Promise<void> {
    try {
        const promptHash = crypto.createHash('sha256').update(promptPreview).digest('hex')

        // Log to ai_logs table
        await supabaseAdmin.from('ai_logs').insert({
            provider,
            api_key_id: keyId,
            status_code: statusCode,
            success: false,
            error_message: errorMessage,
            prompt_hash: promptHash,
            prompt_preview: promptPreview.slice(0, 100),
            session_id: null,
        })

        // Update key statistics
        await supabaseAdmin.rpc('update_key_stats_error', {
            key_id: keyId,
            error_msg: errorMessage,
            is_rate_limit: statusCode === 429,
        })
    } catch (error) {
        console.error('Failed to log error:', error)
        // Don't throw - logging failure shouldn't break the app
    }
}

/**
 * Get recent logs for analytics
 */
export async function getRecentLogs(limit: number = 50): Promise<AILog[]> {
    const { data, error } = await supabaseAdmin
        .from('ai_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Failed to fetch logs:', error)
        return []
    }

    return data as AILog[]
}

/**
 * Get logs for a specific key
 */
export async function getKeyLogs(keyId: number, limit: number = 50): Promise<AILog[]> {
    const { data, error } = await supabaseAdmin
        .from('ai_logs')
        .select('*')
        .eq('api_key_id', keyId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Failed to fetch key logs:', error)
        return []
    }

    return data as AILog[]
}
