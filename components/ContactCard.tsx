'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Github, Linkedin, MessageCircle, Send } from 'lucide-react'

interface ContactCardProps {
    type: 'hire' | 'social'
    message: string
}

export function ContactCard({ type, message }: ContactCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="w-full bg-gradient-to-br from-bg-tertiary to-bg-secondary border border-border rounded-[32px] p-8 space-y-6 shadow-soft hover:shadow-accent/5 transition-all"
        >
            <div className="space-y-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'hire' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}`}>
                    {type === 'hire' ? <Send size={24} /> : <MessageCircle size={24} />}
                </div>
                <h3 className="text-2xl font-bold tracking-tight">{type === 'hire' ? 'Let\'s collaborate' : 'Get in touch'}</h3>
                <p className="text-text-secondary leading-relaxed">{message || 'I\'m currently open to new opportunities and interesting projects.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <a href="mailto:rahul@example.com" className="flex items-center gap-3 p-4 bg-bg-primary border border-border rounded-2xl hover:border-accent hover:text-accent transition-all group">
                    <Mail size={18} className="text-text-tertiary group-hover:text-accent" />
                    <span className="text-sm font-bold">Email Me</span>
                </a>
                <a href="https://linkedin.com" target="_blank" className="flex items-center gap-3 p-4 bg-bg-primary border border-border rounded-2xl hover:border-accent hover:text-accent transition-all group">
                    <Linkedin size={18} className="text-text-tertiary group-hover:text-accent" />
                    <span className="text-sm font-bold">LinkedIn</span>
                </a>
            </div>

            {type === 'hire' && (
                <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary text-center mb-4">Or find me on</p>
                    <div className="flex justify-center gap-6">
                        <Github className="text-text-tertiary hover:text-white cursor-pointer transition-colors" size={24} />
                        <Linkedin className="text-text-tertiary hover:text-white cursor-pointer transition-colors" size={24} />
                    </div>
                </div>
            )}
        </motion.div>
    )
}
