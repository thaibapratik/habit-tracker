import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createNotionClient } from '@/lib/notion'

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // 1. Create in Notion first to get the Notion ID
    const notionId = await createNotionClient({
      name: body.name,
      niche: body.niche,
      status: body.status,
      priority: body.priority,
      notes: body.notes,
      dynamicProps: body.dynamicProps
    })

    // 2. Create in local database with the Notion ID
    const client = await prisma.client.create({
      data: {
        ...body,
        notionId: notionId || undefined // Save notionId if integration is setup
      },
    })
    
    return NextResponse.json(client)
  } catch (error: any) {
    console.error('API Error creating client:', error.body || error)
    return NextResponse.json({ error: 'Failed to create client', details: error.message }, { status: 500 })
  }
}
