import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { BarChart3, Bold, Heading2, ImageUp, Italic, Layers3, Link2, List, ListOrdered, Newspaper, Package2, Shield, Users } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const menuItems = [
  { key: "dashboard", label: "仪表盘", icon: <BarChart3 className="h-4 w-4" /> },
  { key: "news", label: "新闻管理", icon: <Newspaper className="h-4 w-4" /> },
  { key: "products", label: "产品管理", icon: <Package2 className="h-4 w-4" /> },
  { key: "applications", label: "产品应用", icon: <Layers3 className="h-4 w-4" /> },
  { key: "banners", label: "Banner 管理", icon: <ImageUp className="h-4 w-4" /> },
  { key: "categories", label: "分类管理", icon: <Layers3 className="h-4 w-4" /> },
  { key: "users", label: "管理员管理", icon: <Users className="h-4 w-4" /> },
];

const emptyNewsForm = {
  title: "",
  slug: "",
  summary: "",
  content: "<p></p>",
  coverImage: "",
  isPublished: true,
};

const emptyProductForm = {
  categoryId: "",
  name: "",
  slug: "",
  excerpt: "",
  description: "",
  parameters: '[{"label":"规格","value":""}]',
  coverImage: "",
  gallery: "[]",
  isFeatured: true,
  isPublished: true,
};

const emptyBannerForm = {
  title: "",
  subtitle: "",
  imageUrl: "",
  ctaLabel: "了解更多",
  ctaLink: "/products",
  isActive: true,
};

const emptyCategoryForm = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
  level: "1",
};

const emptyApplicationForm = {
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  icon: "",
  sortOrder: 0,
  isActive: true,
};

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [htmlMode, setHtmlMode] = useState(false);

  useEffect(() => {
    if (!editorRef.current || htmlMode) return;
    if (editorRef.current.innerHTML === value) return;
    editorRef.current.innerHTML = value || "<p></p>";
  }, [value, htmlMode]);

  function syncEditor() {
    onChange(editorRef.current?.innerHTML || "<p></p>");
  }

  function run(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    syncEditor();
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => run("bold")}><Bold className="mr-1 h-4 w-4" />加粗</Button>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => run("italic")}><Italic className="mr-1 h-4 w-4" />斜体</Button>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => run("formatBlock", "<h2>")}><Heading2 className="mr-1 h-4 w-4" />标题</Button>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => run("insertUnorderedList")}><List className="mr-1 h-4 w-4" />无序列表</Button>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => run("insertOrderedList")}><ListOrdered className="mr-1 h-4 w-4" />有序列表</Button>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => { const url = window.prompt("请输入链接地址", "https://"); if (url) run("createLink", url); }}><Link2 className="mr-1 h-4 w-4" />链接</Button>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setHtmlMode(current => !current)}>{htmlMode ? "返回可视化" : "查看 HTML"}</Button>
        </div>
        {htmlMode ? (
          <Textarea value={value} onChange={e => onChange(e.target.value)} className="min-h-[220px] border-0 bg-slate-50 font-mono text-sm" />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncEditor}
            className="prose prose-slate min-h-[260px] max-w-none rounded-2xl bg-slate-50 p-4 outline-none"
          />
        )}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">预览</p>
        <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: value || "<p>暂无内容</p>" }} />
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) {
    const anyError = error as any;

    if (anyError.data?.zodError) {
      const fieldErrors = anyError.data.zodError.fieldErrors;
      const messages = Object.values(fieldErrors).flat().filter(Boolean) as string[];
      if (messages.length > 0) return messages[0];
      const formErrors = anyError.data.zodError.formErrors?.flat().filter(Boolean) as string[];
      if (formErrors?.length) return formErrors[0];
    }

    if (typeof anyError.message === "string") {
      const message = anyError.message;

      if (message.includes("Failed query:")) {
        if (/Duplicate entry/.test(message)) {
          return "操作失败：存在重复项，请检查 slug 或其他唯一字段。";
        }
        if (/foreign key constraint/.test(message) || /Cannot add or update a child row/.test(message)) {
          return "操作失败：关联数据不存在，请检查分类或其他关联字段。";
        }
        return "操作失败：数据库写入失败，请检查输入后重试。";
      }

      try {
        const parsed = JSON.parse(message);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.message) {
          return parsed[0].message;
        }
      } catch {
        // ignore parse failures
      }
      return message;
    }
  }
  if (error && typeof error === "object") {
    const anyError = error as any;
    if (typeof anyError.message === "string") return anyError.message;
    if (Array.isArray(anyError) && anyError[0]?.message) return anyError[0].message;
  }
  return "创建失败，请检查输入后重试。";
}

