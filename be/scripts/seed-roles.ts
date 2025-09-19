import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRoles() {
  try {
    console.log('🚀 Starting roles seed...');

    const roles = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'User' },
      { id: 3, name: 'Moderator' }
    ];

    for (const role of roles) {
      const existingRole = await prisma.roles.findUnique({
        where: { id: role.id }
      });

      if (!existingRole) {
        await prisma.roles.create({
          data: {
            id: role.id,
            name: role.name
          }
        });
        console.log(`✅ Created role: ${role.name} (ID: ${role.id})`);
      } else {
        console.log(`📋 Role already exists: ${role.name} (ID: ${role.id})`);
      }
    }

    console.log('🎉 Roles seed completed successfully!');

  } catch (error) {
    console.error('❌ Roles seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
if (require.main === module) {
  seedRoles()
    .then(() => {
      console.log('✅ Roles seed process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Roles seed process failed:', error);
      process.exit(1);
    });
}

export default seedRoles;
