/**
 * 文件名：password.ts
 * 文件描述：密码加密和验证模块
 * 功能：提供密码哈希、验证、临时密码生成等功能，使用 PBKDF2-SHA256 算法保证安全性
 */

import * as crypto from "crypto";

/**
 * 代码段作用：使用 PBKDF2-SHA256 算法对密码进行加密
 * 调用方法：hashPassword("用户输入的密码") 返回 Promise<string> 类型的加密后密码
 * 加密格式：salt$iterations$hash（以$分隔）
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
/**
 * 代码段作用：验证用户输入的密码是否与存储的哈希密码匹配
 * 调用方法：verifyPassword("用户输入密码", "数据库存储的密码哈希") 返回 Promise<boolean>
 * 注意：使用 timingSafeEqual 防止时序攻击
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
/**
 * 代码段作用：生成随机临时密码用于管理员初始化
 * 调用方法：generateTemporaryPassword() 返回指定长度的随机密码字符串
 * 默认长度：12 个字符
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
