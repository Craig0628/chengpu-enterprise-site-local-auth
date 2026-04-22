/**
 * 文件名：useAuth.ts
 * 文件描述：认证状态管理 Hook
 * 功能：提供用户认证状态、登出等功能，集成 tRPC 进行服务端通信
 * 使用场景：React 组件中获取当前登录用户信息和执行登出操作
 */

import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

// 认证 Hook 的配置选项
type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;  // 未认证时是否自动重定向
  redirectPath?: string;                 // 重定向的目标路径
};

/**
 * 代码段作用：提供用户认证状态管理
 * 调用方法：const { user, loading, logout } = useAuth() 在 React 组件中使用
 * 返回值说明：
 *   - user: 当前登录用户信息 或 null
 *   - loading: 是否正在加载
 *   - logout: 异步登出函数
 *   - isAuthenticated: 是否已认证的布尔值
 * 示例：const { user, logout } = useAuth({ redirectOnUnauthenticated: true });
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/admin" } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  /**
   * 代码段作用：执行登出操作
   * 调用方法：await logout() 清除用户会话和本地缓存
   * 错误处理：如果服务端返回 UNAUTHORIZED 错误则忽略
   */
  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(meQuery.data)
    );
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
