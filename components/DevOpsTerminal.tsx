'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Circle, ChevronRight } from 'lucide-react'

interface Command {
    cmd: string
    output: string
}

interface DevOpsTerminalProps {
    title: string
    commands: Command[]
}

export function DevOpsTerminal({ title, commands }: DevOpsTerminalProps) {
    const [visibleLines, setVisibleLines] = useState<number>(0)

    useEffect(() => {
        if (visibleLines < commands.length * 2) {
            const timer = setTimeout(() => {
                setVisibleLines(prev => prev + 1)
            }, 600)
            return () => clearTimeout(timer)
        }
    }, [visibleLines, commands.length])

    return (
        <div className="w-full bg-[#0D0D12] text-[#A9B1D6] rounded-2xl border border-[#1A1B26] shadow-2xl overflow-hidden font-mono text-sm">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1A1B26] border-b border-[#24283B]">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <Circle size={10} className="fill-[#F7768E] text-[#F7768E]" />
                        <Circle size={10} className="fill-[#E0AF68] text-[#E0AF68]" />
                        <Circle size={10} className="fill-[#9ECE6A] text-[#9ECE6A]" />
                    </div>
                    <div className="ml-4 flex items-center gap-2 opacity-60">
                        <Terminal size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest">{title || 'Zen-OS Pipeline'}</span>
                    </div>
                </div>
            </div>

            {/* Terminal Content */}
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {commands.map((c, i) => {
                    const isCommandVisible = visibleLines >= i * 2 + 1
                    const isOutputVisible = visibleLines >= i * 2 + 2

                    return (
                        <div key={i} className="space-y-1">
                            {isCommandVisible && (
                                <div className="flex items-center gap-2 text-[#7AA2F7]">
                                    <ChevronRight size={14} className="shrink-0" />
                                    <span className="font-bold">{c.cmd}</span>
                                </div>
                            )}
                            {isOutputVisible && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="pl-6 text-[#565F89] whitespace-pre-wrap leading-relaxed"
                                >
                                    {c.output}
                                </motion.div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
