import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()
        const adminPassword = process.env.ADMIN_PASSWORD

        if (!adminPassword) {
            return NextResponse.json(
                { error: 'Admin password not configured on server' },
                { status: 500 }
            )
        }

        if (password === adminPassword) {
            const cookieStore = await cookies()

            cookieStore.set('admin_session', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            })

            return NextResponse.json({ success: true })
        }

        return NextResponse.json(
            { error: 'Invalid password' },
            { status: 401 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
