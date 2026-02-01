'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, ShieldCheck, MapPin, Briefcase, Award } from 'lucide-react'

interface BioCardProps {
    name: string
    title: string
    location: string
    summary: string
    badges: string[]
}

export function BioCard({ name, title, location, summary, badges }: BioCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gradient-to-br from-bg-tertiary to-bg-secondary border border-border rounded-[32px] p-8 space-y-6 shadow-soft"
        >
            <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white shrink-0 shadow-lg shadow-accent/20">
                    <User size={32} />
                </div>
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold tracking-tight">{name || 'Rahul Tumma'}</h3>
                    <div className="flex items-center gap-3 text-text-tertiary">
                        <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded-full border border-accent/20">
                            <Briefcase size={10} /><span>{title || 'AI & DevOps Specialist'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                            <MapPin size={10} /><span>{location || 'Global Edge'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-lg text-text-secondary leading-relaxed border-l-2 border-accent/20 pl-6 italic">
                &quot;{summary || 'Building resilient, high-availability systems with generative intelligence.'}&quot;
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
                {badges?.map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-4 py-2 bg-bg-primary border border-border rounded-full text-xs font-bold text-text-secondary shadow-sm">
                        <Award size={14} className="text-accent" />
                        <span>{b}</span>
                    </div>
                ))}
            </div>

            <div className="pt-4 flex items-center gap-2 text-success">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Verified Orchestration State: Active</span>
            </div>
        </motion.div>
    )
}
