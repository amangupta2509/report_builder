import {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateSecureToken,
} from "@/lib/encryption";

describe("Encryption Utilities", () => {
  describe("encrypt and decrypt", () => {
    it("should encrypt and decrypt text correctly", async () => {
      const originalText = "This is a secret message";
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(originalText);
      expect(encrypted).not.toBe(originalText);
    });

    it("should produce different ciphertext for same plaintext", () => {
      const text = "Same message";
      const encrypted1 = encrypt(text);
      const encrypted2 = encrypt(text);

      expect(encrypted1).not.toBe(encrypted2); // Different due to random IV and salt
      expect(decrypt(encrypted1)).toBe(text);
      expect(decrypt(encrypted2)).toBe(text);
    });

    it("should handle empty strings", () => {
      const encrypted = encrypt("");
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe("");
    });

    it("should handle special characters and Unicode", () => {
      const text = "🔒 Special chars: !@#$%^&*()_+ 中文 العربية";
      const encrypted = encrypt(text);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(text);
    });

    it("should handle long text", () => {
      const longText = "A".repeat(10000);
      const encrypted = encrypt(longText);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(longText);
    });

    it("should throw error on invalid encrypted data", () => {
      expect(() => decrypt("invalid-data")).toThrow();
    });

    it("should throw error on corrupted encrypted data", () => {
      const text = "Secret message";
      const encrypted = encrypt(text);
      const corrupted =
        encrypted.substring(0, encrypted.length - 10) + "corrupted";

      expect(() => decrypt(corrupted)).toThrow();
    });
  });

  describe("hashPassword and verifyPassword", () => {
    it("should hash password correctly", async () => {
      const password = "MySecurePassword123!";
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash).toContain(":"); // Should contain salt:hash format
    });

    it("should verify correct password", async () => {
      const password = "MySecurePassword123!";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "CorrectPassword123!";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword("WrongPassword456!", hash);

      expect(isValid).toBe(false);
    });

    it("should produce different hashes for same password", async () => {
      const password = "SamePassword123!";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different due to random salt
    });

    it("should handle long passwords", async () => {
      const longPassword = "P".repeat(1000);
      const hash = await hashPassword(longPassword);
      const isValid = await verifyPassword(longPassword, hash);

      expect(isValid).toBe(true);
    });

    it("should be case-sensitive", async () => {
      const password = "CaseSensitive123!";
      const hash = await hashPassword(password);

      const lowerCase = await verifyPassword("casesensitive123!", hash);
      const upperCase = await verifyPassword("CASESENSITIVE123!", hash);

      expect(lowerCase).toBe(false);
      expect(upperCase).toBe(false);
    });
  });

  describe("generateSecureToken", () => {
    it("should generate a token", () => {
      const token = generateSecureToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate different tokens", () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();

      expect(token1).not.toBe(token2);
    });

    it("should generate URL-safe tokens", () => {
      const token = generateSecureToken();
      // Base64url is URL-safe (no + or /)
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("should generate tokens of consistent length", () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      const token3 = generateSecureToken();

      expect(token1.length).toBe(token2.length);
      expect(token2.length).toBe(token3.length);
    });
  });
});
