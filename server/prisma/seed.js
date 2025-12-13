import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function main() {
    console.log('Seeding database...');
    // Create categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { name: 'electrical' },
            update: {},
            create: { name: 'electrical', nameTh: 'ไฟฟ้า', icon: 'Zap', color: '#F59E0B', sortOrder: 1 },
        }),
        prisma.category.upsert({
            where: { name: 'plumbing' },
            update: {},
            create: { name: 'plumbing', nameTh: 'ประปา', icon: 'Droplets', color: '#3B82F6', sortOrder: 2 },
        }),
        prisma.category.upsert({
            where: { name: 'air_conditioning' },
            update: {},
            create: { name: 'air_conditioning', nameTh: 'แอร์/เครื่องปรับอากาศ', icon: 'Wind', color: '#06B6D4', sortOrder: 3 },
        }),
        prisma.category.upsert({
            where: { name: 'computer' },
            update: {},
            create: { name: 'computer', nameTh: 'คอมพิวเตอร์', icon: 'Monitor', color: '#8B5CF6', sortOrder: 4 },
        }),
        prisma.category.upsert({
            where: { name: 'network' },
            update: {},
            create: { name: 'network', nameTh: 'เครือข่าย/Internet', icon: 'Wifi', color: '#10B981', sortOrder: 5 },
        }),
        prisma.category.upsert({
            where: { name: 'furniture' },
            update: {},
            create: { name: 'furniture', nameTh: 'เฟอร์นิเจอร์', icon: 'Armchair', color: '#78716C', sortOrder: 6 },
        }),
        prisma.category.upsert({
            where: { name: 'cleaning' },
            update: {},
            create: { name: 'cleaning', nameTh: 'ความสะอาด', icon: 'Sparkles', color: '#EC4899', sortOrder: 7 },
        }),
        prisma.category.upsert({
            where: { name: 'other' },
            update: {},
            create: { name: 'other', nameTh: 'อื่นๆ', icon: 'HelpCircle', color: '#6B7280', sortOrder: 8 },
        }),
    ]);
    console.log(`Created ${categories.length} categories`);
    // Create locations
    const locations = await Promise.all([
        prisma.location.create({
            data: { building: 'อาคาร A', floor: '1', room: 'ห้อง 101' },
        }),
        prisma.location.create({
            data: { building: 'อาคาร A', floor: '1', room: 'ห้อง 102' },
        }),
        prisma.location.create({
            data: { building: 'อาคาร A', floor: '2', room: 'ห้อง 201' },
        }),
        prisma.location.create({
            data: { building: 'อาคาร A', floor: '2', room: 'ห้อง 202' },
        }),
        prisma.location.create({
            data: { building: 'อาคาร B', floor: '1', room: 'ห้องประชุม 1' },
        }),
        prisma.location.create({
            data: { building: 'อาคาร B', floor: '1', room: 'ห้องประชุม 2' },
        }),
        prisma.location.create({
            data: { building: 'อาคาร B', floor: '2', room: 'ห้อง IT' },
        }),
        prisma.location.create({
            data: { building: 'อาคาร C', floor: '1', room: 'Lobby' },
        }),
    ]);
    console.log(`Created ${locations.length} locations`);
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@fixflow.com' },
        update: {},
        create: {
            email: 'admin@fixflow.com',
            passwordHash: adminPassword,
            name: 'Admin',
            role: Role.admin,
            department: 'IT Department',
        },
    });
    console.log(`Created admin user: ${admin.email}`);
    // Create technician user
    const techPassword = await bcrypt.hash('tech123', 12);
    const techUser = await prisma.user.upsert({
        where: { email: 'tech@fixflow.com' },
        update: {},
        create: {
            email: 'tech@fixflow.com',
            passwordHash: techPassword,
            name: 'ช่างสมชาย',
            role: Role.technician,
            phone: '0812345678',
            department: 'Maintenance',
        },
    });
    // Create technician profile
    await prisma.technician.upsert({
        where: { userId: techUser.id },
        update: {},
        create: {
            userId: techUser.id,
            specialty: ['electrical', 'air_conditioning', 'plumbing'],
            isAvailable: true,
            maxJobsPerDay: 5,
        },
    });
    console.log(`Created technician user: ${techUser.email}`);
    // Create demo user
    const userPassword = await bcrypt.hash('user123', 12);
    const demoUser = await prisma.user.upsert({
        where: { email: 'user@fixflow.com' },
        update: {},
        create: {
            email: 'user@fixflow.com',
            passwordHash: userPassword,
            name: 'Demo User',
            role: Role.user,
            phone: '0898765432',
            department: 'HR',
        },
    });
    console.log(`Created demo user: ${demoUser.email}`);
    console.log('Seeding completed!');
    console.log('\nTest accounts:');
    console.log('  Admin: admin@fixflow.com / admin123');
    console.log('  Tech:  tech@fixflow.com / tech123');
    console.log('  User:  user@fixflow.com / user123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map