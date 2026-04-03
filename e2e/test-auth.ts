import fs from "fs";
import path from "path";
import { SignJWT } from "jose";

type TestRole = "admin" | "viewer";

function readEnvValue(name: string): string {
  for (const envFile of [".env.local", ".env"]) {
    const filePath = path.resolve(process.cwd(), envFile);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const line = fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .find((entry) => entry.startsWith(`${name}=`));

    if (line) {
      return line
        .slice(name.length + 1)
        .trim()
        .replace(/^"|"$/g, "");
    }
  }

  throw new Error(`Missing ${name} in .env.local or .env`);
}

export async function createTestAccessToken(
  role: TestRole = "admin",
): Promise<string> {
  const secret = readEnvValue("JWT_SECRET");
  const secretKey = new TextEncoder().encode(secret);
  const now = Math.floor(Date.now() / 1000);

  const userId = role === "admin" ? "admin-test-user" : "viewer-test-user";
  const email = role === "admin" ? "admin@example.com" : "viewer@example.com";
  const name = role === "admin" ? "Admin User" : "Viewer User";

  return new SignJWT({ userId, email, name, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime("8h")
    .sign(secretKey);
}
