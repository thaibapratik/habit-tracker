import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const rawDbId = process.env.NOTION_DATABASE_ID || ''
const DATABASE_ID = rawDbId.split('?')[0]

async function getDataSourceId() {
  if (!DATABASE_ID) return ''
  const db = await notion.databases.retrieve({ database_id: DATABASE_ID })
  return (db as any).data_sources?.[0]?.id || DATABASE_ID
}

export async function getNotionSchema() {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return []
  }
  const dsId = await getDataSourceId()
  if (!dsId) return []
  const ds = await notion.dataSources.retrieve({ data_source_id: dsId })
  const properties = (ds as any).properties || {}
  return Object.entries(properties).map(([name, def]: [string, any]) => {
    return { name, type: def.type }
  })
}

export async function addNotionColumn(name: string, type: string) {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return null
  }
  const dsId = await getDataSourceId()
  return await notion.dataSources.update({
    data_source_id: dsId,
    properties: {
      [name]: { [type]: {} }
    }
  } as any)
}

export async function getNotionClients() {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return []
  }

  const dsId = await getDataSourceId()
  const response = await notion.dataSources.query({
    data_source_id: dsId,
  })

  return response.results.map((page: any) => {
    const coreProperties = ['Name', 'Niche', 'Status', 'Priority', 'Notes']
    const dynamicProps: Record<string, any> = {}

    for (const [key, value] of Object.entries(page.properties)) {
      if (!coreProperties.includes(key)) {
        const type = (value as any).type
        if (type === 'rich_text') {
          dynamicProps[key] = (value as any).rich_text[0]?.plain_text || ''
        } else if (type === 'number') {
          dynamicProps[key] = (value as any).number || null
        } else if (type === 'select') {
          dynamicProps[key] = (value as any).select?.name || ''
        } else if (type === 'date') {
          dynamicProps[key] = (value as any).date?.start || null
        } else if (type === 'checkbox') {
          dynamicProps[key] = (value as any).checkbox || false
        }
      }
    }

    return {
      notionId: page.id,
      name: page.properties.Name?.title[0]?.plain_text || 'Unknown',
      niche: page.properties.Niche?.rich_text[0]?.plain_text || 'General',
      status: page.properties.Status?.select?.name || 'prospect',
      priority: page.properties.Priority?.select?.name || 'Low',
      notes: page.properties.Notes?.rich_text[0]?.plain_text || '',
      dynamicProps: dynamicProps
    }
  })
}

export async function createNotionClient(client: {
  name: string
  niche: string
  status: string
  priority: string
  notes?: string
  dynamicProps?: Record<string, { type: string, value: any }>
}) {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return null
  }

  const properties: any = {
    Name: {
      title: [{ text: { content: client.name } }],
    },
    Status: {
      select: { name: client.status },
    },
    Priority: {
      select: { name: client.priority },
    },
  }

  if (client.niche) {
    properties.Niche = { rich_text: [{ text: { content: client.niche } }] }
  }

  if (client.notes) {
    properties.Notes = { rich_text: [{ text: { content: client.notes } }] }
  }

  if (client.dynamicProps) {
    for (const [key, field] of Object.entries(client.dynamicProps)) {
      if (!field.value && field.type !== 'checkbox') continue
      
      if (field.type === 'rich_text') {
        properties[key] = { rich_text: [{ text: { content: field.value } }] }
      } else if (field.type === 'number') {
        properties[key] = { number: parseFloat(field.value) || 0 }
      } else if (field.type === 'select') {
        properties[key] = { select: { name: field.value } }
      } else if (field.type === 'date') {
        properties[key] = { date: { start: field.value } }
      } else if (field.type === 'checkbox') {
        properties[key] = { checkbox: field.value === 'true' || field.value === true }
      }
    }
  }

  const dsId = await getDataSourceId()
  const response = await notion.pages.create({
    parent: { data_source_id: dsId } as any,
    properties,
  })

  return response.id
}

export async function updateNotionClient(
  notionId: string,
  updates: {
    name?: string
    niche?: string
    status?: string
    priority?: string
    notes?: string
  }
) {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return null
  }

  const properties: any = {}

  if (updates.name) {
    properties.Name = { title: [{ text: { content: updates.name } }] }
  }
  if (updates.niche) {
    properties.Niche = { rich_text: [{ text: { content: updates.niche } }] }
  }
  if (updates.status) {
    properties.Status = { select: { name: updates.status } }
  }
  if (updates.priority) {
    properties.Priority = { select: { name: updates.priority } }
  }
  if (updates.notes) {
    properties.Notes = { rich_text: [{ text: { content: updates.notes } }] }
  }

  await notion.pages.update({
    page_id: notionId,
    properties,
  })
}
