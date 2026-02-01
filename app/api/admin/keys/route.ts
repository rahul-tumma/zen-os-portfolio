import { supabaseAdmin } from '@/lib/supabase/client'
import { encryptAPIKey, hashAPIKey } from '@/lib/crypto'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Add a new API key (protected - requires authentication)
 */
export async function POST(req: NextRequest) {
    try {
        const {
            provider,
            apiKey,
            label,
            priority = 100,
            enabled = true,
        } = await req.json()

        if (!provider || !apiKey) {
            return NextResponse.json(
                { error: 'Provider and apiKey are required' },
                { status: 400 }
            )
        }

        // Validate provider
        if (!['groq', 'deepseek', 'gemini'].includes(provider)) {
            return NextResponse.json(
                { error: 'Invalid provider. Must be groq, deepseek, or gemini' },
                { status: 400 }
            )
        }

        // Encrypt and hash the key
        const encryptedKey = encryptAPIKey(apiKey)
        const keyHash = hashAPIKey(apiKey)

        // Insert into database
        const { data, error } = await supabaseAdmin
            .from('api_keys')
            .insert({
                provider,
                key_encrypted: encryptedKey,
                key_hash: keyHash,
                key_label: label || null,
                priority,
                is_enabled: enabled,
            })
            .select()
            .single()

        if (error) {
            console.error('Failed to insert API key:', error)
            return NextResponse.json(
                { error: 'Failed to save API key' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            id: data.id,
            message: 'API key added successfully',
        })
    } catch (error: any) {
        console.error('Add key error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * List all API keys (without exposing the actual keys)
 */
export async function GET(req: NextRequest) {
    try {
        const { data: keys, error } = await supabaseAdmin
            .from('api_keys')
            .select('*')
            .eq('is_deleted', false)
            .order('priority', { ascending: true })

        if (error) {
            console.error('Failed to fetch keys:', error)
            return NextResponse.json(
                { error: 'Failed to fetch keys' },
                { status: 500 }
            )
        }

        // Remove sensitive data before sending to client
        const sanitized = keys.map((key) => ({
            id: key.id,
            created_at: key.created_at,
            updated_at: key.updated_at,
            provider: key.provider,
            provider_name: key.provider_name,
            key_label: key.key_label,
            is_enabled: key.is_enabled,
            total_requests: key.total_requests,
            successful_requests: key.successful_requests,
            failed_requests: key.failed_requests,
            rate_limit_hits: key.rate_limit_hits,
            avg_latency_ms: key.avg_latency_ms,
            last_used_at: key.last_used_at,
            last_error: key.last_error,
            last_error_at: key.last_error_at,
            priority: key.priority,
            notes: key.notes,
        }))

        return NextResponse.json({ keys: sanitized })
    } catch (error: any) {
        console.error('List keys error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
