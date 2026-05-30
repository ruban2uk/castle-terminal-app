import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const adapter = new PrismaNeon({ connectionString })

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding...')

  // Create admin user (skip if exists)
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@castle.com' },
  })

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: 'admin@castle.com',
        password: '$2a$10$yourhashedpassword',
        name: 'Admin User',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })
    console.log('Admin user created:', admin.id)
  } else {
    console.log('Admin user already exists')
  }

  // Create product categories (skip if exists)
  const existingCategories = await prisma.productCategoryModel.count()
  if (existingCategories === 0) {
    const categories = await Promise.all([
      prisma.productCategoryModel.create({
        data: { name: 'eTopup', slug: 'etopup', description: 'Mobile airtime top-up', icon: 'Smartphone', sortOrder: 1 },
      }),
      prisma.productCategoryModel.create({
        data: { name: 'eSIM', slug: 'esim', description: 'Travel data bundles', icon: 'Cpu', sortOrder: 2 },
      }),
      prisma.productCategoryModel.create({
        data: { name: 'International Voucher', slug: 'voucher', description: 'Calling PINs', icon: 'Globe2', sortOrder: 3 },
      }),
      prisma.productCategoryModel.create({
        data: { name: 'Gift Card', slug: 'gift-card', description: 'Digital codes', icon: 'Gift', sortOrder: 4 },
      }),
    ])
    console.log('Categories created:', categories.length)
  } else {
    console.log('Categories already exist')
  }

  // Create DT One provider (skip if exists)
  const existingDtOne = await prisma.provider.findUnique({
    where: { code: 'DT_ONE' },
  })

  if (!existingDtOne) {
    const dtOneProvider = await prisma.provider.create({
      data: {
        name: 'DT One',
        code: 'DT_ONE',
        description: 'Global digital value provider via DT One API',
        type: 'API',
        status: 'ACTIVE',
        apiBaseUrl: process.env.DTONE_BASE_URL || 'https://preprod-dvs-api.dtone.com/v1/',
        apiKey: process.env.DTONE_API_KEY || '',
        apiSecret: process.env.DTONE_API_SECRET || '',
      },
    })
    console.log('DT One provider created:', dtOneProvider.id)
  } else {
    console.log('DT One provider already exists')
  }

  // Create Internal provider (skip if exists)
  const existingInternal = await prisma.provider.findUnique({
    where: { code: 'INTERNAL' },
  })

  if (!existingInternal) {
    const internalProvider = await prisma.provider.create({
      data: {
        name: 'Internal PIN Stock',
        code: 'INTERNAL',
        description: 'Manual PIN inventory management',
        type: 'MANUAL',
        status: 'ACTIVE',
      },
    })
    console.log('Internal provider created:', internalProvider.id)
  } else {
    console.log('Internal provider already exists')
  }

  // Create sample products (skip if exists)
  const existingProducts = await prisma.product.count()
  if (existingProducts === 0) {
    const categories = await prisma.productCategoryModel.findMany()
    const dtOneProvider = await prisma.provider.findUnique({ where: { code: 'DT_ONE' } })
    const internalProvider = await prisma.provider.findUnique({ where: { code: 'INTERNAL' } })

    if (categories.length >= 4 && dtOneProvider && internalProvider) {
      const products = await Promise.all([
        prisma.product.create({
          data: {
            sku: 'LEB-10-UK',
            name: 'Lebara £10 Top-up',
            description: 'UK Lebara mobile airtime top-up via DT One',
            retailPrice: 10.00,
            type: 'ETOPUP',
            operator: 'Lebara',
            country: 'GB',
            categoryId: categories[0].id,
            fulfillmentMode: 'API',
          },
        }),
        prisma.product.create({
          data: {
            sku: 'GCC-5-INT',
            name: 'Global Call Card £5',
            description: 'International calling voucher - Manual PIN',
            retailPrice: 5.00,
            type: 'VOUCHER',
            country: 'INT',
            categoryId: categories[2].id,
            fulfillmentMode: 'MANUAL_PIN',
          },
        }),
        prisma.product.create({
          data: {
            sku: 'USA-ESIM-5GB',
            name: 'USA eSIM 5GB',
            description: 'USA travel data bundle 5GB via DT One',
            retailPrice: 14.99,
            type: 'ESIM',
            country: 'US',
            categoryId: categories[1].id,
            fulfillmentMode: 'API',
          },
        }),
        prisma.product.create({
          data: {
            sku: 'NG-DATA-2GB',
            name: 'Nigeria Data 2GB',
            description: 'Nigeria mobile data bundle via DT One',
            retailPrice: 8.00,
            type: 'DATA',
            country: 'NG',
            categoryId: categories[0].id,
            fulfillmentMode: 'API',
          },
        }),
      ])

      console.log('Products created:', products.length)

      // Create provider products
      await Promise.all([
        prisma.providerProduct.create({
          data: {
            providerId: dtOneProvider.id,
            productId: products[0].id,
            providerProductCode: 'DT-LEB-10',
            buyingPrice: 8.90,
            retailPrice: 10.00,
            platformMargin: 0.38,
            retailerMargin: 0.72,
            priority: 1,
          },
        }),
        prisma.providerProduct.create({
          data: {
            providerId: internalProvider.id,
            productId: products[1].id,
            providerProductCode: 'INT-GCC-5',
            buyingPrice: 4.12,
            retailPrice: 5.00,
            platformMargin: 0.32,
            retailerMargin: 0.56,
            priority: 1,
            stockLevel: 1284,
          },
        }),
        prisma.providerProduct.create({
          data: {
            providerId: dtOneProvider.id,
            productId: products[2].id,
            providerProductCode: 'DT-USA-ESIM-5GB',
            buyingPrice: 11.95,
            retailPrice: 14.99,
            platformMargin: 1.19,
            retailerMargin: 1.85,
            priority: 1,
          },
        }),
        prisma.providerProduct.create({
          data: {
            providerId: dtOneProvider.id,
            productId: products[3].id,
            providerProductCode: 'DT-NG-DATA-2GB',
            buyingPrice: 6.44,
            retailPrice: 8.00,
            platformMargin: 0.76,
            retailerMargin: 0.80,
            priority: 1,
          },
        }),
      ])

      console.log('Provider products created')
    }
  } else {
    console.log('Products already exist')
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
