import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getNotionClients } from '@/lib/notion'

export async function POST() {
  try {
    const notionClients = await getNotionClients()

    if (notionClients.length === 0) {
      return NextResponse.json({ message: 'No clients found in Notion or integration not configured' })
    }

    const results = []

    for (const notionClient of notionClients) {
      const client = await prisma.client.upsert({
        where: { notionId: notionClient.notionId },
        update: {
          name: notionClient.name,
          niche: notionClient.niche,
          status: notionClient.status,
          priority: notionClient.priority,
          notes: notionClient.notes,
          dynamicProps: notionClient.dynamicProps || {},
        },
        create: {
          notionId: notionClient.notionId,
          name: notionClient.name,
          niche: notionClient.niche,
          status: notionClient.status,
          priority: notionClient.priority,
          notes: notionClient.notes,
          dynamicProps: notionClient.dynamicProps || {},
        },
      })
      results.push(client)
    }

    // Remove local records that no longer exist in Notion
    const notionIds = notionClients.map(c => c.notionId)
    await prisma.client.deleteMany({
      where: {
        notionId: { not: null },
        NOT: { notionId: { in: notionIds } },
      },
    })

    return NextResponse.json({ 
      message: 'Sync completed', 
      count: results.length 
    })
  } catch (error) {
    console.error('Sync Error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

