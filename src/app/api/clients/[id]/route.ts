import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { updateNotionClient } from '@/lib/notion'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    // Update in Prisma
    const client = await prisma.client.update({
      where: { id },
      data: {
        name: body.name,
        niche: body.niche,
        status: body.status,
        priority: body.priority,
        notes: body.notes,
      },
    })

    // Sync back to Notion if linked
    if (client.notionId) {
      await updateNotionClient(client.notionId, {
        name: body.name,
        niche: body.niche,
        status: body.status,
        priority: body.priority,
        notes: body.notes,
      })
    }

    return NextResponse.json(client)
  } catch (error: any) {
    console.error('Failed to update client:', error)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.client.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Failed to delete client:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
