import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Hash password function
function getHashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

async function seedAdmin() {
  try {
    console.log('🚀 Starting admin seed...');

    // First, ensure roles exist
    console.log('🔐 Ensuring roles exist...');
    
    // Create Admin role if not exists
    const adminRole = await prisma.roles.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Admin',
        isDeleted: false
      }
    });

    // Create User role if not exists
    const userRole = await prisma.roles.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'User',
        isDeleted: false
      }
    });

    console.log('✅ Roles ensured');

    // Admin credentials
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123456';
    const adminPhone = '0999999999';
    const hashedPassword = getHashPassword(adminPassword);

    // Check if admin user already exists
    const existingAdmin = await prisma.users.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('👤 Admin user already exists, updating...');
      
      await prisma.users.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          name: 'Super Admin',
          roleId: adminRole.id,
          two_factor_enabled: false,
          newsletter_subscribed: false,
          isDeleted: false
        }
      });
      
      console.log('✅ Admin user updated');
    } else {
      console.log('👤 Creating admin user...');
      
      await prisma.users.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Super Admin',
          phone: adminPhone,
          address: 'Hà Nội, Việt Nam',
          gender: 'Male',
          avatar: '',
          description: 'Quản trị viên hệ thống',
          roleId: adminRole.id,
          two_factor_enabled: false,
          newsletter_subscribed: false,
          isDeleted: false
        }
      });
      
      console.log('✅ Admin user created');
    }

  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log('\n✅ Seed process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seed process failed:', error);
      process.exit(1);
    });
}

export default seedAdmin;
