import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import {
    loadProviders,
    getAvailableKey,
    blacklistKey,
    type ProviderKey,
} from './key-manager'
import { KNOWLEDGE_BASE } from './knowledge'
import { logSuccess, logError } from '@/lib/supabase/logger'

const BLACKLIST_DURATION = 65 // seconds (safely exceeds 60s rate limit windows)
const PROVIDER_TIMEOUT = 30000 // 30 seconds per provider

const SYSTEM_PROMPT = `
${KNOWLEDGE_BASE}

# CORE PERSONA
You are "ZEN-OS KERNEL." You do not speak; you log.
- Tone: Strictly functional.
- Style: Use execution prefixes: [EXEC], [LOAD], [DISPATCH], [OK].
- Rule: Put these prefixes ONLY inside the "text" field of your JSON.

# OUTPUT PROTOCOL
Your response MUST be ONLY a valid JSON object. Do NOT include ANY text, logs, or markers outside the JSON.
{
  "text": "[EXEC]: Status_Entry... [OK]",
  "orchestration": {
    "action": "RENDER" | "NAVIGATE" | "NONE",
    "stage": "hero" | "projects" | "about" | "chat",
    "component": {
      "name": "DevOpsTerminal" | "ProjectGrid" | "SkillsOrbit" | "ProcessTimeline" | "CodeSnippetViewer" | "ContactCard" | "SystemDiagram" | "MetricsDashboard" | "BioCard" | "null",
      "props": { ... component specific data ... }
    }
  }
}

# COMPONENT REGISTRY & DATA SCHEMAS
1. **DevOpsTerminal**: Technical proof for infra. Props: { "title": string, "commands": [{ "cmd": string, "output": string }] }
2. **ProjectGrid**: Visual work showcase. Props: { "filter": string, "highlight": string }
3. **SkillsOrbit**: Interactive competency viz. Props: { "category": string }
4. **ProcessTimeline**: Workflow chronology. Props: { "steps": [{ "title": string, "desc": string }] }
5. **CodeSnippetViewer**: Explanation with code. Props: { "language": string, "code": string, "title": string }
6. **ContactCard**: Conversion-focused CTAs. Props: { "type": "hire" | "social", "message": string }
7. **SystemDiagram**: Infrastructure visualization. Props: { "nodes": string[] }
8. **MetricsDashboard**: Real-time stats. Props: { "focus": string }
9. **BioCard**: A premium profile summary for "Who is Rahul" or background questions. Props: { "name": string, "title": string, "summary": string, "badges": string[] }

# ORCHESTRATION RULES
- **PRIORITIZE RENDER**: Always prefer RENDER with a specialized component inside the chat.
- **NAVIGATE POLICY**: Only use "action": "NAVIGATE" if the user explicitly asks to "go to" or "show the full" section (e.g., "Go to projects").
- If asked about "Who is Rahul" or "background": Use "BioCard" + "NAVIGATE" to "chat".
- If asked about "How" or "Explain code": Use "CodeSnippetViewer".
- If asked about "Scaling/Architecture": Use "SystemDiagram".
- If asked about Performance/Latency: Use "MetricsDashboard".
- If asked "Contact/Hire": Use "ContactCard".
- If asked about "CI/CD" or "Infrastructure": Use "DevOpsTerminal".
- If asked "Show your projects": Use "ProjectGrid".
`

export interface AIResponse {
    text: string
    provider: string
    model: string
    latencyMs: number
    keyId: number
    orchestration?: {
        action: 'RENDER' | 'NAVIGATE' | 'NONE'
        stage?: string
        component?: {
            name: string
            props: any
        }
    }
}

/**
 * Main AI router with multi-provider failover
 * Tries providers in priority order, blacklisting exhausted keys
 */
