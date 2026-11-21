import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting LoveStory database seeding...');

  // 1. Seed Templates
  const templates = [
    {
      id: 'pastel',
      name: 'Korean Minimalist',
      slug: 'korean-minimalist',
      description: 'Tone kem & xanh Sage thanh lịch phong cách Hàn Quốc',
      tier: 'BASIC',
      price: 0,
      badge: 'Thanh lịch',
      thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      isActive: true,
      displayOrder: 1,
    },
    {
      id: 'floral',
      name: 'Romantic Floral',
      slug: 'romantic-floral',
      description: 'Hồng phấn pastel hoa lá lãng mạn nhẹ nhàng',
      tier: 'BASIC',
      price: 0,
      badge: 'Lãng mạn',
      thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
      isActive: true,
      displayOrder: 2,
    },
    {
      id: 'burgundy',
      name: 'Burgundy Cinema',
      slug: 'burgundy-cinema',
      description: 'Đỏ rượu vang & Vàng kim điện ảnh sang trọng quý phái',
      tier: 'VIP',
      price: 30000,
      badge: 'VIP Sang Trọng',
      thumbnail: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80',
      isActive: true,
      displayOrder: 3,
    },
    {
      id: 'retro',
      name: 'Vintage Retro Film',
      slug: 'vintage-retro-film',
      description: 'Màu phim hoài niệm & khung ảnh Polaroid cổ điển',
      tier: 'VIP',
      price: 30000,
      badge: 'VIP Hoài Niệm',
      thumbnail: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
      isActive: true,
      displayOrder: 4,
    },
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
    console.log(`  ✓ Template seeded: ${t.name} (${t.tier})`);
  }

  // 2. Seed Admin User
  const adminPasswordHash = await bcrypt.hash('Admin@LoveStory2026', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lovestory.me' },
    update: {
      name: 'Quản Trị Viên',
      role: 'ADMIN',
      plan: 'LIFETIME_VIP_200K',
      passwordHash: adminPasswordHash,
    },
    create: {
      email: 'admin@lovestory.me',
      name: 'Quản Trị Viên',
      role: 'ADMIN',
      plan: 'LIFETIME_VIP_200K',
      passwordHash: adminPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    },
  });
  console.log(`  ✓ Admin user created: ${admin.email} (Role: ${admin.role})`);

  // 3. Seed Demo Users
  const userPasswordHash = await bcrypt.hash('123456', 10);
  const demoGroom = await prisma.user.upsert({
    where: { email: 'chure@lovestory.me' },
    update: {
      name: 'Anh Tuấn',
      phone: '0901234567',
      role: 'USER',
      plan: 'FREE',
      passwordHash: userPasswordHash,
    },
    create: {
      email: 'chure@lovestory.me',
      name: 'Anh Tuấn',
      phone: '0901234567',
      role: 'USER',
      plan: 'FREE',
      passwordHash: userPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    },
  });
  console.log(`  ✓ Demo groom user created: ${demoGroom.email}`);

  const demoBride = await prisma.user.upsert({
    where: { email: 'codau@lovestory.me' },
    update: {
      name: 'Thùy Dương',
      phone: '0909876543',
      role: 'USER',
      plan: 'ANNUAL_50K',
      passwordHash: userPasswordHash,
    },
    create: {
      email: 'codau@lovestory.me',
      name: 'Thùy Dương',
      phone: '0909876543',
      role: 'USER',
      plan: 'ANNUAL_50K',
      passwordHash: userPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    },
  });
  console.log(`  ✓ Demo bride user created: ${demoBride.email}`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
