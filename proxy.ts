import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Protect all /admin routes except /admin/login
    if (path.startsWith('/admin') && path !== '/admin/login') {
        const sessionCookie = request.cookies.get('admin_session')

        if (!sessionCookie || sessionCookie.value !== 'authenticated') {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
