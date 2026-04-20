import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { hashPassword, verifyPassword, generateTemporaryPassword } from "../_core/password";

describe("Local Authentication - Password Functions", () => {
  describe("hashPassword", () => {
    it("should hash a password correctly", async () => {
      const password = "testPassword123!";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).toContain("$");
      // Format: salt$iterations$hash
      const parts = hash.split("$");
      expect(parts).toHaveLength(3);
    });

    it("should generate different hashes for the same password", async () => {
      const password = "testPassword123!";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "testPassword123!";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "testPassword123!";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword("wrongPassword", hash);
      expect(isValid).toBe(false);
    });

    it("should reject malformed hash", async () => {
      const password = "testPassword123!";
      const invalidHash = "invalid_hash_format";

      const isValid = await verifyPassword(password, invalidHash);
      expect(isValid).toBe(false);
    });

    it("should handle empty password", async () => {
      const hash = await hashPassword("testPassword123!");

      const isValid = await verifyPassword("", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("generateTemporaryPassword", () => {
    it("should generate a temporary password", () => {
      const password = generateTemporaryPassword();

      expect(password).toBeDefined();
      expect(typeof password).toBe("string");
      expect(password.length).toBe(12);
    });

    it("should generate password of custom length", () => {
      const length = 20;
      const password = generateTemporaryPassword(length);

      expect(password.length).toBe(length);
    });

    it("should generate different passwords each time", () => {
      const password1 = generateTemporaryPassword();
      const password2 = generateTemporaryPassword();

      expect(password1).not.toBe(password2);
    });
  });

  describe("Integration Tests", () => {
    it("should handle password update flow", async () => {
      const originalPassword = "originalPassword123!";
      const newPassword = "newPassword456!";

      // Hash original password
      const originalHash = await hashPassword(originalPassword);
      expect(await verifyPassword(originalPassword, originalHash)).toBe(true);
      expect(await verifyPassword(newPassword, originalHash)).toBe(false);

      // Hash new password
      const newHash = await hashPassword(newPassword);
      expect(await verifyPassword(newPassword, newHash)).toBe(true);
      expect(await verifyPassword(originalPassword, newHash)).toBe(false);
    });

    it("should handle multiple concurrent hashing", async () => {
      const passwords = [
        "password1!",
        "password2!",
        "password3!",
        "password4!",
      ];

      const hashes = await Promise.all(
        passwords.map(p => hashPassword(p))
      );

      expect(hashes).toHaveLength(4);
      expect(new Set(hashes).size).toBe(4); // All hashes should be unique

      // Verify all passwords
      for (let i = 0; i < passwords.length; i++) {
        const isValid = await verifyPassword(passwords[i], hashes[i]);
        expect(isValid).toBe(true);

        // Cross verify with other hashes (should fail)
        for (let j = 0; j < hashes.length; j++) {
          if (i !== j) {
            const isValid = await verifyPassword(passwords[i], hashes[j]);
            expect(isValid).toBe(false);
          }
        }
      }
    });
  });

  describe("Security Tests", () => {
    it("should use secure iteration count", async () => {
      const password = "testPassword123!";
      const hash = await hashPassword(password);

      const [, iterationsStr] = hash.split("$");
      const iterations = parseInt(iterationsStr, 10);

      // Should use at least 100,000 iterations for PBKDF2
      expect(iterations).toBeGreaterThanOrEqual(100000);
    });

    it("should use adequate salt length", async () => {
      const password = "testPassword123!";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      const [salt1] = hash1.split("$");
      const [salt2] = hash2.split("$");

      // Salt should be hex string (32 bytes = 64 hex chars)
      expect(salt1).toMatch(/^[0-9a-f]{64}$/);
      expect(salt2).toMatch(/^[0-9a-f]{64}$/);
      expect(salt1).not.toBe(salt2);
    });
  });
});
