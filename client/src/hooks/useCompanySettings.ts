import { useEffect, useState } from "react";

/**
 * 获取企业信息的 Hook
 * 从数据库获取企业联系信息：地址、电话、邮箱等
 */
export function useCompanySettings() {
  const [settings, setSettings] = useState<Record<string, string>>({
    name: "绍兴市顺丰聚氨酯有限公司",
    address: "浙江省绍兴市越城区孙端街道许家桥村7幢1楼",
    phone: "13567550208",
    email: "sxsfjaz@126.com",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/trpc/company.getSettings');
        if (response.ok) {
          const data = await response.json();
          // tRPC 返回结果在 result 字段中
          if (data.result?.data) {
            setSettings(prev => ({ ...prev, ...data.result.data }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch company settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading };
}
