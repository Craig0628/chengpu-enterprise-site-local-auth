/**
 * 文件名：env.ts
 * 文件描述：环境变量管理模块
 * 功能：统一管理应用的所有环境变量，包括数据库连接、JWT密钥、OAuth配置等
 * 调用方式：import { ENV } from "./env"; 然后使用 ENV.appId、ENV.databaseUrl 等
 */

import { config } from "dotenv";
// 加载 .env.local 文件中的环境变量
config({ path: ".env.local" });

/**
 * 应用环境变量对象
 * 包含数据库连接、认证、OAuth等关键配置
 */
export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "default_development_secret_key_please_change_in_production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
