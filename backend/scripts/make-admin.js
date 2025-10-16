import { prisma } from '../src/config/database.js';
import bcrypt from 'bcrypt';
import readline from 'readline';

/**
 * Make Admin Script
 * Creates or updates a user with admin/owner privileges
 * 
 * Usage: 
 *   node scripts/make-admin.js <email> <role> [firstName] [lastName] [password]
 * 
 * Examples:
 *   node scripts/make-admin.js admin@example.com OWNER
 *   node scripts/make-admin.js admin@example.com OWNER John Doe mypassword123
 */

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Usage: node scripts/make-admin.js <email> <role> [firstName] [lastName] [password]');
  console.error('   Roles: OWNER, ADMIN, USER');
  console.error('   Example: node scripts/make-admin.js admin@example.com OWNER John Doe mypassword');
  process.exit(1);
}

const email = args[0];
const role = args[1].toUpperCase();
let firstName = args[2] || null;
let lastName = args[3] || null;
let providedPassword = args[4] || null;

// Validate role
if (!['OWNER', 'ADMIN', 'USER'].includes(role)) {
  console.error('❌ Invalid role. Must be OWNER, ADMIN, or USER');
  process.exit(1);
}

// Create readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function makeAdmin() {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Update existing user
      let updateData = { role };
      
      // Update name if provided
      if (firstName && lastName) {
        updateData.name = `${firstName} ${lastName}`;
      } else if (firstName) {
        updateData.name = firstName;
      }
      
      const updatedUser = await prisma.user.update({
        where: { email },
        data: updateData
      });

      console.log(`✅ User role updated successfully!`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Role: ${updatedUser.role}`);
      console.log(`   Name: ${updatedUser.name}`);
    } else {
      // Interactive mode if name/password not provided
      if (!firstName) {
        console.log('\n📝 Creating new admin user...\n');
        firstName = await question('First Name: ');
      }
      if (!lastName) {
        lastName = await question('Last Name: ');
      }
      if (!providedPassword) {
        providedPassword = await question('Password (min 6 characters): ');
        
        // Validate password
        if (providedPassword.length < 6) {
          console.error('❌ Password must be at least 6 characters long');
          rl.close();
          await prisma.$disconnect();
          process.exit(1);
        }
      }

      const hashedPassword = await bcrypt.hash(providedPassword, 10);
      const fullName = `${firstName} ${lastName}`.trim();
      
      const newUser = await prisma.user.create({
        data: {
          email,
          name: fullName,
          password: hashedPassword,
          role
        }
      });

      console.log(`\n✅ User created successfully!`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Name: ${newUser.name}`);
      console.log(`   Role: ${newUser.role}`);
      console.log('');
      console.log('✓ You can now login with these credentials.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    await prisma.$disconnect();
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

makeAdmin();
