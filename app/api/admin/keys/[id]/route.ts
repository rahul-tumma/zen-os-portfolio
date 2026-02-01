import { supabaseAdmin } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        const body = await request.json()

        const allowedFields = ['is_enabled', 'key_label', 'priority', 'notes']
        const updates: any = {}

        for (const field of allowedFields) {
            if (field in body) {
                updates[field] = body[field]
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 })
        }

        const { data, error } = await supabaseAdmin
            .from('api_keys')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) return NextResponse.json({ error: 'Failed to update key' }, { status: 500 })
        return NextResponse.json({ success: true, key: data })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        const { error } = await supabaseAdmin
            .from('api_keys')
            .update({ is_deleted: true, is_enabled: false })
            .eq('id', id)

        if (error) return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 })
        return NextResponse.json({ success: true, message: 'Key deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
