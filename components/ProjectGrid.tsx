'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Code2, ExternalLink, Sparkles } from 'lucide-react'

interface Project {
    title: string
    desc: string
    tags: string[]
}

const ALL_PROJECTS: Project[] = [
    { title: "Nexus AI Infrastructure", desc: "High-availability cluster orchestration for generative models.", tags: ['AI', 'Redis', 'Next.js'] },
    { title: "Quantum Dashboard", desc: "Real-time analytics with Apple-inspired minimalism.", tags: ['Visuals', 'Framer', 'Tailwind'] },
    { title: "Zen-OS Core", desc: "The underlying orchestration logic of this portfolio.", tags: ['AI', 'Infrastructure'] }
]

export function ProjectGrid({ filter, highlight }: { filter?: string, highlight?: string }) {
    const filtered = ALL_PROJECTS.filter(p => !filter || p.tags.some(t => t.toLowerCase() === filter.toLowerCase()))

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p, i) => (
                <motion.div
                    key={i}
                    layoutId={p.title}
                    className={`p-6 bg-bg-secondary border ${p.title === highlight ? 'border-accent shadow-accent/10' : 'border-border'} rounded-[32px] space-y-4 hover:border-accent transition-colors`}
                >
                    <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-2xl ${p.title === highlight ? 'bg-accent/10 text-accent' : 'bg-bg-tertiary text-text-tertiary'}`}>
                            {p.title === highlight ? <Sparkles size={20} /> : <Code2 size={20} />}
                        </div>
                        <ExternalLink size={16} className="text-text-tertiary" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-lg">{p.title}</h4>
                        <p className="text-sm text-text-secondary leading-relaxed">{p.desc}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {p.tags.map(t => <span key={t} className="px-3 py-1 bg-bg-tertiary border border-border rounded-full text-[10px] font-bold uppercase tracking-widest text-text-tertiary">{t}</span>)}
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
