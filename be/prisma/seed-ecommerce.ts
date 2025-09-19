import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to create slug from Vietnamese text
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

async function main() {
  // Clear existing data
  await prisma.reviews.deleteMany()
  await prisma.cartItems.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.orderItems.deleteMany()
  await prisma.payments.deleteMany()
  await prisma.orders.deleteMany()
  await prisma.products.deleteMany()
  await prisma.categories.deleteMany()
  await prisma.users.deleteMany()
  await prisma.roles.deleteMany()

  // Create roles
  const adminRole = await prisma.roles.create({
    data: {
      name: 'Admin'
    }
  })

  const userRole = await prisma.roles.create({
    data: {
      name: 'User'
    }
  })

  // Create admin user
  await prisma.users.create({
    data: {
      name: 'Admin User',
      email: 'admin@doctorcare.com',
      password: '$2b$10$rWFJZj4qlNOPRpjNJF7Qa.Xo/OqCzFgn9/Kg/s1hUMJ7yXgJqmGBK', // password: admin123
      address: '123 Admin Street, HCMC',
      phone: '0123456789',
      gender: 'Male',
      roleId: adminRole.id
    }
  })

  // Create categories
  const phoneCategory = await prisma.categories.create({
    data: {
      name: 'Điện thoại',
      description: 'Điện thoại thông minh các loại',
      image: 'photo-1511707171634-5f897ff02aa9.jpg',
      slug: createSlug('Điện thoại')
    }
  })

  const laptopCategory = await prisma.categories.create({
    data: {
      name: 'Laptop',
      description: 'Laptop cho công việc và giải trí',
      image: 'photo-1496181133206-80ce9b88a853.jpg',
      slug: createSlug('Laptop')
    }
  })

  const accessoryCategory = await prisma.categories.create({
    data: {
      name: 'Phụ kiện',
      description: 'Phụ kiện điện tử đa dạng',
      image: 'photo-1572569511254-d8f925fe2cbb.jpg',
      slug: createSlug('Phụ kiện')
    }
  })

  const headphoneCategory = await prisma.categories.create({
    data: {
      name: 'Tai nghe',
      description: 'Tai nghe chất lượng cao',
      image: 'photo-1505740420928-5e560c06d30e.jpg',
      slug: createSlug('Tai nghe')
    }
  })

  // Create products
  const products = [
    {
      name: 'iPhone 15 Pro Max',
      description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP chuyên nghiệp và thiết kế titan cao cấp. Trải nghiệm đỉnh cao của công nghệ Apple.',
      price: 29999000,
      sale_price: 27999000,
      sku: 'IPH15PM001',
      stock: 50,
      images: ['photo-1592750475338-74b7b21085ab.jpg'],
      slug: createSlug('iPhone 15 Pro Max'),
      meta_title: 'iPhone 15 Pro Max - Điện thoại cao cấp',
      meta_description: 'Mua iPhone 15 Pro Max chính hãng, giá tốt nhất tại DoctorCare',
      brand: 'Apple',
      category_id: phoneCategory.id,
      weight: 221
    },
    {
      name: 'Samsung Galaxy S24',
      description: 'Samsung Galaxy S24 với chip Snapdragon 8 Gen 3, màn hình Dynamic AMOLED 2X và camera AI tiên tiến. Đẳng cấp flagship Android.',
      price: 22999000,
      sale_price: 20999000,
      sku: 'SGS24001',
      stock: 40,
      images: ['photo-1511707171634-5f897ff02aa9.jpg'],
      slug: createSlug('Samsung Galaxy S24'),
      meta_title: 'Samsung Galaxy S24 - Flagship Android',
      meta_description: 'Mua Samsung Galaxy S24 chính hãng với giá ưu đãi',
      brand: 'Samsung',
      category_id: phoneCategory.id,
      weight: 167
    },
    {
      name: 'MacBook Pro M3',
      description: 'MacBook Pro M3 với hiệu năng vượt trội, màn hình Liquid Retina XDR và thời lượng pin lên đến 22 giờ. Lý tưởng cho công việc chuyên nghiệp.',
      price: 52999000,
      sale_price: 49999000,
      sku: 'MBP14M3001',
      stock: 25,
      images: ['photo-1541807084-5c52b6b3adef.jpg'],
      slug: createSlug('MacBook Pro M3'),
      meta_title: 'MacBook Pro M3 - Laptop cao cấp',
      meta_description: 'MacBook Pro M3 chính hãng Apple, bảo hành toàn cầu',
      brand: 'Apple',
      category_id: laptopCategory.id,
      weight: 1600
    },
    {
      name: 'AirPods Pro',
      description: 'AirPods Pro với công nghệ chống ồn chủ động, âm thanh spatial audio và thiết kế thoải mái. Trải nghiệm âm thanh đỉnh cao.',
      price: 6999000,
      sale_price: 5999000,
      sku: 'APP001',
      stock: 100,
      images: ['photo-1572569511254-d8f925fe2cbb.jpg'],
      slug: createSlug('AirPods Pro'),
      meta_title: 'AirPods Pro - Tai nghe không dây cao cấp',
      meta_description: 'AirPods Pro chính hãng Apple với công nghệ chống ồn',
      brand: 'Apple',
      category_id: headphoneCategory.id,
      weight: 56
    },
    {
      name: 'Dell XPS 13',
      description: 'Dell XPS 13 với thiết kế siêu mỏng, màn hình InfinityEdge và hiệu năng Intel Core thế hệ mới. Laptop di động hoàn hảo.',
      price: 32999000,
      sale_price: 29999000,
      sku: 'DXPS13001',
      stock: 30,
      images: ['photo-1496181133206-80ce9b88a853.jpg'],
      slug: createSlug('Dell XPS 13'),
      meta_title: 'Dell XPS 13 - Laptop ultrabook',
      meta_description: 'Dell XPS 13 chính hãng, thiết kế đẹp, hiệu năng cao',
      brand: 'Dell',
      category_id: laptopCategory.id,
      weight: 1200
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Sony WH-1000XM5 với công nghệ chống ồn hàng đầu, chất lượng âm thanh Hi-Res và thời lượng pin 30 giờ.',
      price: 8999000,
      sale_price: 7999000,
      sku: 'SWH1000XM5',
      stock: 60,
      images: ['photo-1505740420928-5e560c06d30e.jpg'],
      slug: createSlug('Sony WH-1000XM5'),
      meta_title: 'Sony WH-1000XM5 - Tai nghe chống ồn',
      meta_description: 'Sony WH-1000XM5 chính hãng với công nghệ chống ồn tốt nhất',
      brand: 'Sony',
      category_id: headphoneCategory.id,
      weight: 250
    },
    {
      name: 'iPad Pro M2',
      description: 'iPad Pro M2 với chip M2 mạnh mẽ, màn hình Liquid Retina XDR và hỗ trợ Apple Pencil thế hệ 2. Máy tính bảng chuyên nghiệp.',
      price: 25999000,
      sale_price: 23999000,
      sku: 'IPADPROM2',
      stock: 35,
      images: ['photo-1541807084-5c52b6b3adef.jpg'],
      slug: createSlug('iPad Pro M2'),
      meta_title: 'iPad Pro M2 - Máy tính bảng cao cấp',
      meta_description: 'iPad Pro M2 chính hãng Apple với hiệu năng vượt trội',
      brand: 'Apple',
      category_id: accessoryCategory.id,
      weight: 682
    },
    {
      name: 'Samsung Galaxy Watch 6',
      description: 'Samsung Galaxy Watch 6 với tính năng theo dõi sức khỏe toàn diện, GPS tích hợp và thời lượng pin lên đến 40 giờ.',
      price: 7999000,
      sale_price: 6999000,
      sku: 'SGW6001',
      stock: 45,
      images: ['photo-1572569511254-d8f925fe2cbb.jpg'],
      slug: createSlug('Samsung Galaxy Watch 6'),
      meta_title: 'Samsung Galaxy Watch 6 - Đồng hồ thông minh',
      meta_description: 'Samsung Galaxy Watch 6 chính hãng với tính năng sức khỏe',
      brand: 'Samsung',
      category_id: accessoryCategory.id,
      weight: 33
    }
  ]

  // Create products with reviews
  for (const productData of products) {
    const product = await prisma.products.create({
      data: productData
    })

    // Create some sample reviews for each product
    const reviewsData = [
      {
        user_id: (await prisma.users.findFirst())?.id || '',
        product_id: product.id,
        rating: 5,
        title: 'Sản phẩm tuyệt vời!',
        comment: 'Chất lượng sản phẩm rất tốt, đóng gói cẩn thận. Giao hàng nhanh chóng.'
      },
      {
        user_id: (await prisma.users.findFirst())?.id || '',
        product_id: product.id,
        rating: 4,
        title: 'Hài lòng với sản phẩm',
        comment: 'Sản phẩm đúng như mô tả, chất lượng ổn. Giá cả hợp lý.'
      }
    ]

    // Create reviews but skip if user doesn't exist or duplicate
    for (const reviewData of reviewsData) {
      try {
        await prisma.reviews.create({
          data: reviewData
        })
      } catch (error) {
        console.log('Skipping review creation:', error)
      }
    }
  }

  console.log('Ecommerce seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
