'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            if (res.ok) {
                router.push('/admin/keys')
            } else {
                const data = await res.json()
                setError(data.error || 'Login failed')
            }
        } catch (err) {
            setError('An error occurred during login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
            <div className="w-full max-w-md bg-bg-tertiary p-8 rounded-3xl border border-border shadow-soft-lg space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold">Admin Access</h1>
                    <p className="text-text-secondary mt-2">Enter credentials to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary px-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-error bg-error/10 p-3 rounded-lg text-center font-medium">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all shadow-soft disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    )
}
