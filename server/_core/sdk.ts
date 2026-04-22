/**
 * 文件名：sdk.ts
 * 文件描述：认证 SDK 核心模块
 * 功能：处理 JWT token 生成、验证、本地用户认证等，支持 OAuth 和本地认证两种方式
 * 调用方式：
 *   - 本地认证：sdk.authenticateLocalUser(email, password) -> { openId, name }
 *   - Token 创建：sdk.createSessionToken(openId) -> JWT token
 *   - Token 验证：sdk.verifySession(token) -> { openId, appId, name } 或 null
 *   - 用户认证：sdk.authenticateRequest(req) -> User 对象
 */

import { AXIOS_TIMEOUT_MS, COOKIE_NAME, ONE_YEAR_MS, SESSION_COOKIE_OPTIONS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import axios, { type AxiosInstance } from "axios";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import type {
  ExchangeTokenRequest,
  ExchangeTokenResponse,
  GetUserInfoResponse,
  GetUserInfoWithJwtRequest,
  GetUserInfoWithJwtResponse,
} from "./types/manusTypes";
// Utility function
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

const EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
const GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
const GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;

class OAuthService {
  constructor(private client: ReturnType<typeof axios.create>) {
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }

  private decodeState(state: string): string {
    const redirectUri = atob(state);
    return redirectUri;
  }

  async getTokenByCode(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    const payload: ExchangeTokenRequest = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state),
    };

    const { data } = await this.client.post<ExchangeTokenResponse>(
      EXCHANGE_TOKEN_PATH,
      payload
    );

    return data;
  }

  async getUserInfoByToken(
    token: ExchangeTokenResponse
  ): Promise<GetUserInfoResponse> {
    const { data } = await this.client.post<GetUserInfoResponse>(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken,
      }
    );

    return data;
  }
}

const createOAuthHttpClient = (): AxiosInstance =>
  axios.create({
    baseURL: ENV.oAuthServerUrl,
    timeout: AXIOS_TIMEOUT_MS,
  });

class SDKServer {
  private readonly client: AxiosInstance;
  private readonly oauthService: OAuthService;

  constructor(client: AxiosInstance = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }

  private deriveLoginMethod(
    platforms: unknown,
    fallback: string | null | undefined
  ): string | null {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set<string>(
      platforms.filter((p): p is string => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (
      set.has("REGISTERED_PLATFORM_MICROSOFT") ||
      set.has("REGISTERED_PLATFORM_AZURE")
    )
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }

  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    return this.oauthService.getTokenByCode(code, state);
  }

  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken: string): Promise<GetUserInfoResponse> {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken,
    } as ExchangeTokenResponse);
    const loginMethod = this.deriveLoginMethod(
      (data as any)?.platforms,
      (data as any)?.platform ?? data.platform ?? null
    );
    return {
      ...(data as any),
      platform: loginMethod,
      loginMethod,
    } as GetUserInfoResponse;
  }

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  /**
   * 代码段作用：获取会话密钥（转换为 Uint8Array 格式用于 JWT 签名）
   * 密钥来源：环境变量 JWT_SECRET
   */
  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }

  /**
   * 代码段作用：创建会话 token（JWT 格式）
   * 调用方法：await sdk.createSessionToken(user.openId, { name: "用户名" }) -> JWT token 字符串
   * 参数说明：
   *   - openId: 用户唯一标识
   *   - options.name: 可选，用户名
   *   - options.expiresInMs: 可选，过期时间（毫秒，默认 1 年）
   * 返回值：签名的 JWT token
   */
  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || "",
      },
      options
    );
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    console.log("[Auth] Creating JWT with payload:", {
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name,
    });

    const token = await new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);

    console.log("[Auth] JWT signed, token length:", token.length);
    return token;
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; appId: string; name: string } | null> {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }

    console.log("[Auth] Verifying session token, length:", cookieValue.length);

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      console.log("[Auth] JWT verified, payload:", payload);
      const { openId, appId, name } = payload as Record<string, unknown>;

      console.log("[Auth] Extracted fields:", { openId, appId, name });

      if (
        !isNonEmptyString(openId) ||
        !isNonEmptyString(appId) ||
        !isNonEmptyString(name)
      ) {
        console.warn("[Auth] Session payload missing required fields", {
          openId: isNonEmptyString(openId) ? "✓" : "✗",
          appId: isNonEmptyString(appId) ? "✓" : "✗",
          name: isNonEmptyString(name) ? "✓" : "✗",
        });
        return null;
      }

      return {
        openId,
        appId,
        name,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  async getUserInfoWithJwt(
    jwtToken: string
  ): Promise<GetUserInfoWithJwtResponse> {
    const payload: GetUserInfoWithJwtRequest = {
      jwtToken,
      projectId: ENV.appId,
    };

    const { data } = await this.client.post<GetUserInfoWithJwtResponse>(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );

    const loginMethod = this.deriveLoginMethod(
      (data as any)?.platforms,
      (data as any)?.platform ?? data.platform ?? null
    );
    return {
      ...(data as any),
      platform: loginMethod,
      loginMethod,
    } as GetUserInfoWithJwtResponse;
  }

  async authenticateRequest(req: Request): Promise<User> {
    // Regular authentication flow
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const sessionUserId = session.openId;
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(sessionUserId);

    // If user not in DB, sync from OAuth server automatically
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await db.upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt,
        });
        user = await db.getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }

    if (!user) {
      throw ForbiddenError("User not found");
    }

    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });

    return user;
  }

  /**
   * 代码段作用：本地认证（邮箱 + 密码登录）
   * 调用方法：await sdk.authenticateLocalUser(email, password, res) -> User 对象
   * 参数说明：
   *   - email: 用户邮箱
   *   - password: 用户密码（明文，会在服务端验证和加密比对）
   *   - res: Express Response 对象，用于设置 cookie
   * 返回值：认证成功的用户对象
   * 错误处理：验证失败时抛出 Error
   * 流程：
   *   1. 从数据库查询用户
   *   2. 验证本地认证是否启用和密码是否正确
   *   3. 生成 JWT token
   *   4. 设置 HttpOnly Cookie
   *   5. 更新用户最后登录时间
   */
  async authenticateLocalUser(
    email: string,
    password: string,
    res: import("express").Response
  ): Promise<User> {
    const { verifyPassword } = await import("./password");

    if (!email || !password) {
      console.log("[Auth] Missing email or password");
      throw new Error("Email and password are required");
    }

    const user = await db.getUserByEmail(email);
    console.log("[Auth] User lookup result:", user ? { id: user.id, email: user.email, isLocalAuthEnabled: user.isLocalAuthEnabled } : null);
    
    if (!user || !user.isLocalAuthEnabled || !user.passwordHash) {
      console.log("[Auth] User not found or not enabled for local auth");
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    console.log("[Auth] Password verification result:", isPasswordValid);
    
    if (!isPasswordValid) {
      console.log("[Auth] Password verification failed");
      throw new Error("Invalid email or password");
    }

    // Create session and set cookie
    const sessionToken = await this.createSessionToken(user.openId, { name: user.name || email });
    res.cookie(COOKIE_NAME, sessionToken, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: ONE_YEAR_MS, // 1 year
    });

    console.log("[Auth] Authentication successful, setting cookie");

    // Update last signed in
    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: new Date(),
    });

    return user;
  }
}

export const sdk = new SDKServer();
