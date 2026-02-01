'use client'

import React from 'react'
import { FileCode, Clipboard, Check } from 'lucide-react'

interface CodeSnippetViewerProps {
    language: string
    code: string
    title: string
}

export function CodeSnippetViewer({ language, code, title }: CodeSnippetViewerProps) {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-full bg-[#1A1B26] border border-[#24283B] rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#24283B]/50 border-b border-[#24283B]">
                <div className="flex items-center gap-2">
                    <FileCode size={14} className="text-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#7AA2F7]">{title || 'Source Code'}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-[#565F89] hover:text-[#7AA2F7]"
                >
                    {copied ? <Check size={14} /> : <Clipboard size={14} />}
                </button>
            </div>

            {/* Code Body */}
            <div className="p-6 overflow-x-auto custom-scrollbar">
                <pre className="font-mono text-sm leading-relaxed text-[#A9B1D6]">
                    <code>{code}</code>
                </pre>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-[#24283B]/30 flex justify-end">
                <span className="text-[10px] font-bold text-[#565F89] uppercase tracking-tighter">{language || 'Typescript'}</span>
            </div>
        </div>
    )
}
