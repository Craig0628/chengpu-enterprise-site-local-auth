import * as crypto from "crypto";

/**
 * Hash a password using PBKDF2
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(32).toString("hex");
  const iterations = 100000;
  const keylen = 64;
  const digest = "sha256";

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derived) => {
      if (err) reject(err);
      const hash = derived.toString("hex");
      // Format: salt$iterations$hash
      resolve(`${salt}$${iterations}$${hash}`);
    });
  });
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  try {
    const parts = passwordHash.split("$");
    if (parts.length !== 3) {
      console.warn("[Password] Invalid password hash format");
      return false;
    }

    const [salt, iterationsStr, originalHash] = parts;
    const iterations = parseInt(iterationsStr, 10);

    if (!Number.isFinite(iterations) || iterations <= 0) {
      console.warn("[Password] Invalid iterations value");
      return false;
    }

    const keylen = 64;
    const digest = "sha256";

    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derived) => {
        if (err) {
          reject(err);
          return;
        }

        const hash = derived.toString("hex");
        // Use timing-safe comparison to prevent timing attacks
        const isMatch = crypto.timingSafeEqual(
          Buffer.from(hash),
          Buffer.from(originalHash)
        );
        resolve(isMatch);
      });
    });
  } catch (error) {
    console.error("[Password] Verification error:", error);
    return false;
  }
}

/**
 * Generate a random temporary password for admin setup
 */
export function generateTemporaryPassword(length: number = 12): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let result = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}
