#!/usr/bin/env node
/**
 * Generate secure secrets for Report Builder
 * Requires: Node.js
 */

const crypto = require("crypto");

console.log("\n🔐 Report Builder - Secret Generator\n");

// Generate JWT_SECRET (32 chars base64)
const jwtBuffer = crypto.randomBytes(32);
const JWT_SECRET = jwtBuffer.toString("base64");

// Generate ENCRYPTION_KEY (64 hex chars - 32 bytes in hex)
const encryptionBuffer = crypto.randomBytes(32);
const ENCRYPTION_KEY = encryptionBuffer.toString("hex");

console.log("✅ JWT_SECRET (32 bytes, base64):");
console.log(`   ${JWT_SECRET}\n`);

console.log("✅ ENCRYPTION_KEY (32 bytes, hex):");
console.log(`   ${ENCRYPTION_KEY}\n`);

console.log("====================================");
console.log("📋 Copy these values to your .env.local:\n");

console.log(`JWT_SECRET=${JWT_SECRET}`);
console.log(`ENCRYPTION_KEY=${ENCRYPTION_KEY}\n`);
