'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { CommandBar } from '@/components/CommandBar'
import { ChatStage } from '@/components/ChatStage'
import {
    Zap,
    Activity,
    Cpu,
    Globe,
    Sparkles,
    Github,
    ChevronRight,
    Database,
    ExternalLink,
    Code2
} from 'lucide-react'

interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    provider?: string
    orchestration?: {
        component?: string
        props?: any
    }
}

export default function ZenOS() {
    const [activeStage, setActiveStage] = useState<'hero' | 'projects' | 'chat' | 'about'>('hero')
    const [health, setHealth] = useState<any>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [currentProvider, setCurrentProvider] = useState('')
    const [currentTime, setCurrentTime] = useState<string>('')

    useEffect(() => {
        setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const fetchHealth = () => {
            fetch('/api/health')
                .then(res => res.json())
                .then(data => setHealth(data))
                .catch(() => setHealth({ status: 'offline' }))
        }
        fetchHealth()
        const interval = setInterval(fetchHealth, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleCommand = async (type: string, payload?: string) => {
        if (type === 'chat' && payload) {
            setActiveStage('chat')
            setMessages(prev => [...prev, { role: 'user', content: payload }])
            setIsChatLoading(true)

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: payload })
                })
                const data = await res.json()

                if (res.ok) {
                    let aiData: any
                    try {
                        let cleanText = data.text.trim()

                        // Attempt 1: Standard strip and parse
                        if (cleanText.startsWith('```')) {
                            cleanText = cleanText.replace(/^```json\n?/, '').replace(/```$/, '').trim()
                        }

                        // Attempt 2: Direct parse
                        try {
                            aiData = JSON.parse(cleanText)
                        } catch (e) {
                            // Attempt 3: Regex extraction if AI included prefixes/logs outside JSON
                            const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
                            if (jsonMatch) {
                                aiData = JSON.parse(jsonMatch[0])
                            } else {
                                throw e // Fail to catch block
                            }
                        }
                    } catch {
                        aiData = { text: data.text, orchestration: null }
                    }

                    const finalOrchestration = data.orchestration || aiData.orchestration

                    const message: ChatMessage = {
                        role: 'assistant',
                        content: aiData.text || '',
                        provider: data.provider,
                        orchestration: (finalOrchestration?.component?.name && finalOrchestration.component.name !== 'null') ? {
                            component: finalOrchestration.component.name,
                            props: finalOrchestration.component.props
                        } : undefined
                    }

                    setMessages(prev => [...prev, message])
                    setCurrentProvider(`${data.provider} (${data.latency}ms)`)

                    // Execute Stage Navigation if requested
                    if (aiData.orchestration?.stage && aiData.orchestration.stage !== activeStage) {
                        setActiveStage(aiData.orchestration.stage)
                    }
                } else {
                    setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.err || 'System cluster is currently busy.'}` }])
                }
            } catch (err) {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Attempting failover...' }])
            } finally {
                setIsChatLoading(false)
            }
        } else if (type === 'projects') {
            setActiveStage('projects')
        } else if (type === 'about') {
            setActiveStage('about')
        } else if (payload === '') {
            setActiveStage('hero')
        }
    }

    return (
        <div className="relative min-h-[100dvh] overflow-hidden selection:bg-accent/20">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-success/5 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--bg-primary))_70%)]" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-[12vh] pb-32">
                <AnimatePresence mode="wait">
                    {activeStage === 'hero' && (
                        <motion.section key="hero" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="space-y-8 max-w-3xl">
                            <div className="flex items-center gap-3 text-accent bg-accent/10 w-fit px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest border border-accent/20">
                                <Sparkles size={14} />
                                <span>AI-Orchestrated Portfolio</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9]">Personal <br /> <span className="text-text-tertiary">Experience OS.</span></h1>
                            <p className="text-2xl text-text-secondary leading-relaxed max-w-2xl">I build high-availability systems and generative experiences. Everything you see is powered by a multi-model failover cluster.</p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-bg-primary bg-bg-secondary overflow-hidden shadow-soft relative">
                                            <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="Stack" fill />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-sm font-bold">AI Engineer & DevOps Specialist</p>
                                    <p className="text-xs text-text-tertiary">Transforming ideas into scalable systems.</p>
                                </div>
                            </div>
                        </motion.section>
                    )}
                    {activeStage === 'chat' && <ChatStage key="chat" messages={messages} loading={isChatLoading} provider={currentProvider} />}
                    {activeStage === 'projects' && (
                        <motion.section key="projects" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="space-y-12">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-bold tracking-tight">Featured Work</h2>
                                <p className="text-text-secondary text-lg">A collection of systems and experiments.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <ProjectCard title="Nexus AI Infrastructure" desc="High-availability cluster orchestration for generative models with sub-second failover." tags={['Next.js', 'Redis', 'Supabase', 'AI SDK']} />
                                <ProjectCard title="Quantum Dashboard" desc="Real-time analytics dashboard with Apple-inspired minimalism and glassmorphism." tags={['Framer Motion', 'Tailwind', 'Recharts']} />
                            </div>
                        </motion.section>
                    )}
                    {activeStage === 'about' && (
                        <motion.section key="about" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="space-y-8 max-w-2xl">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-bold tracking-tight">About Rahul</h2>
                                <p className="text-text-secondary text-lg text-balance">Full-stack engineer specializing in high-availability systems and AI orchestration.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="p-6 bg-bg-tertiary border border-border rounded-3xl space-y-2">
                                    <h4 className="font-bold text-accent">AI & LLMs</h4>
                                    <p className="text-sm text-text-secondary">Building resilient agents with multi-model failover and sub-second latency targets.</p>
                                </div>
                                <div className="p-6 bg-bg-tertiary border border-border rounded-3xl space-y-2">
                                    <h4 className="font-bold text-success">Infrastructure</h4>
                                    <p className="text-sm text-text-secondary">Cloud-native architectures with Dokploy, Docker, and Supabase integration.</p>
                                </div>
                            </div>
                            <p className="text-text-secondary leading-relaxed pt-4">I focus on creating interfaces that feel alive—moving away from traditional navigation towards generative, command-driven experiences like Zen-OS.</p>
                        </motion.section>
                    )}
                </AnimatePresence>
            </main>

            <aside className="fixed top-8 right-8 z-40 hidden lg:flex flex-col gap-4 w-64">
                <div className="bg-bg-tertiary/60 backdrop-blur-xl border border-border p-5 rounded-[32px] shadow-soft space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">System Status</h3>
                        <div className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-success animate-pulse' : 'bg-error'}`} />
                    </div>
                    <div className="space-y-3">
                        <StatItem icon={<Cpu size={14} />} label="AI Cluster" value={health?.providers?.length > 0 ? 'Active' : 'Offline'} />
                        <StatItem icon={<Activity size={14} />} label="Latency" value={currentProvider ? currentProvider.split('(')[1].replace(')', '') : '---'} />
                        <StatItem icon={<Globe size={14} />} label="Region" value="Global Edge" />
                        <StatItem icon={<Database size={14} />} label="Uptime" value="99.99%" />
                    </div>
                    <div className="pt-2">
                        <a href="https://github.com" className="flex items-center justify-between group px-3 py-2 bg-text-primary text-white rounded-2xl hover:bg-accent transition-all shadow-soft">
                            <Github size={16} /><span className="text-xs font-bold">View Source</span><ChevronRight size={14} className="opacity-40 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                    </div>
                </div>
                <div className="bg-bg-tertiary/60 backdrop-blur-xl border border-border px-5 py-3 rounded-2xl shadow-soft flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Local Time</span>
                    <span className="text-sm font-medium tabular-nums">{currentTime || '--:--'}</span>
                </div>
            </aside>

            <CommandBar onCommand={handleCommand} />
        </div>
    )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2 text-text-tertiary text-nowrap">
                <div className="p-1 rounded-md bg-bg-secondary group-hover:bg-accent/10 group-hover:text-accent transition-colors">{icon}</div>
                <span className="text-[10px] font-medium">{label}</span>
            </div>
            <span className="text-[10px] font-bold tracking-tight truncate max-w-[80px]">{value}</span>
        </div>
    )
}

function ProjectCard({ title, desc, tags }: { title: string, desc: string, tags: string[] }) {
    return (
        <div className="group bg-bg-tertiary border border-border p-8 rounded-[40px] shadow-soft hover:shadow-soft-lg transition-all space-y-6">
            <div className="flex items-start justify-between">
                <div className="w-14 h-14 bg-bg-secondary rounded-2xl flex items-center justify-center text-text-tertiary group-hover:bg-accent/10 group-hover:text-accent transition-all"><Code2 size={28} /></div>
                <button className="p-2 text-text-tertiary hover:text-accent transition-colors"><ExternalLink size={20} /></button>
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
                <p className="text-text-secondary leading-relaxed">{desc}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => <span key={tag} className="px-3 py-1 bg-bg-secondary border border-border rounded-full text-xs font-medium text-text-tertiary">{tag}</span>)}
            </div>
        </div>
    )
}
