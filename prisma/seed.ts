import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // 1. Create Categories
  const laptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'High-performance laptops for work and gaming.',
    },
  })

  const desktops = await prisma.category.upsert({
    where: { slug: 'desktops' },
    update: {},
    create: {
      name: 'Desktops',
      slug: 'desktops',
      description: 'Custom-built PCs and workstations.',
    },
  })

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Keyboards, mice, headsets, and more.',
    },
  })

  // 2. Create Products
  // Laptops
  await prisma.product.upsert({
    where: { slug: 'macbook-pro-14-m3' },
    update: {},
    create: {
      name: 'MacBook Pro 14" M3',
      slug: 'macbook-pro-14-m3',
      description: 'The most advanced Mac laptop for pros. Featuring the M3 chip.',
      price: 320000,
      stock_quantity: 5,
      category_id: laptops.id,
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=1000',
      specs: JSON.stringify({
        processor: 'Apple M3 Pro',
        ram: '18GB',
        storage: '512GB SSD',
        screen: '14-inch Liquid Retina XDR',
      }),
    },
  })

  await prisma.product.upsert({
    where: { slug: 'dell-xps-15' },
    update: {},
    create: {
      name: 'Dell XPS 15',
      slug: 'dell-xps-15',
      description: 'High-performance Windows laptop with a stunning OLED display.',
      price: 280000,
      stock_quantity: 8,
      category_id: laptops.id,
      image_url: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&q=80&w=1000',
      specs: JSON.stringify({
        processor: 'Intel Core i9-13900H',
        ram: '32GB DDR5',
        storage: '1TB NVMe SSD',
        screen: '15.6" 3.5K OLED',
      }),
    },
  })

  // Accessories
  await prisma.product.upsert({
    where: { slug: 'logitech-mx-master-3s' },
    update: {},
    create: {
      name: 'Logitech MX Master 3S',
      slug: 'logitech-mx-master-3s',
      description: 'The iconic mouse, remastered for ultimate tactility, performance, and flow.',
      price: 22000,
      stock_quantity: 20,
      category_id: accessories.id,
      image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=1000',
      specs: JSON.stringify({
        connectivity: 'Bluetooth & Logi Bolt',
        dpi: '8000 DPI',
        battery: 'Rechargeable Li-Po',
      }),
    },
  })

  await prisma.product.upsert({
    where: { slug: 'keychron-k2-pro' },
    update: {},
    create: {
      name: 'Keychron K2 Pro',
      slug: 'keychron-k2-pro',
      description: 'Wireless custom mechanical keyboard with QMK/VIA support.',
      price: 25000,
      stock_quantity: 15,
      category_id: accessories.id,
      image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=1000',
      specs: JSON.stringify({
        switch_type: 'Gateron G Pro Red',
        layout: '75%',
        backlight: 'RGB',
      }),
    },
  })

  // 3. Create Admin User
  const { hash } = require('bcryptjs');
  const passwordHash = await hash('admin123', 10);

  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: passwordHash,
      role: 'admin',
    },
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