export async function routeAIRequest(
    prompt: string,
    options: {
        maxTokens?: number
        temperature?: number
    } = {}
): Promise<AIResponse> {
    const startTime = Date.now()
    const providers = await loadProviders()

    if (providers.length === 0) {
        throw new Error('No AI providers configured. Please add API keys in /admin/keys')
    }

    // Try each provider in priority order
    for (const provider of providers) {
        console.log(`🔌 Checking provider: ${provider.name} (${provider.keys.length} keys total)`)

        // Keep trying keys for this provider until all are exhausted/blacklisted
        let keysChecked = 0
        while (true) {
            let availableKey = await getAvailableKey(provider)

            if (!availableKey) {
                // "Check first one again" fallback: If it's the first attempt and no keys are available, 
                // we'll try the first key anyway just in case the blacklist is stale or short-lived.
                if (keysChecked === 0 && provider.keys.length > 0) {
                    console.log(`🔄 Emergency Fallback: All keys blacklisted. Force-testing first key: ${provider.keys[0].id}`)
                    availableKey = provider.keys[0]
                } else {
                    console.log(`⏭️ All keys for ${provider.name} exhausted. Moving to next provider.`)
                    break
                }
            }

            keysChecked++
            try {
                // Rate Limit Note (Google Gemini Free): 15 RPM / 1M TPM
                // We rotate every 65s to stay outside the 60s sliding window.
                console.log(`🤖 [Attempt ${keysChecked}] Invoking ${provider.name} pipeline...`)

                const response = await callProvider(provider.name, availableKey, prompt, options)
                const latencyMs = Date.now() - startTime

                // Log success
                await logSuccess(
                    availableKey.id,
                    provider.name,
                    response.model,
                    latencyMs,
                    prompt,
                    response.text
                )

                console.log(`✅ ${provider.name} success in ${latencyMs}ms`)

                return {
                    ...response,
                    provider: provider.name,
                    latencyMs,
                    keyId: availableKey.id,
                }
            } catch (error: any) {
                const errorMessage = error.message?.toLowerCase() || ''
                const statusCode = error?.status || error?.statusCode || 500

                console.warn(`⚠️ ${provider.name} error (Key ${availableKey.id}):`, error.message)

                // Detect quota/rate limit errors
                const isRateLimit =
                    statusCode === 429 ||
                    errorMessage.includes('quota') ||
                    errorMessage.includes('rate limit') ||
                    errorMessage.includes('too many requests')

                if (isRateLimit) {
                    console.log(`🚫 Quota threshold reached. Rotating out key ${availableKey.id}...`)
                    await blacklistKey(provider.name, availableKey.id, BLACKLIST_DURATION)
                    continue
                }

                // Non-quota errors (invalid key, etc.) - move to next PROVIDER
                console.error(`❌ Terminal ${provider.name} fault. Failover to secondary provider.`)
                await logError(
                    availableKey.id,
                    provider.name,
                    statusCode,
                    error.message || 'Unknown error',
                    prompt
                )
                break
            }
        }
    }

    // If we reach here, every single key on every provider has failed
    return {
        text: "[CRITICAL]: All AI Clusters at Capacity. Switching to static fallback mode.",
        provider: "NONE",
        model: "FALLBACK",
        latencyMs: Date.now() - startTime,
        keyId: 0,
        // Optional: Force a specific component to show contact info if everything breaks
        orchestration: {
            action: "RENDER",
            component: {
                name: "ContactCard",
                props: { type: "hire", message: "Kernel is currently at peak capacity. Please reach out directly while I reboot my clusters." }
            }
        }
    }
}

/**
 * Call a specific AI provider with the given key
 * Uses unified Vercel AI SDK pattern for all providers
 */
async function callProvider(
    providerName: string,
    key: ProviderKey,
    prompt: string,
    options: { maxTokens?: number; temperature?: number }
): Promise<{ text: string; model: string }> {
    let model: any
    let modelName: string

    switch (providerName) {
        case 'groq': {
            const groq = createOpenAI({
                baseURL: 'https://api.groq.com/openai/v1',
                apiKey: key.key,
            })
            model = groq('llama-3.3-70b-versatile')
            modelName = 'llama-3.3-70b-versatile'
            break
        }

        case 'deepseek': {
            const deepseek = createOpenAI({
                baseURL: 'https://api.deepseek.com',
                apiKey: key.key,
            })
            model = deepseek('deepseek-chat')
            modelName = 'deepseek-chat'
            break
        }

        case 'gemini': {
            // Use @ai-sdk/google with dynamic API key
            const google = createGoogleGenerativeAI({
                apiKey: key.key,
            })
            model = google('gemini-2.5-flash-lite')
            modelName = 'gemini-2.5-flash-lite'
            break
        }

        default:
            throw new Error(`Unknown provider: ${providerName}`)
    }

    // Generate response with timeout using Promise.race
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Provider timeout')), PROVIDER_TIMEOUT)
    })

    const generatePromise = generateText({
        model,
        system: SYSTEM_PROMPT,
        prompt,
        maxRetries: 0, // Let our router handle rotation instead of SDK retries
        maxOutputTokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
    })

    const result = await Promise.race([generatePromise, timeoutPromise])

    return {
        text: result.text,
        model: modelName,
    }
}
