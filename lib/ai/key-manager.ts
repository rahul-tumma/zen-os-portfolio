import { supabaseAdmin } from '@/lib/supabase/client'
import { decryptAPIKey } from '@/lib/crypto'
import { get as getFromRedis, setWithExpiry } from '@/lib/redis/client'
import type { APIKey } from '@/lib/supabase/client'

export type Provider = 'groq' | 'deepseek' | 'gemini'

export interface ProviderKey {
    id: number
    provider: Provider
    key: string
    label?: string
    priority: number
}

export interface ProviderConfig {
    name: Provider
    keys: ProviderKey[]
    avgPriority: number
}

/**
 * Load all enabled API keys from Supabase and decrypt them
 */
export async function loadProviders(): Promise<ProviderConfig[]> {
    try {
        // Fetch enabled, non-deleted keys sorted by priority
        const { data: keys, error } = await supabaseAdmin
            .from('api_keys')
            .select('*')
            .eq('is_enabled', true)
            .eq('is_deleted', false)
            .order('priority', { ascending: true })

        if (error) {
            console.error('Failed to load API keys:', error)
            return []
        }

        if (!keys || keys.length === 0) {
            console.warn('⚠️  No API keys configured in database')
            return []
        }

        // Group keys by provider
        const providerMap = new Map<Provider, ProviderKey[]>()

        for (const key of keys as APIKey[]) {
            const provider = key.provider as Provider

            if (!providerMap.has(provider)) {
                providerMap.set(provider, [])
            }

            try {
                // Decrypt the API key
                const decryptedKey = decryptAPIKey(key.key_encrypted)

                providerMap.get(provider)!.push({
                    id: key.id,
                    provider,
                    key: decryptedKey,
                    label: key.key_label || undefined,
                    priority: key.priority,
                })
            } catch (error) {
                console.error(`Failed to decrypt key ${key.id}:`, error)
                continue
            }
        }

        // Convert to array and calculate average priority
        const providers: ProviderConfig[] = Array.from(providerMap.entries()).map(
            ([name, keys]) => ({
                name,
                keys,
                avgPriority: keys.reduce((sum, k) => sum + k.priority, 0) / keys.length,
            })
        )

        // Sort providers by average priority (lower = better)
        providers.sort((a, b) => a.avgPriority - b.avgPriority)

        return providers
    } catch (error) {
        console.error('Error loading providers:', error)
        return []
    }
}

/**
 * Check if a specific key is blacklisted in Redis
 */
export async function isKeyBlacklisted(
    provider: Provider,
    keyId: number
): Promise<boolean> {
    const blacklistKey = `blacklist:${provider}:${keyId}`
    const value = await getFromRedis(blacklistKey)
    return value !== null
}

/**
 * Blacklist a key for a specific duration (in seconds)
 */
export async function blacklistKey(
    provider: Provider,
    keyId: number,
    durationSeconds: number
): Promise<void> {
    const blacklistKey = `blacklist:${provider}:${keyId}`
    await setWithExpiry(blacklistKey, '1', durationSeconds)
    console.log(
        `🚫 Blacklisted ${provider} key ${keyId} for ${durationSeconds}s`
    )
}

/**
 * Get an available key for a specific provider
 * Returns null if no keys are available (all blacklisted)
 */
export async function getAvailableKey(
    provider: ProviderConfig
): Promise<ProviderKey | null> {
    for (const key of provider.keys) {
        const isBlacklisted = await isKeyBlacklisted(provider.name, key.id)
        if (!isBlacklisted) {
            return key
        }
    }
    return null
}
