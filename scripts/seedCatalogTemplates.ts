import prisma from '../src/lib/prisma';
import { CATALOG_TEMPLATES } from '../src/data/templatesCatalog';

async function seedTemplates() {
  console.log(`Bắt đầu đồng bộ ${CATALOG_TEMPLATES.length} mẫu thiệp vào cơ sở dữ liệu...`);

  for (const tpl of CATALOG_TEMPLATES) {
    const tier = tpl.tier === 'PREMIUM' ? 'VIP' : tpl.tier === 'BASIC' ? 'BASIC' : 'BASIC';
    const price = tpl.price || (tier === 'VIP' ? 30000 : 0);
    const slug = tpl.slug || tpl.id;

    // Check if exists by slug
    const existing = await prisma.template.findUnique({
      where: { slug },
    });

    if (existing) {
      await prisma.template.update({
        where: { slug },
        data: {
          name: tpl.name,
          description: tpl.description,
          tier,
          price,
          badge: tpl.badge,
          thumbnail: tpl.longThumbnail,
          isActive: true,
        },
      });
    } else {
      await prisma.template.create({
        data: {
          id: tpl.id,
          name: tpl.name,
          slug,
          description: tpl.description,
          tier,
          price,
          badge: tpl.badge,
          thumbnail: tpl.longThumbnail,
          isActive: true,
        },
      });
    }
  }

  const count = await prisma.template.count();
  console.log(`✓ Đã đồng bộ thành công! Tổng số templates trong DB: ${count}`);
}

seedTemplates()
  .catch((e) => {
    console.error('Lỗi khi seed templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
