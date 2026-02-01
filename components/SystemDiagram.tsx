'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Server, Database, Cloud } from 'lucide-react'

export function SystemDiagram() {
    return (
        <div className="p-8 bg-bg-secondary border border-border rounded-[40px] relative overflow-hidden flex flex-col items-center gap-12 min-h-[300px] justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--accent)/0.03)_0%,transparent_70%)]" />

            {/* Simple Architecture Viz */}
            <div className="flex items-center gap-8 z-10">
                <Node icon={<Cloud size={24} />} label="Global Edge" />
                <div className="w-12 h-[2px] bg-border border-t border-dashed relative">
                    <div className="absolute top-1/2 left-0 w-2 h-2 -translate-y-1/2 rounded-full bg-accent animate-ping" />
                </div>
                <Node icon={<Server size={24} />} label="AI Cluster" highlight />
                <div className="w-12 h-[2px] bg-border border-t border-dashed" />
                <Node icon={<Database size={24} />} label="Vector DB" />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm z-10 text-center">
                <div className="p-4 bg-bg-tertiary rounded-2xl border border-border shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Failover</p>
                    <p className="text-xs font-semibold">Multi-Region</p>
                </div>
                <div className="p-4 bg-bg-tertiary rounded-2xl border border-border shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Scaling</p>
                    <p className="text-xs font-semibold">Automatic</p>
                </div>
            </div>
        </div>
    )
}

function Node({ icon, label, highlight }: { icon: React.ReactNode, label: string, highlight?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-3">
            <motion.div
                whileHover={{ scale: 1.1 }}
                className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg transition-all ${highlight ? 'bg-accent text-white border-4 border-accent/20' : 'bg-bg-tertiary border border-border text-text-tertiary'}`}
            >
                {icon}
            </motion.div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">{label}</span>
        </div>
    )
}
