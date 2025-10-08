import { prisma } from "../src/config/database.js";

async function makeUserAdmin() {
  const email = process.argv[2];
  const roleArg = process.argv[3]?.toUpperCase();
  
  if (!email) {
    console.error('Please provide an email address');
    console.log('Usage: node scripts/make-admin.js <email> [role]');
    console.log('Roles: ADMIN (default), OWNER');
    console.log('Examples:');
    console.log('  node scripts/make-admin.js user@example.com');
    console.log('  node scripts/make-admin.js user@example.com OWNER');
    process.exit(1);
  }

  const role = roleArg === 'OWNER' ? 'OWNER' : 'ADMIN';

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role }
    });

    console.log(`✅ User ${updatedUser.name} (${updatedUser.email}) is now ${role === 'OWNER' ? 'an OWNER' : 'an ADMIN'}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

makeUserAdmin();

