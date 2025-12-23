import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

console.log('Setting up...');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Querying...');
  const user = await prisma.user.findUnique({ where: { email: 'admin@fixflow.com' } });
  console.log('User found:', user?.email, user?.name, user?.role);
  await prisma.$disconnect();
  await pool.end();
  console.log('Done');
}
main().catch((e) => {
  console.error('Error name:', e.name);
  console.error('Error message:', e.message);
  process.exit(1);
});
