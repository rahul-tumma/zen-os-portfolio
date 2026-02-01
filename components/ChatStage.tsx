'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, CornerDownRight, Sparkles } from 'lucide-react'
import { GenerativeRenderer } from './GenerativeRenderer'

interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    provider?: string
    orchestration?: {
        component?: string
        props?: any
    }
}

export function ChatStage({ messages, loading, provider }: { messages: ChatMessage[], loading: boolean, provider?: string }) {
    // Get the latest assistant message with orchestration
    const latestOrchestration = [...messages].reverse().find(m => m.role === 'assistant' && m.orchestration)?.orchestration

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 min-h-[70vh]">
            {/* Left: System Log (Minimal Chat) */}
            <div className="lg:col-span-4 flex flex-col h-full lg:border-r border-border/50 lg:pr-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        System Log
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 max-h-[65vh] custom-scrollbar pr-4 font-mono">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col gap-1 border-l border-border/20 pl-4 py-1"
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-sm ${msg.role === 'user' ? 'bg-bg-tertiary text-text-tertiary border border-border/50' : 'bg-accent/10 text-accent border border-accent/20'}`}>
                                    {msg.role === 'user' ? 'USR_CMD' : 'KERN_LOG'}
                                </span>
                                <span className="text-[8px] text-text-tertiary opacity-30 select-none">PID: {1000 + idx}</span>
                                <span className="text-[8px] text-text-tertiary opacity-30 select-none">{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                            <p className={`text-[10px] leading-relaxed break-all ${msg.role === 'assistant' ? 'text-accent' : 'text-text-secondary'}`}>
                                <span className="opacity-40 mr-2">{msg.role === 'user' ? '>' : '#'}</span>
                                {msg.content}
                            </p>
                        </motion.div>
                    ))}
                    {loading && (
                        <div className="flex items-center gap-2 text-accent text-[8px] font-bold uppercase tracking-widest animate-pulse pl-4">
                            <span className="opacity-40">#</span> EXEC: STREAM_KERNEL_IO...
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-border/50 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-text-tertiary opacity-40">
                        <CornerDownRight size={10} />
                        Kernel Status: Stable
                    </div>
                    {provider && (
                        <div className="flex items-center gap-2 text-[9px] font-bold text-success uppercase tracking-widest">
                            <Sparkles size={10} />
                            Allocated: {provider}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Generative Display (The "OS" Experience) */}
            <div className="lg:col-span-8 flex flex-col justify-center min-h-[400px]">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="flex flex-col items-center justify-center space-y-8"
                        >
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                {/* Double Orbit Loader */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                    className="absolute inset-0 border-2 border-dashed border-accent/20 rounded-full"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                    className="absolute inset-4 border border-accent rounded-full border-t-transparent shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]"
                                />
                                <Bot size={48} className="text-accent animate-pulse" />
                            </div>
                            <div className="text-center space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Kernel Processing</p>
                                <div className="flex gap-1 justify-center">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ opacity: [0.2, 1, 0.2] }}
                                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                            className="w-1 h-1 bg-accent rounded-full"
                                        />
                                    ))}
                                </div>
                                <p className="text-[8px] font-mono text-text-tertiary opacity-40">CALCULATING_PROBABILITIES... SHIFTING_UI... [PID: 9001]</p>
                            </div>
                        </motion.div>
                    ) : latestOrchestration ? (
                        <GenerativeRenderer
                            key={latestOrchestration.component}
                            componentName={latestOrchestration.component || ''}
                            props={latestOrchestration.props}
                        />
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center text-center space-y-6 opacity-20"
                        >
                            <div className="w-40 h-40 rounded-full border border-dashed border-text-tertiary animate-spin-slow flex items-center justify-center">
                                <Bot size={64} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Zen-OS v3 Kernel</p>
                                <p className="text-[8px] font-medium uppercase tracking-[0.2em]">Ready for stream sequence</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
