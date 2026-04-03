// scripts/create-admin.js
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const readline = require("readline");

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

async function createAdmin() {
  try {
    console.log("\n=== Create Admin Credential ===\n");

    const email = await question("Enter admin email: ");
    const name = await question("Enter admin name: ");
    const password = await question("Enter password (min 8 characters): ");

    // Validate inputs
    if (!email || !name || !password) {
      console.error("❌ All fields are required");
      process.exit(1);
    }

    if (password.length < 8) {
      console.error("❌ Password must be at least 8 characters");
      process.exit(1);
    }

    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.error(`❌ User with email "${email}" already exists`);
      process.exit(1);
    }

    // Hash password
    console.log("\n🔐 Hashing password...");
    const hashedPassword = await hashPassword(password);

    // Create admin user
    console.log("📝 Creating admin user...");
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      },
    });

    console.log("\n✅ Admin credential created successfully!\n");
    console.log("User Details:");
    console.log(`  ID:    ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name:  ${user.name}`);
    console.log(`  Role:  ${user.role}`);
    console.log(`  Active: ${user.isActive}\n`);

    rl.close();
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    rl.close();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
