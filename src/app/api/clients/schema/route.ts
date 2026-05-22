import { NextResponse } from 'next/server'
import { getNotionSchema, addNotionColumn } from '@/lib/notion'

export async function GET() {
  try {
    const schema = await getNotionSchema()
    return NextResponse.json(schema)
  } catch (error: any) {
    console.error('Failed to fetch schema:', error)
    return NextResponse.json({ error: 'Failed to fetch schema' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, type } = body
    
    if (!name || !type) {
      return NextResponse.json({ error: 'Missing name or type' }, { status: 400 })
    }

    await addNotionColumn(name, type)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Failed to add column:', error.body || error)
    return NextResponse.json({ error: 'Failed to add column' }, { status: 500 })
  }
}
