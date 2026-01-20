import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed Roles
  console.log('📋 Seeding roles...');
  const roleAdmin = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'ADMIN' },
  });
  await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'USER' },
  });
  console.log('✓ Roles seeded');

  // Seed Categories
  console.log('📚 Seeding categories...');
  const categories = [
    'Ficción',
    'No Ficción',
    'Ciencia',
    'Historia',
    'Biografía',
    'Poesía',
    'Drama',
    'Comedia',
    'Romance',
    'Aventura',
  ];

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
  }
  console.log('✓ Categories seeded');

  // Seed Demo Books
  console.log('📖 Seeding demo books...');
  const fictionCategory = await prisma.category.findFirst({
    where: { name: 'Ficción' },
  });

  if (fictionCategory) {
    const demoBooks = [
      {
        title: 'El Señor de los Anillos',
        author: 'J.R.R. Tolkien',
        description: 'Una épica aventura en la Tierra Media',
        categoryId: fictionCategory.id,
        price: 29.99,
        purchaseStock: 10,
        rentalStock: 5,
        available: true,
      },
      {
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        description: 'La saga de la familia Buendía',
        categoryId: fictionCategory.id,
        price: 24.99,
        purchaseStock: 15,
        rentalStock: 8,
        available: true,
      },
      {
        title: '1984',
        author: 'George Orwell',
        description: 'Una distopía sobre el totalitarismo',
        categoryId: fictionCategory.id,
        price: 19.99,
        purchaseStock: 20,
        rentalStock: 10,
        available: true,
      },
      {
        title: 'Don Quijote de la Mancha',
        author: 'Miguel de Cervantes',
        description: 'Las aventuras del ingenioso hidalgo',
        categoryId: fictionCategory.id,
        price: 34.99,
        purchaseStock: 12,
        rentalStock: 6,
        available: true,
      },
      {
        title: 'Harry Potter y la Piedra Filosofal',
        author: 'J.K. Rowling',
        description: 'El inicio de la saga mágica',
        categoryId: fictionCategory.id,
        price: 22.99,
        purchaseStock: 25,
        rentalStock: 12,
        available: true,
      },
    ];

    for (const book of demoBooks) {
      const existing = await prisma.book.findFirst({
        where: { title: book.title },
      });
      if (!existing) {
        await prisma.book.create({ data: book });
      }
    }
  }
  console.log('✓ Demo books seeded');

  // Seed Admin User
  console.log('👤 Seeding admin user...');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: 'admin@tugestionamiga.com' },
    update: {},
    create: {
      email: 'admin@tugestionamiga.com',
      name: 'Admin User',
      password: hashedPassword,
      roleId: roleAdmin.id,
    },
  });
  console.log('✓ Admin user seeded');
  console.log('   Email: admin@tugestionamiga.com');
  console.log(`   Password: ${adminPassword}`);

  console.log('\n✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
