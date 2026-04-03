const crypto = require("crypto");

const password = "Admin@12345";
const salt = crypto.randomBytes(16).toString("hex");

crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
  if (err) throw err;
  const hash = salt + ":" + derivedKey.toString("hex");
  console.log("Password Hash:");
  console.log(hash);
  console.log("\n\nMySQL INSERT Statement:");
  console.log(
    `INSERT INTO users (id, email, password, name, role, isActive, createdAt, updatedAt) VALUES (UUID(), 'admin@example.com', '${hash}', 'Admin User', 'admin', 1, NOW(), NOW());`,
  );
});