export default function AdminPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [activeKey, setActiveKey] = useState("dashboard");
  const [newsForm, setNewsForm] = useState(emptyNewsForm);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [bannerForm, setBannerForm] = useState(emptyBannerForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [applicationForm, setApplicationForm] = useState(emptyApplicationForm);
  const [editingApplicationId, setEditingApplicationId] = useState<number | null>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"user" | "admin">("admin");
  const [newUserError, setNewUserError] = useState<string | null>(null);

  const dashboardQuery = trpc.admin.dashboard.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const usersQuery = trpc.admin.users.useQuery(undefined, { enabled: user?.role === "admin", retry: false, refetchOnWindowFocus: false });
  const newsQuery = trpc.admin.news.useQuery({ page: 1, pageSize: 10 }, { enabled: Boolean(user), retry: false, refetchOnWindowFocus: false });
  const productsQuery = trpc.admin.products.useQuery(undefined, { enabled: Boolean(user), retry: false, refetchOnWindowFocus: false });
  const bannersQuery = trpc.admin.banners.useQuery(undefined, { enabled: Boolean(user), retry: false, refetchOnWindowFocus: false });
  const categoriesQuery = trpc.admin.categories.useQuery(undefined, { enabled: Boolean(user), retry: false, refetchOnWindowFocus: false });
  const applicationsQuery = trpc.admin.applications.useQuery(undefined, { enabled: Boolean(user), retry: false, refetchOnWindowFocus: false });

  const createNewsMutation = trpc.admin.createNews.useMutation({ onSuccess: async () => {
      toast.success("新闻已发布");
      setNewsForm(emptyNewsForm);
      setEditingNewsId(null);
      try {
        await utils.admin.news.invalidate();
        await utils.site.news.invalidate();
      } catch (error) {
        console.error("News invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const updateNewsMutation = trpc.admin.updateNews.useMutation({ onSuccess: async () => {
      toast.success("新闻已更新");
      setNewsForm(emptyNewsForm);
      setEditingNewsId(null);
      try {
        await utils.admin.news.invalidate();
        await utils.site.news.invalidate();
      } catch (error) {
        console.error("News invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const deleteNewsMutation = trpc.admin.deleteNews.useMutation({ onSuccess: async () => {
      toast.success("新闻已删除");
      try {
        await utils.admin.news.invalidate();
        await utils.site.news.invalidate();
      } catch (error) {
        console.error("News invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const createProductMutation = trpc.admin.createProduct.useMutation({ onSuccess: async () => {
      toast.success("产品已保存");
      setProductForm(emptyProductForm);
      setEditingProductId(null);
      try {
        await utils.admin.products.invalidate();
        await utils.site.products.invalidate();
      } catch (error) {
        console.error("Product invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const updateProductMutation = trpc.admin.updateProduct.useMutation({ onSuccess: async () => {
      toast.success("产品已更新");
      setProductForm(emptyProductForm);
      setEditingProductId(null);
      try {
        await utils.admin.products.invalidate();
        await utils.site.products.invalidate();
      } catch (error) {
        console.error("Product invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const deleteProductMutation = trpc.admin.deleteProduct.useMutation({ onSuccess: async () => {
      toast.success("产品已删除");
      try {
        await utils.admin.products.invalidate();
        await utils.site.products.invalidate();
      } catch (error) {
        console.error("Product invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const createBannerMutation = trpc.admin.createBanner.useMutation({ onSuccess: async () => {
      toast.success("Banner 已新增");
      setBannerForm(emptyBannerForm);
      setEditingBannerId(null);
      try {
        await utils.admin.banners.invalidate();
        await utils.site.home.invalidate();
      } catch (error) {
        console.error("Banner invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const updateBannerMutation = trpc.admin.updateBanner.useMutation({ onSuccess: async () => {
      toast.success("Banner 已更新");
      setBannerForm(emptyBannerForm);
      setEditingBannerId(null);
      try {
        await utils.admin.banners.invalidate();
        await utils.site.home.invalidate();
      } catch (error) {
        console.error("Banner invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const deleteBannerMutation = trpc.admin.deleteBanner.useMutation({ onSuccess: async () => {
      toast.success("Banner 已删除");
      try {
        await utils.admin.banners.invalidate();
        await utils.site.home.invalidate();
      } catch (error) {
        console.error("Banner invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const createCategoryMutation = trpc.admin.createCategory.useMutation({ onSuccess: async () => {
      toast.success("分类已新增");
      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      try {
        await utils.admin.categories.invalidate();
        await utils.site.categories.invalidate();
      } catch (error) {
        console.error("Category invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const updateCategoryMutation = trpc.admin.updateCategory.useMutation({ onSuccess: async () => {
      toast.success("分类已更新");
      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      try {
        await utils.admin.categories.invalidate();
        await utils.site.categories.invalidate();
      } catch (error) {
        console.error("Category invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const deleteCategoryMutation = trpc.admin.deleteCategory.useMutation({ onSuccess: async () => {
      toast.success("分类已删除");
      try {
        await utils.admin.categories.invalidate();
        await utils.site.categories.invalidate();
      } catch (error) {
        console.error("Category invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const createApplicationMutation = trpc.admin.createApplication.useMutation({ onSuccess: async () => {
      toast.success("应用已新增");
      setApplicationForm(emptyApplicationForm);
      setEditingApplicationId(null);
      try {
        await utils.admin.applications.invalidate();
        await utils.site.applications.invalidate();
      } catch (error) {
        console.error("Application invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const updateApplicationMutation = trpc.admin.updateApplication.useMutation({ onSuccess: async () => {
      toast.success("应用已更新");
      setApplicationForm(emptyApplicationForm);
      setEditingApplicationId(null);
      try {
        await utils.admin.applications.invalidate();
        await utils.site.applications.invalidate();
      } catch (error) {
        console.error("Application invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const deleteApplicationMutation = trpc.admin.deleteApplication.useMutation({ onSuccess: async () => {
      toast.success("应用已删除");
      try {
        await utils.admin.applications.invalidate();
        await utils.site.applications.invalidate();
      } catch (error) {
        console.error("Application invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const updateUserRoleMutation = trpc.admin.updateUserRole.useMutation({ onSuccess: async () => { toast.success("角色已更新"); await utils.admin.users.invalidate(); } });
  const deleteLocalUserMutation = trpc.admin.deleteLocalUser.useMutation({ onSuccess: async () => {
      toast.success("管理员已删除");
      try {
        await utils.admin.users.invalidate();
      } catch (error) {
        console.error("User invalidate failed", error);
      }
    }, onError: error => { toast.error(getErrorMessage(error)); } });
  const registerLocalUserMutation = trpc.auth.localRegister.useMutation({
    onSuccess: async () => {
      toast.success("本地账户已创建");
      setNewUserEmail("");
      setNewUserName("");
      setNewUserPassword("");
      setNewUserConfirmPassword("");
      setNewUserRole("admin");
      setNewUserError(null);
      setIsCreateUserOpen(false);
      await utils.auth.listLocalUsers.invalidate();
      await utils.admin.users.invalidate();
    },
    onError: (error) => {
      setNewUserError(getErrorMessage(error));
    },
  });
  const uploadImageMutation = trpc.admin.uploadImage.useMutation();

  const metrics = dashboardQuery.data?.metrics;
  const categories = categoriesQuery.data || [];
  const isAdmin = user?.role === "admin";

  async function uploadImage(event: ChangeEvent<HTMLInputElement>, cb: (url: string) => void) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const base64Data = await fileToBase64(file);
      const result = await uploadImageMutation.mutateAsync({
        fileName: file.name,
        contentType: file.type || "image/png",
        base64Data,
      });
      cb(result.url);
      toast.success("图片已上传至 S3/CDN");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "图片上传失败");
    }
  }

  const statistics = useMemo(
    () => [
      { label: "产品总数", value: metrics?.products ?? 0 },
      { label: "新闻总数", value: metrics?.news ?? 0 },
      { label: "Banner 总数", value: metrics?.banners ?? 0 },
      { label: "当前角色", value: user?.role ?? "-" },
    ],
    [metrics, user?.role],
  );

  const visibleMenuItems = isAdmin ? menuItems : menuItems.filter(item => item.key === "dashboard");
  const canManageContent = isAdmin;

  function validateJsonText(value: string, fieldLabel: string) {
    try {
      JSON.parse(value);
      return true;
    } catch {
      toast.error(`${fieldLabel} 需要是合法 JSON`);
      return false;
    }
  }

  function ensureRequired(value: string, label: string) {
    if (value.trim()) return true;
    toast.error(`${label}不能为空`);
    return false;
  }

  return (
    <DashboardLayout
      title="企业官网后台管理"
      description="统一维护产品、新闻、Banner、分类与管理员权限。"
      menuItems={visibleMenuItems}
      activeKey={activeKey}
      onSelect={setActiveKey}
    >
      {!isAdmin && activeKey !== "dashboard" ? (
        <Card className="rounded-[1.8rem] border-slate-200 shadow-none">
          <CardHeader><CardTitle>无权限访问该模块</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
            <p>当前账号角色为 user，仅允许访问后台概览。新闻、产品、Banner、分类与管理员管理模块仅对 admin 开放。</p>
            <Button className="rounded-full bg-sky-700 px-6 hover:bg-sky-800" onClick={() => setActiveKey("dashboard")}>返回仪表盘</Button>
          </CardContent>
        </Card>
      ) : null}
      {activeKey === "dashboard" ? (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {statistics.map(item => (
              <Card key={item.label} className="rounded-[1.6rem] border-slate-200 shadow-none">
                <CardContent className="space-y-3 p-6">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="text-3xl font-semibold text-slate-950">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="rounded-[1.8rem] border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>后台概览</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
              <p>该后台入口受登录保护，并通过角色区分 admin 与 user。admin 具备内容发布、图片上传和用户角色管理能力，user 可以登录查看后台概况，但不具备敏感操作权限。</p>
              <p>图片上传统一使用本地静态存储，存入/client/public/images/enterprise-site目录下。</p>
              {/* <p>图片上传统一写入 S3，并返回 CDN 链接供官网与后台复用，不使用本地静态存储。</p> */}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeKey === "news" ? (
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <Card className="rounded-[1.8rem] border-slate-200 shadow-none">
            <CardHeader><CardTitle>发布新闻</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="新闻标题" value={newsForm.title} onChange={e => setNewsForm(current => ({ ...current, title: e.target.value }))} />
              <Input placeholder="唯一 slug，例如 company-update" value={newsForm.slug} onChange={e => setNewsForm(current => ({ ...current, slug: e.target.value }))} />
              <Textarea placeholder="新闻摘要" value={newsForm.summary} onChange={e => setNewsForm(current => ({ ...current, summary: e.target.value }))} />
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">封面图片</p>
                <Input placeholder="封面图片 URL" value={newsForm.coverImage} onChange={e => setNewsForm(current => ({ ...current, coverImage: e.target.value }))} />
                <Input type="file" accept="image/*" onChange={e => uploadImage(e, url => setNewsForm(current => ({ ...current, coverImage: url })))} />
              </div>
              <RichTextEditor value={newsForm.content} onChange={value => setNewsForm(current => ({ ...current, content: value }))} />
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-full bg-sky-700 px-6 hover:bg-sky-800" disabled={!canManageContent || createNewsMutation.isPending || updateNewsMutation.isPending} onClick={() => {
                  if (!ensureRequired(newsForm.title, "新闻标题") || !ensureRequired(newsForm.slug, "新闻 slug")) return;
                  editingNewsId ? updateNewsMutation.mutate({ id: editingNewsId, ...newsForm }) : createNewsMutation.mutate(newsForm);
                }}>
                  {editingNewsId ? "更新新闻" : "发布新闻"}
                </Button>
                {editingNewsId ? <Button type="button" variant="outline" className="rounded-full" onClick={() => { setEditingNewsId(null); setNewsForm(emptyNewsForm); }}>取消编辑</Button> : null}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[1.8rem] border-slate-200 shadow-none">
            <CardHeader><CardTitle>新闻列表</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(newsQuery.data?.items || []).map(item => (
                <div key={item.id} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-2 text-sm text-slate-500">slug: {item.slug}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="rounded-full" disabled={!canManageContent} onClick={() => { setEditingNewsId(item.id); setNewsForm({ title: item.title, slug: item.slug, summary: item.summary || "", content: item.content || "<p></p>", coverImage: item.coverImage || "", isPublished: item.isPublished }); }}>编辑</Button>
                      <Button variant="outline" className="rounded-full" disabled={!canManageContent} onClick={() => deleteNewsMutation.mutate({ id: item.id })}>删除</Button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeKey === "products" ? (
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <Card className="rounded-[1.8rem] border-slate-200 shadow-none">
            <CardHeader><CardTitle>新增产品</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="产品名称" value={productForm.name} onChange={e => setProductForm(current => ({ ...current, name: e.target.value }))} />
              <Input placeholder="唯一 slug，例如 pu-cold-room-board" value={productForm.slug} onChange={e => setProductForm(current => ({ ...current, slug: e.target.value }))} />
              <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={productForm.categoryId} onChange={e => setProductForm(current => ({ ...current, categoryId: e.target.value }))}>
                <option value="">选择分类</option>
                {categories.map(item => <option key={item.id} value={String(item.id)}>{item.name}</option>)}
              </select>
              <Textarea placeholder="产品亮点摘要" value={productForm.excerpt} onChange={e => setProductForm(current => ({ ...current, excerpt: e.target.value }))} />
              <Textarea placeholder="产品详细描述" value={productForm.description} onChange={e => setProductForm(current => ({ ...current, description: e.target.value }))} />
              <Textarea placeholder='参数 JSON，例如 [{"label":"规格","value":"50mm"}]' value={productForm.parameters} onChange={e => setProductForm(current => ({ ...current, parameters: e.target.value }))} />
              <div className="space-y-2">
                <Input placeholder="封面图片 URL" value={productForm.coverImage} onChange={e => setProductForm(current => ({ ...current, coverImage: e.target.value }))} />
                <Input type="file" accept="image/*" onChange={e => uploadImage(e, url => setProductForm(current => ({ ...current, coverImage: url })))} />
              </div>
              <Textarea placeholder='相册 JSON，例如 ["https://..."]' value={productForm.gallery} onChange={e => setProductForm(current => ({ ...current, gallery: e.target.value }))} />
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-full bg-sky-700 px-6 hover:bg-sky-800" disabled={!canManageContent || createProductMutation.isPending || updateProductMutation.isPending || !productForm.categoryId} onClick={() => {
                  if (!ensureRequired(productForm.name, "产品名称") || !ensureRequired(productForm.slug, "产品 slug")) return;
                  if (!validateJsonText(productForm.parameters, "产品参数") || !validateJsonText(productForm.gallery, "产品相册")) return;
                  editingProductId ? updateProductMutation.mutate({ id: editingProductId, ...productForm, categoryId: Number(productForm.categoryId) }) : createProductMutation.mutate({ ...productForm, categoryId: Number(productForm.categoryId) });
                }}>
                  {editingProductId ? "更新产品" : "保存产品"}
                </Button>
                {editingProductId ? <Button type="button" variant="outline" className="rounded-full" onClick={() => { setEditingProductId(null); setProductForm(emptyProductForm); }}>取消编辑</Button> : null}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[1.8rem] border-slate-200 shadow-none">
            <CardHeader><CardTitle>产品列表</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(productsQuery.data || []).map(item => (
                <div key={item.id} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{item.name}</p>
                      <p className="mt-2 text-sm text-slate-500">{item.categoryName || "未分类"} · {item.slug}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="rounded-full" disabled={!canManageContent} onClick={() => { setEditingProductId(item.id); setProductForm({ categoryId: String(item.categoryId), name: item.name, slug: item.slug, excerpt: item.excerpt || "", description: item.description || "", parameters: item.parameters || "[]", coverImage: item.coverImage || "", gallery: item.gallery || "[]", isFeatured: item.isFeatured ?? true, isPublished: item.isPublished ?? true }); }}>编辑</Button>
                      <Button variant="outline" className="rounded-full" disabled={!canManageContent} onClick={() => deleteProductMutation.mutate({ id: item.id })}>删除</Button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.excerpt || item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeKey === "banners" ? (
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <Card className="rounded-[1.8rem] border-slate-200 shadow-none">
            <CardHeader><CardTitle>新增 Banner</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="主标题" value={bannerForm.title} onChange={e => setBannerForm(current => ({ ...current, title: e.target.value }))} />
              <Textarea placeholder="副标题" value={bannerForm.subtitle} onChange={e => setBannerForm(current => ({ ...current, subtitle: e.target.value }))} />
              <Input placeholder="按钮文案" value={bannerForm.ctaLabel} onChange={e => setBannerForm(current => ({ ...current, ctaLabel: e.target.value }))} />
              <Input placeholder="按钮链接，例如 /products" value={bannerForm.ctaLink} onChange={e => setBannerForm(current => ({ ...current, ctaLink: e.target.value }))} />
              <div className="space-y-2">
                <Input placeholder="Banner 图片 URL" value={bannerForm.imageUrl} onChange={e => setBannerForm(current => ({ ...current, imageUrl: e.target.value }))} />
                <Input type="file" accept="image/*" onChange={e => uploadImage(e, url => setBannerForm(current => ({ ...current, imageUrl: url })))} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-full bg-sky-700 px-6 hover:bg-sky-800" disabled={!canManageContent || createBannerMutation.isPending || updateBannerMutation.isPending || !bannerForm.imageUrl} onClick={() => {
                  if (!ensureRequired(bannerForm.title, "Banner 标题") || !ensureRequired(bannerForm.imageUrl, "Banner 图片")) return;
                  editingBannerId ? updateBannerMutation.mutate({ id: editingBannerId, ...bannerForm }) : createBannerMutation.mutate(bannerForm);
                }}>
                  {editingBannerId ? "更新 Banner" : "保存 Banner"}
                </Button>
                {editingBannerId ? <Button type="button" variant="outline" className="rounded-full" onClick={() => { setEditingBannerId(null); setBannerForm(emptyBannerForm); }}>取消编辑</Button> : null}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[1.8rem] border-slate-200 shadow-none">
            <CardHeader><CardTitle>Banner 列表</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(bannersQuery.data || []).map(item => (
                <div key={item.id} className="grid gap-4 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[160px_1fr_auto] md:items-center">
                  <img src={item.imageUrl} alt={item.title} className="h-24 w-full rounded-xl object-cover" />
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-600">{item.subtitle}</p>
                  </div>
                  <div className="flex flex-col gap-3 md:items-end">
                    <Button variant="outline" className="rounded-full" disabled={!canManageContent} onClick={() => { setEditingBannerId(item.id); setBannerForm({ title: item.title, subtitle: item.subtitle || "", imageUrl: item.imageUrl, ctaLabel: item.ctaLabel || "", ctaLink: item.ctaLink || "", isActive: item.isActive }); }}>编辑</Button>
                    <Button variant="outline" className="rounded-full" disabled={!canManageContent} onClick={() => deleteBannerMutation.mutate({ id: item.id })}>删除</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeKey === "categories" ? (
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <Card className="rounded-[1.8rem] border-slate-200 shadow-none">
            <CardHeader><CardTitle>新增分类</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="分类名称" value={categoryForm.name} onChange={e => setCategoryForm(current => ({ ...current, name: e.target.value }))} />
              <Input placeholder="唯一 slug，例如 insulation-board" value={categoryForm.slug} onChange={e => setCategoryForm(current => ({ ...current, slug: e.target.value }))} />
              <Textarea placeholder="分类描述" value={categoryForm.description} onChange={e => setCategoryForm(current => ({ ...current, description: e.target.value }))} />
              <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={categoryForm.parentId} onChange={e => setCategoryForm(current => ({ ...current, parentId: e.target.value }))}>
                <option value="">顶级分类</option>
                {categories.map(item => <option key={item.id} value={String(item.id)}>{item.name}</option>)}
              </select>
              <Input placeholder="层级，默认 1" value={categoryForm.level} onChange={e => setCategoryForm(current => ({ ...current, level: e.target.value }))} />
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-full bg-sky-700 px-6 hover:bg-sky-800" disabled={!canManageContent || createCategoryMutation.isPending || updateCategoryMutation.isPending} onClick={() => {
                  if (!ensureRequired(categoryForm.name, "分类名称") || !ensureRequired(categoryForm.slug, "分类 slug")) return;
                  editingCategoryId ? updateCategoryMutation.mutate({
                  id: editingCategoryId,
                  name: categoryForm.name,
                  slug: categoryForm.slug,
                  description: categoryForm.description || null,
                  parentId: categoryForm.parentId ? Number(categoryForm.parentId) : null,
                  level: Number(categoryForm.level || 1),
                  sortOrder: 0,
                  coverImage: null,
                  isActive: true,
                }) : createCategoryMutation.mutate({
                  name: categoryForm.name,
                  slug: categoryForm.slug,
                  description: categoryForm.description || null,
                  parentId: categoryForm.parentId ? Number(categoryForm.parentId) : null,
                  level: Number(categoryForm.level || 1),
                  sortOrder: 0,
                  coverImage: null,
                  isActive: true,
                });
                }}>
                  {editingCategoryId ? "更新分类" : "保存分类"}
                </Button>
                {editingCategoryId ? <Button type="button" variant="outline" className="rounded-full" onClick={() => { setEditingCategoryId(null); setCategoryForm(emptyCategoryForm); }}>取消编辑</Button> : null}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[1.8rem] border-slate-200 shadow-none">
            <CardHeader><CardTitle>分类列表</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {categories.map(item => (
                <div key={item.id} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{item.name}</p>
                      <p className="mt-2 text-sm text-slate-500">slug: {item.slug} · 层级 {item.level}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="rounded-full" disabled={!canManageContent} onClick={() => { setEditingCategoryId(item.id); setCategoryForm({ name: item.name, slug: item.slug, description: item.description || "", parentId: item.parentId ? String(item.parentId) : "", level: String(item.level || 1) }); }}>编辑</Button>
                      <Button variant="outline" className="rounded-full" disabled={!canManageContent} onClick={() => deleteCategoryMutation.mutate({ id: item.id })}>删除</Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeKey === "applications" ? (
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <Card className="rounded-[1.8rem] border-slate-200 shadow-none">
            <CardHeader><CardTitle>新增产品应用</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="应用标题" value={applicationForm.title} onChange={e => setApplicationForm(current => ({ ...current, title: e.target.value }))} />
              <Input placeholder="副标题" value={applicationForm.subtitle} onChange={e => setApplicationForm(current => ({ ...current, subtitle: e.target.value }))} />
              <Textarea placeholder="应用描述" value={applicationForm.description} onChange={e => setApplicationForm(current => ({ ...current, description: e.target.value }))} />
              <div className="space-y-2">
                <Input placeholder="图片 URL" value={applicationForm.imageUrl} onChange={e => setApplicationForm(current => ({ ...current, imageUrl: e.target.value }))} />
                <Input type="file" accept="image/*" onChange={e => uploadImage(e, url => setApplicationForm(current => ({ ...current, imageUrl: url })))} />
              </div>
              <Input placeholder="图标（可选，emoji 或短文本）" value={applicationForm.icon} onChange={e => setApplicationForm(current => ({ ...current, icon: e.target.value }))} />
              <Input type="number" min={0} placeholder="排序值" value={String(applicationForm.sortOrder)} onChange={e => setApplicationForm(current => ({ ...current, sortOrder: Number(e.target.value) }))} />
              <div className="flex items-center gap-3">
                <input
                  id="app-is-active"
                  type="checkbox"
                  checked={applicationForm.isActive}
                  onChange={e => setApplicationForm(current => ({ ...current, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-500"
                />
                <label htmlFor="app-is-active" className="text-sm text-slate-600">启用应用</label>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-full bg-sky-700 px-6 hover:bg-sky-800" disabled={!canManageContent || createApplicationMutation.isPending || updateApplicationMutation.isPending} onClick={() => {
                  if (!ensureRequired(applicationForm.title, "应用标题")) return;
                  editingApplicationId ? updateApplicationMutation.mutate({
                    id: editingApplicationId,
                    ...applicationForm,
                  }) : createApplicationMutation.mutate(applicationForm);
                }}>
                  {editingApplicationId ? "更新应用" : "保存应用"}
                </Button>
                {editingApplicationId ? <Button type="button" variant="outline" className="rounded-full" onClick={() => { setEditingApplicationId(null); setApplicationForm(emptyApplicationForm); }}>取消编辑</Button> : null}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[1.8rem] border-slate-200 shadow-none">
            <CardHeader><CardTitle>产品应用列表</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(applicationsQuery.data || []).map(item => (
                <div key={item.id} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-2 text-sm text-slate-500">{item.subtitle || ""}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="rounded-full" disabled={!canManageContent} onClick={() => {
                        setEditingApplicationId(item.id);
                        setApplicationForm({
                          title: item.title,
                          subtitle: item.subtitle || "",
                          description: item.description || "",
                          imageUrl: item.imageUrl || "",
                          icon: item.icon || "",
                          sortOrder: item.sortOrder ?? 0,
                          isActive: item.isActive ?? true,
                        });
                      }}>编辑</Button>
                      <Button variant="outline" className="rounded-full" disabled={!canManageContent} onClick={() => deleteApplicationMutation.mutate({ id: item.id })}>删除</Button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>排序：{item.sortOrder ?? 0}</span>
                    <span>状态：{item.isActive ? "已启用" : "已禁用"}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeKey === "users" ? (
        <Card className="rounded-[1.8rem] border-slate-200 shadow-none">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>管理员管理</CardTitle>
              {isAdmin ? (
                <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full bg-sky-700 text-white hover:bg-sky-800">新增</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>新增管理员</DialogTitle>
                      <DialogDescription>创建本地登录账号并指定角色。</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {newUserError ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{newUserError}</p> : null}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">邮箱</label>
                          <Input value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="admin@example.com" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">用户名</label>
                          <Input value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="管理员名称" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">密码</label>
                          <Input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder="至少8个字符" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">确认密码</label>
                          <Input type="password" value={newUserConfirmPassword} onChange={e => setNewUserConfirmPassword(e.target.value)} placeholder="再次输入密码" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700">角色</label>
                          <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as "user" | "admin")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                            <option value="admin">管理员</option>
                            <option value="user">普通用户</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsCreateUserOpen(false)} className="rounded-full">取消</Button>
                        <Button
                          className="rounded-full"
                          disabled={registerLocalUserMutation.isPending || !newUserEmail || !newUserName || !newUserPassword || !newUserConfirmPassword || newUserPassword !== newUserConfirmPassword}
                          onClick={async () => {
                            setNewUserError(null);
                            if (newUserPassword !== newUserConfirmPassword) {
                              setNewUserError("两次输入的密码不一致");
                              return;
                            }

                            try {
                              await registerLocalUserMutation.mutateAsync({
                                email: newUserEmail,
                                name: newUserName,
                                password: newUserPassword,
                                role: newUserRole,
                              });
                            } catch (error) {
                              setNewUserError(getErrorMessage(error));
                            }
                          }}
                        >
                          {registerLocalUserMutation.isPending ? "创建中..." : "创建账户"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isAdmin ? <p className="text-sm text-slate-500">当前账号仅可查看后台概览，管理员管理仅对 admin 开放。</p> : null}
            {(usersQuery.data || []).map(item => (
              <div key={item.id} className="flex flex-col gap-4 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{item.name || "未命名用户"}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.email || "暂无邮箱"}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant={item.role === "admin" ? "default" : "outline"} className="rounded-full" disabled={!isAdmin || updateUserRoleMutation.isPending || deleteLocalUserMutation.isPending} onClick={() => updateUserRoleMutation.mutate({ userId: item.id, role: "admin" })}>
                    设为 admin
                  </Button>
                  <Button variant={item.role === "user" ? "default" : "outline"} className="rounded-full" disabled={!isAdmin || updateUserRoleMutation.isPending || deleteLocalUserMutation.isPending} onClick={() => updateUserRoleMutation.mutate({ userId: item.id, role: "user" })}>
                    设为 user
                  </Button>
                  <Button variant="outline" className="rounded-full text-red-600 border-red-200 hover:bg-red-50" disabled={!isAdmin || deleteLocalUserMutation.isPending || item.id === user?.id} onClick={() => {
                    if (!window.confirm("确认删除该管理员账号？")) return;
                    deleteLocalUserMutation.mutate({ userId: item.id });
                  }}>
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </DashboardLayout>
  );
}
