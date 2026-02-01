'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Database,
    Globe,
    Cpu,
    Layout,
    Zap,
    Layers,
    Shield
} from 'lucide-react'

const SKILLS = [
    { name: 'TypeScript', icon: Globe, cat: 'frontend' },
    { name: 'Next.js', icon: Layout, cat: 'frontend' },
    { name: 'Supabase', icon: Database, cat: 'backend' },
    { name: 'Docker', icon: Layers, cat: 'tools' },
    { name: 'AI SDK', icon: Cpu, cat: 'ai' },
    { name: 'Redis', icon: Zap, cat: 'backend' },
    { name: 'PostgreSQL', icon: Database, cat: 'backend' },
    { name: 'Security', icon: Shield, cat: 'tools' }
]

export function SkillsOrbit({ category }: { category?: string }) {
    const filtered = SKILLS.filter(s => !category || s.cat === category || category === 'all')

    return (
        <div className="relative h-[200px] flex items-center justify-center py-20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--accent)/0.05)_0%,transparent_70%)]" />
            <div className="flex flex-wrap items-center justify-center gap-6 max-w-lg">
                {filtered.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="group flex flex-col items-center gap-3 p-4 bg-bg-secondary border border-border rounded-[24px] min-w-[100px] shadow-sm hover:border-accent hover:shadow-soft-lg transition-all"
                    >
                        <div className="p-3 bg-bg-tertiary rounded-xl text-text-tertiary group-hover:bg-accent group-hover:text-white transition-colors">
                            <s.icon size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary group-hover:text-text-primary">{s.name}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
