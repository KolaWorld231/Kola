import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const prisma = new PrismaClient()
  try {
    const dbList = await prisma.$queryRawUnsafe('PRAGMA database_list;')
    await prisma.$disconnect()
    // Convert any BigInt values to strings for JSON serialization
    const dbListStr = JSON.parse(JSON.stringify(dbList, (_, value) => typeof value === 'bigint' ? value.toString() : value))
    return NextResponse.json({ env: process.env.DATABASE_URL || null, dbList: dbListStr })
  } catch (e) {
    await prisma.$disconnect()
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
