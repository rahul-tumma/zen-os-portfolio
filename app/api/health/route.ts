import { loadProviders } from '@/lib/ai/key-manager'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Health check endpoint for monitoring provider status
 */
export async function GET(req: NextRequest) {
    try {
        const providers = await loadProviders()

        const status = providers.map((provider) => ({
            name: provider.name,
            available: true,
            keysCount: provider.keys.length,
            avgPriority: provider.avgPriority,
        }))

        const allHealthy = status.length > 0

        return NextResponse.json({
            status: allHealthy ? 'healthy' : 'degraded',
            providers: status,
            timestamp: new Date().toISOString(),
        })
    } catch (error: any) {
        console.error('Health check error:', error)

        return NextResponse.json(
            {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        )
    }
}
