import "dotenv/config"
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clear existing goals
  await prisma.goal.deleteMany()
  
  // Seed default goals
  await prisma.goal.createMany({
    data: [
      { milestone: "$100", targetAmount: 100 },
      { milestone: "$1000", targetAmount: 1000 },
      { milestone: "$10000", targetAmount: 10000 },
    ],
  })

  // Seed 90-day roadmap phases
  await prisma.roadmapPhase.deleteMany()
  await prisma.roadmapPhase.createMany({
    data: [
      { name: "Foundation", startDay: 1, endDay: 14, focus: "Market Research & Offer Clarity" },
      { name: "Outreach", startDay: 15, endDay: 30, focus: "High Volume DMing & Engagement" },
      { name: "Deliver", startDay: 31, endDay: 45, focus: "Client Audits & Early Wins" },
      { name: "Convert", startDay: 46, endDay: 60, focus: "Closing Retainers & Sales Calls" },
      { name: "Scale", startDay: 61, endDay: 75, focus: "Systematizing outreach & Content" },
      { name: "$10k mode", startDay: 76, endDay: 90, focus: "Hitting the milestone" },
    ],
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(JSON.stringify(e, null, 2))
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
