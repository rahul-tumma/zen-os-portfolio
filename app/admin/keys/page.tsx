'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Plus,
    Trash2,
    Power,
    Activity,
    ShieldCheck,
    LogOut,
    RefreshCw,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    Zap
} from 'lucide-react'

interface APIKey {
    id: number
    provider: string
    key_label: string
    is_enabled: boolean
    total_requests: number
    successful_requests: number
    failed_requests: number
    avg_latency_ms: number
    last_used_at: string
    priority: number
}

export default function KeysPage() {
    const [keys, setKeys] = useState<APIKey[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    // New key form state
    const [newKey, setNewKey] = useState({
        provider: 'groq',
        apiKey: '',
        label: '',
        priority: 1
    })

    useEffect(() => {
        fetchKeys()
    }, [])

    const fetchKeys = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/keys')
            const data = await res.json()
            if (res.ok) {
                setKeys(data.keys || [])
            }
        } catch (err) {
            console.error('Failed to fetch keys')
        } finally {
            setLoading(false)
        }
    }

    const handleAddKey = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newKey)
            })
            if (res.ok) {
                setShowAddModal(false)
                setNewKey({ provider: 'groq', apiKey: '', label: '', priority: 1 })
                fetchKeys()
            }
        } catch (err) {
            console.error('Failed to add key')
        }
    }

    const toggleKey = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/keys/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_enabled: !currentStatus })
            })
            if (res.ok) fetchKeys()
        } catch (err) {
            console.error('Failed to toggle key')
        }
    }

    const deleteKey = async (id: number) => {
        if (!confirm('Are you sure you want to delete this key?')) return
        try {
            const res = await fetch(`/api/admin/keys/${id}`, { method: 'DELETE' })
            if (res.ok) fetchKeys()
        } catch (err) {
            console.error('Failed to delete key')
        }
    }

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        router.push('/admin/login')
    }

    const filteredKeys = keys.filter(k =>
        k.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.key_label?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-bg-secondary selection:bg-accent/20">
            <nav className="glass sticky top-0 z-40 border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Zen-OS Control</h1>
                        <p className="text-xs text-text-tertiary">API Management Dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={fetchKeys} className="p-2 hover:bg-bg-tertiary rounded-xl transition-colors text-text-secondary">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary hover:bg-error/10 hover:text-error rounded-xl transition-all font-medium text-sm">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-bg-tertiary p-6 rounded-3xl border border-border shadow-soft space-y-2">
                        <div className="flex items-center justify-between text-text-tertiary">
                            <span className="text-sm font-medium">Active Keys</span>
                            <Power size={18} className="text-success" />
                        </div>
                        <p className="text-3xl font-semibold">{keys.filter(k => k.is_enabled).length}</p>
                    </div>
                    <div className="bg-bg-tertiary p-6 rounded-3xl border border-border shadow-soft space-y-2">
                        <div className="flex items-center justify-between text-text-tertiary">
                            <span className="text-sm font-medium">Overall Success</span>
                            <CheckCircle2 size={18} className="text-accent" />
                        </div>
                        <p className="text-3xl font-semibold">{keys.length > 0 ? (keys.reduce((acc, k) => acc + k.successful_requests, 0) / Math.max(1, keys.reduce((acc, k) => acc + k.total_requests, 0)) * 100).toFixed(1) : '0.0'}%</p>
                    </div>
                    <div className="bg-bg-tertiary p-6 rounded-3xl border border-border shadow-soft space-y-2">
                        <div className="flex items-center justify-between text-text-tertiary">
                            <span className="text-sm font-medium">System Health</span>
                            <Activity size={18} className="text-warning" />
                        </div>
                        <p className="text-3xl font-semibold">Optimal</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-bg-tertiary p-4 rounded-3xl border border-border shadow-soft">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                        <input type="text" placeholder="Search providers or labels..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-bg-secondary border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm" />
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-2xl hover:bg-accent-hover transition-all shadow-soft font-semibold text-sm">
                        <Plus size={20} />
                        <span>Add New Key</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {loading && keys.length === 0 ? (
                        <div className="text-center py-20 bg-bg-tertiary rounded-3xl border border-border border-dashed">
                            <RefreshCw className="mx-auto animate-spin text-text-tertiary mb-4" size={32} />
                            <p className="text-text-secondary">Loading your API secrets...</p>
                        </div>
                    ) : filteredKeys.length === 0 ? (
                        <div className="text-center py-20 bg-bg-tertiary rounded-3xl border border-border border-dashed">
                            <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-text-tertiary" size={32} />
                            </div>
                            <p className="text-text-secondary">No keys found in your vault.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredKeys.map((key) => (
                                <div key={key.id} className="group bg-bg-tertiary p-6 rounded-3xl border border-border shadow-soft hover:shadow-soft-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${key.provider === 'groq' ? 'bg-orange-100 text-orange-600' : key.provider === 'deepseek' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold uppercase text-xs tracking-wider text-text-tertiary">{key.provider}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight uppercase ${key.is_enabled ? 'bg-success/10 text-success' : 'bg-text-tertiary/10 text-text-tertiary'}`}>
                                                    {key.is_enabled ? 'Active' : 'Disabled'}
                                                </span>
                                            </div>
                                            <p className="font-medium text-lg mt-0.5">{key.key_label || 'Unnamed Key'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 flex-1 md:max-w-2xl px-0 md:px-8">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold mb-1">Requests</p>
                                            <p className="font-semibold text-sm">{key.total_requests}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold mb-1">Latency</p>
                                            <p className="font-semibold text-sm">{key.avg_latency_ms || 0}ms</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold mb-1">Success</p>
                                            <p className="font-semibold text-sm">{key.total_requests > 0 ? ((key.successful_requests / key.total_requests) * 100).toFixed(1) : '100'}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold mb-1">Priority</p>
                                            <p className="font-semibold text-sm">{key.priority}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => toggleKey(key.id, key.is_enabled)} className={`p-3 rounded-2xl transition-all ${key.is_enabled ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-bg-secondary text-text-tertiary hover:bg-success/10 hover:text-success'}`}>
                                            <Power size={18} />
                                        </button>
                                        <button onClick={() => deleteKey(key.id)} className="p-3 bg-error/10 text-error rounded-2xl hover:bg-error/20 transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pb-20 md:pb-6">
                    <div className="absolute inset-0 bg-text-primary/10 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="relative w-full max-w-lg bg-bg-tertiary rounded-[40px] shadow-soft-lg border border-border overflow-hidden">
                        <div className="p-8 border-b border-border bg-bg-secondary/50">
                            <h2 className="text-2xl font-bold">Add Provider Key</h2>
                            <p className="text-sm text-text-secondary mt-1">Connect a new AI engine to Zen-OS</p>
                        </div>
                        <form onSubmit={handleAddKey} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-text-tertiary ml-1">Provider</label>
                                    <select value={newKey.provider} onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })} className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm">
                                        <option value="groq">Groq (Llama 3.3)</option>
                                        <option value="deepseek">DeepSeek (V3)</option>
                                        <option value="gemini">Google Gemini</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-text-tertiary ml-1">Priority</label>
                                    <input type="number" value={newKey.priority} onChange={(e) => setNewKey({ ...newKey, priority: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm" min="1" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-text-tertiary ml-1">Label Name</label>
                                <input type="text" placeholder="e.g. Primary Groq Key" value={newKey.label} onChange={(e) => setNewKey({ ...newKey, label: e.target.value })} className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-text-tertiary ml-1">API Key</label>
                                <input type="password" placeholder="Paste your key here..." value={newKey.apiKey} onChange={(e) => setNewKey({ ...newKey, apiKey: e.target.value })} className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm font-mono" required />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-bg-secondary text-text-primary font-bold rounded-2xl hover:bg-border transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-accent text-white font-bold rounded-2xl hover:bg-accent-hover transition-all shadow-soft">Save Engine</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
