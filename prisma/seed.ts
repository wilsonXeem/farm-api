import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

function pastDate(daysAgo: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d
}

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.payroll.deleteMany()
  await prisma.production.deleteMany()
  await prisma.mortality.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.feed.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.pen.deleteMany()
  await prisma.worker.deleteMany()
  await prisma.user.deleteMany()
  await prisma.farm.deleteMany()
  console.log('🧹 Cleaned existing data')

  // Farm
  const farm = await prisma.farm.create({
    data: { id: 'demo-farm-001', name: 'Demo Poultry Farm', location: 'Lagos, Nigeria', totalBirds: 500 },
  })
  console.log('✅ Farm created:', farm.name)

  // Workers (3 workers manage 5 pens)
  const [w1, w2, w3] = await Promise.all([
    prisma.worker.create({ data: { name: 'Emeka Okafor',  role: 'Pen Attendant', salary: 80000, phone: '080-1234-5678', employedDate: new Date('2024-01-15'), farmId: farm.id } }),
    prisma.worker.create({ data: { name: 'Ngozi Adeyemi', role: 'Pen Attendant', salary: 45000, phone: '080-9876-5432', employedDate: new Date('2024-03-01'), farmId: farm.id } }),
    prisma.worker.create({ data: { name: 'Chidi Nwosu',   role: 'Pen Attendant', salary: 35000, phone: '081-5554-4433', employedDate: new Date('2024-06-10'), farmId: farm.id } }),
  ])
  console.log('✅ Workers created')

  // 5 Pens — 100 birds each, assigned to workers
  const pens = await Promise.all([
    prisma.pen.create({ data: { name: 'Pen 1', totalBirds: 100, farmId: farm.id, workerId: w1.id } }),
    prisma.pen.create({ data: { name: 'Pen 2', totalBirds: 100, farmId: farm.id, workerId: w1.id } }),
    prisma.pen.create({ data: { name: 'Pen 3', totalBirds: 100, farmId: farm.id, workerId: w2.id } }),
    prisma.pen.create({ data: { name: 'Pen 4', totalBirds: 100, farmId: farm.id, workerId: w2.id } }),
    prisma.pen.create({ data: { name: 'Pen 5', totalBirds: 100, farmId: farm.id, workerId: w3.id } }),
  ])
  console.log('✅ 5 Pens created (Pen 1-2: Emeka, Pen 3-4: Ngozi, Pen 5: Chidi)')

  // Users — staff users linked to workers
  const userDefs = [
    { name: 'Admin User',   email: 'admin@pffms.com',    password: 'admin123',    role: 'ADMIN' as const,        workerId: null },
    { name: 'Farm Manager', email: 'manager@pffms.com',  password: 'manager123',  role: 'FARM_MANAGER' as const, workerId: null },
    { name: 'Accountant',   email: 'accounts@pffms.com', password: 'accounts123', role: 'ACCOUNTANT' as const,   workerId: null },
    { name: 'Sales Officer',email: 'sales@pffms.com',    password: 'sales123',    role: 'SALES' as const,        workerId: null },
    { name: 'Emeka Okafor', email: 'emeka@pffms.com',    password: 'emeka123',    role: 'STAFF' as const,        workerId: w1.id },
    { name: 'Ngozi Adeyemi',email: 'ngozi@pffms.com',    password: 'ngozi123',    role: 'STAFF' as const,        workerId: w2.id },
    { name: 'Chidi Nwosu',  email: 'chidi@pffms.com',    password: 'chidi123',    role: 'STAFF' as const,        workerId: w3.id },
  ]
  for (const u of userDefs) {
    const hashed = await bcrypt.hash(u.password, 10)
    await prisma.user.create({
      data: { name: u.name, email: u.email, password: hashed, role: u.role, farmId: farm.id, workerId: u.workerId },
    })
  }
  console.log('✅ Users created')

  // Production — 7 days per pen
  for (const pen of pens) {
    for (let i = 6; i >= 0; i--) {
      const total = 80 + Math.floor(Math.random() * 20)
      const cracked = Math.floor(Math.random() * 5)
      const spoilt = Math.floor(Math.random() * 3)
      await prisma.production.create({
        data: {
          date: pastDate(i), totalEggs: total, crackedEggs: cracked,
          spoiltEggs: spoilt, goodEggs: total - cracked - spoilt,
          farmId: farm.id, penId: pen.id,
        },
      })
    }
  }
  console.log('✅ Production seeded (7 days × 5 pens)')

  // Mortality — a few per pen
  for (const pen of pens) {
    await prisma.mortality.create({
      data: { date: pastDate(3), count: Math.floor(Math.random() * 3) + 1, cause: 'Disease', farmId: farm.id, penId: pen.id },
    })
  }
  console.log('✅ Mortality seeded')

  // Inventory
  await prisma.inventory.createMany({ data: [
    { item: 'Layers mash',  qty: 500, unit: 'kg',    unitPrice: 320,  minQty: 100, supplier: 'ABC Agro',     farmId: farm.id },
    { item: 'Dry maize',    qty: 80,  unit: 'kg',    unitPrice: 280,  minQty: 200, supplier: 'XYZ Feeds',    farmId: farm.id },
    { item: 'Vaccine (ND)', qty: 50,  unit: 'vials', unitPrice: 1500, minQty: 20,  supplier: 'VetCare',      farmId: farm.id },
    { item: 'Crates',       qty: 120, unit: 'pcs',   unitPrice: 800,  minQty: 30,  supplier: 'Local Market', farmId: farm.id },
  ]})
  console.log('✅ Inventory seeded')

  // Feed
  await prisma.feed.createMany({ data: [
    { date: pastDate(5), item: 'Dry maize',   qty: 500,  unitPrice: 280,  totalCost: 140000, supplier: 'XYZ Feeds', farmId: farm.id },
    { date: pastDate(3), item: 'Layers mash', qty: 1000, unitPrice: 320,  totalCost: 320000, supplier: 'ABC Agro',  farmId: farm.id },
    { date: pastDate(1), item: 'Premix',      qty: 10,   unitPrice: 4500, totalCost: 45000,  supplier: 'VetCare',   farmId: farm.id },
  ]})
  console.log('✅ Feed seeded')

  // Expenses
  await prisma.expense.createMany({ data: [
    { date: pastDate(4), category: 'ELECTRICITY', amount: 25000, description: 'NEPA bill',          farmId: farm.id },
    { date: pastDate(3), category: 'FUEL',        amount: 18000, description: 'Generator fuel',     farmId: farm.id },
    { date: pastDate(2), category: 'MEDICATION',  amount: 12000, description: 'Poultry vitamins',   farmId: farm.id },
    { date: pastDate(0), category: 'TRANSPORT',   amount: 8000,  description: 'Delivery to market', farmId: farm.id },
  ]})
  console.log('✅ Expenses seeded')

  // Sales
  await prisma.sale.createMany({ data: [
    { date: pastDate(3), customer: 'Mama Nkechi',   crates: 20, pricePerCrate: 3200, total: 64000,  status: 'PAID',   farmId: farm.id },
    { date: pastDate(2), customer: 'Alhaji Bello',  crates: 50, pricePerCrate: 3000, total: 150000, status: 'UNPAID', farmId: farm.id },
    { date: pastDate(1), customer: 'Retail Market', crates: 30, pricePerCrate: 3100, total: 93000,  status: 'PAID',   farmId: farm.id },
  ]})
  console.log('✅ Sales seeded')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📋 Login credentials:')
  console.log('  Admin:    admin@pffms.com    / admin123')
  console.log('  Manager:  manager@pffms.com  / manager123')
  console.log('  Accounts: accounts@pffms.com / accounts123')
  console.log('  Sales:    sales@pffms.com     / sales123')
  console.log('  Staff:    emeka@pffms.com    / emeka123   (Pen 1 & 2)')
  console.log('  Staff:    ngozi@pffms.com    / ngozi123   (Pen 3 & 4)')
  console.log('  Staff:    chidi@pffms.com    / chidi123   (Pen 5)')
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect(); await pool.end() })
