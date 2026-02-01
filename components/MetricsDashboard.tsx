'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Zap, ShieldCheck } from 'lucide-react'

export function MetricsDashboard() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-bg-secondary border border-border rounded-[32px] space-y-4">
                <div className="flex items-center justify-between text-success">
                    <Activity size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Real-time Latency</span>
                </div>
                <div className="space-y-1">
                    <h4 className="text-3xl font-bold tabular-nums">340ms</h4>
                    <p className="text-[10px] text-text-tertiary uppercase font-medium">Edge Optimized</p>
                </div>
                <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-success" />
                </div>
            </div>

            <div className="p-6 bg-bg-secondary border border-border rounded-[32px] space-y-4">
                <div className="flex items-center justify-between text-accent">
                    <Zap size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Failover Yield</span>
                </div>
                <div className="space-y-1">
                    <h4 className="text-3xl font-bold tabular-nums">99.9%</h4>
                    <p className="text-[10px] text-text-tertiary uppercase font-medium">Active Monitoring</p>
                </div>
                <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '99%' }} className="h-full bg-accent" />
                </div>
            </div>

            <div className="col-span-2 p-4 bg-bg-tertiary/50 border border-border rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-success" />
                    <span className="text-xs font-medium text-text-secondary">Security & Failover Cluster: Active</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-bold text-success uppercase">Synced</span>
                </div>
            </div>
        </div>
    )
}
