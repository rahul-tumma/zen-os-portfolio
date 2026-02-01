import { routeAIRequest } from '@/lib/ai/router'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs' // Needed for crypto operations

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json()

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Prompt is required and must be a string' },
                { status: 400 }
            )
        }

        // Route the AI request through our failover system
        const response = await routeAIRequest(prompt, {
            maxTokens: 500,
            temperature: 0.7,
        })

        return NextResponse.json({
            text: response.text,
            provider: response.provider,
            model: response.model,
            latency: response.latencyMs,
            orchestration: response.orchestration
        })
    } catch (error: any) {
        console.error('Chat API error:', error)

        return NextResponse.json(
            {
                error: error.message || 'An error occurred processing your request',
            },
            { status: 500 }
        )
    }
}
