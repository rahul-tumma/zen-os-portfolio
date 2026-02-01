'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { DevOpsTerminal } from './DevOpsTerminal'
import { ProjectGrid } from './ProjectGrid'
import { SkillsOrbit } from './SkillsOrbit'
import { CodeSnippetViewer } from './CodeSnippetViewer'
import { ContactCard } from './ContactCard'
import { MetricsDashboard } from './MetricsDashboard'
import { SystemDiagram } from './SystemDiagram'
import { BioCard } from './BioCard'

// Registry of available Generative UI components
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
    DevOpsTerminal,
    ProjectGrid,
    SkillsOrbit,
    CodeSnippetViewer,
    ContactCard,
    MetricsDashboard,
    SystemDiagram,
    BioCard,
    ProcessTimeline: ({ steps }: any) => (
        <div className="space-y-4 p-8 bg-bg-secondary border border-border rounded-[40px]">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-6">Workflow Process</h4>
            <div className="space-y-8">
                {steps?.map((s: any, i: number) => (
                    <div key={i} className="flex gap-4 group">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-accent bg-bg-primary group-hover:scale-125 transition-transform" />
                            {i < steps.length - 1 && <div className="w-[1px] h-12 bg-border group-hover:bg-accent transition-colors" />}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold">{s.title}</p>
                            <p className="text-xs text-text-secondary leading-relaxed">{s.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

interface GenerativeRendererProps {
    componentName: string | null
    props: any
}

export function GenerativeRenderer({ componentName, props }: GenerativeRendererProps) {
    if (!componentName || !COMPONENT_MAP[componentName]) return null

    const Component = COMPONENT_MAP[componentName]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-full"
        >
            <Component {...props} />
        </motion.div>
    )
}
