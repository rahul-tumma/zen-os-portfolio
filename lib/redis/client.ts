import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('⚠️ Redis environment variables not set. Rate limiting will use in-memory fallback.')
}

export const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null

// In-memory fallback for development
const inMemoryCache = new Map<string, { value: string; expiry: number }>()

export async function setWithExpiry(key: string, value: string, seconds: number): Promise<void> {
    if (redis) {
        await redis.setex(key, seconds, value)
    } else {
        // In-memory fallback
        inMemoryCache.set(key, {
            value,
            expiry: Date.now() + seconds * 1000,
        })
    }
}

export async function get(key: string): Promise<string | null> {
    if (redis) {
        return await redis.get<string>(key)
    } else {
        // In-memory fallback
        const cached = inMemoryCache.get(key)
        if (!cached) return null

        if (Date.now() > cached.expiry) {
            inMemoryCache.delete(key)
            return null
        }

        return cached.value
    }
}

export async function del(key: string): Promise<void> {
    if (redis) {
        await redis.del(key)
    } else {
        inMemoryCache.delete(key)
    }
}

// Cleanup expired keys periodically (in-memory only)
if (!redis) {
    setInterval(() => {
        const now = Date.now()
        for (const [key, value] of inMemoryCache.entries()) {
            if (now > value.expiry) {
                inMemoryCache.delete(key)
            }
        }
    }, 60000) // Every minute
}
