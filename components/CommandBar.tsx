'use client'

import * as React from 'react'
import { Command } from 'cmdk'
import { Search, Mic, Command as CommandIcon, ArrowRight, User, Code2, MessageSquare, Sparkles, Github, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CommandBarProps {
    onCommand?: (type: string, payload?: string) => void
}

export function CommandBar({ onCommand }: CommandBarProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState('')
    const [isListening, setIsListening] = React.useState(false)
    const [recognition, setRecognition] = React.useState<any>(null)
    const isSubmittingRef = React.useRef(false)

    React.useEffect(() => {
        if (typeof window !== 'undefined' && ('WebkitSpeechRecognition' in window || 'speechRecognition' in window)) {
            const SpeechRecognition = (window as any).WebkitSpeechRecognition || (window as any).speechRecognition
            const rec = new SpeechRecognition()
            rec.continuous = false; rec.interimResults = false; rec.lang = 'en-US'
            rec.onresult = (event: any) => { setInputValue(event.results[0][0].transcript); setIsListening(false) }
            rec.onerror = () => setIsListening(false); rec.onend = () => setIsListening(false)
            setRecognition(rec)
        }
        const down = (e: KeyboardEvent) => { if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen((open) => !open) } }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const handleCommand = (type: string, payload?: string) => {
        // Prevent duplicate submissions
        if (isSubmittingRef.current) return
        isSubmittingRef.current = true

        setOpen(false)
        if (onCommand) onCommand(type, payload || inputValue)
        setInputValue('')

        // Reset flag after a brief delay
        setTimeout(() => { isSubmittingRef.current = false }, 100)
    }

    const toggleVoice = () => { if (isListening) recognition?.stop(); else { setIsListening(true); recognition?.start() } }

    return (
        <>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4">
                <button onClick={() => setOpen(true)} className="flex items-center gap-3 px-6 py-3 bg-bg-tertiary/80 backdrop-blur-xl border border-border rounded-full shadow-soft-lg hover:shadow-soft-xl transition-all group w-full justify-center">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors shrink-0"><CommandIcon size={16} /></div>
                    <span className="text-sm font-medium text-text-secondary pr-2 whitespace-nowrap">Press ⌘K to start</span>
                </button>
            </motion.div>
            <Command.Dialog open={open} onOpenChange={setOpen} label="Global Command Bar" className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4 bg-text-primary/10 backdrop-blur-sm">
                {/* Accessibility: DialogTitle is required */}
                <span className="sr-only">Global Command Search</span>

                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-2xl bg-bg-tertiary rounded-[32px] shadow-soft-xl border border-border overflow-hidden">
                    <div className="relative flex items-center border-b border-border p-6 gap-4">
                        <div className={`p-2 rounded-xl transition-all ${isListening ? 'bg-error text-white animate-pulse' : 'bg-bg-secondary text-text-tertiary'}`}>{isListening ? <Mic size={24} /> : <Search size={24} />}</div>
                        <Command.Input value={inputValue} onValueChange={setInputValue} placeholder={isListening ? "I'm listening..." : "Type a command..."} className="flex-1 bg-transparent border-none outline-none text-xl font-medium" />
                        <div className="flex items-center gap-2">
                            <button onClick={toggleVoice} className={`p-3 rounded-2xl transition-all ${isListening ? 'bg-error/10 text-error' : 'hover:bg-bg-secondary text-text-tertiary'}`}><Mic size={20} /></button>
                        </div>
                    </div>
                    <Command.List className="max-h-[60vh] overflow-y-auto p-4">
                        <Command.Empty className="py-12 text-center">No results found.</Command.Empty>
                        <Command.Group heading="Navigation" className="text-[10px] uppercase font-bold text-text-tertiary px-4 py-2">
                            <Item onSelect={() => handleCommand('chat', 'Show me your projects')}><Code2 size={20} /><span>View Projects</span></Item>
                            <Item onSelect={() => handleCommand('chat', 'Who is Rahul?')}><User size={20} /><span>About Rahul</span></Item>
                        </Command.Group>
                        {inputValue && (
                            <Command.Group heading="AI Actions" className="text-[10px] uppercase font-bold text-text-tertiary px-4 py-2 mt-4">
                                <Item onSelect={() => handleCommand('chat')}><Sparkles size={20} className="text-accent" /><span className="text-accent font-semibold">Ask Zen-AI: &quot;{inputValue}&quot;</span><ArrowRight size={18} className="ml-auto text-accent" /></Item>
                            </Command.Group>
                        )}
                    </Command.List>
                </motion.div>
            </Command.Dialog>
        </>
    )
}

function Item({ children, onSelect }: { children: React.ReactNode, onSelect?: () => void }) {
    return <Command.Item onSelect={onSelect} className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-default select-none data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent transition-all font-medium text-sm">{children}</Command.Item>
}
