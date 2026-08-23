import { Check, Save, ShieldCheck, UserRound, X } from "lucide-react";
import { StatusMessage } from "../status-message";
import {
  AdminAction,
  AdminModule,
  AdminRole,
  adminActionList,
  adminModuleList,
  adminRoleList,
  canPerformAdminAction,
  normalizeAdminRole,
} from "@/lib/admin-permissions";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { AdminPageHeader } from "../admin-ui";

type AdminUser = {
  id: string;
  nome: string;
  email: string;
  role: AdminRole;
  ativo: boolean;
  departamento_id: string | null;
  observacoes: string | null;
  created_at: string;
};

const roleLabels: Record<AdminRole, string> = {
  admin: "Administrador",
  editor: "Editor",
  midia: "Mídia",
  viewer: "Leitura",
};

const roleDescriptions: Record<AdminRole, string> = {
  admin: "Governança completa do painel, usuários, configurações e publicação.",
  editor: "Produção editorial com criação, revisão e publicação de conteúdos.",
  midia: "Gestão de home, biblioteca de mídia e vídeos institucionais.",
  viewer: "Acompanhamento e consulta sem edição de conteúdo.",
};

const moduleLabels: Record<AdminModule, string> = {
  dashboard: "Dashboard",
  home: "Home",
  noticias: "Notícias",
  videos: "Vídeos",
  departamentos: "Departamentos",
  documentos: "Documentos",
  galerias: "Galeria de Fotos",
  midia: "Mídia",
  auditoria: "Auditoria",
  usuarios: "Usuários",
  configuracoes: "Configurações",
  permissoes: "Permissões",
  paginas: "Páginas",
  mesa_diretora: "Mesa Diretora",
  institucional: "Institucional",
};

const actionLabels: Record<AdminAction, string> = {
  view: "Ver",
  create: "Criar",
  update: "Editar",
  delete: "Excluir",
  publish: "Publicar",
  archive: "Arquivar",
  upload: "Upload",
  manage_users: "Gerenciar usuários",
  manage_settings: "Gerenciar ajustes",
};

const visibleModules: AdminModule[] = [
  "dashboard",
  "home",
  "noticias",
  "videos",
  "departamentos",
  "documentos",
  "galerias",
  "midia",
  "auditoria",
  "usuarios",
  "permissoes",
  "configuracoes",
  "paginas",
  "mesa_diretora",
  "institucional",
];

const visibleActions: AdminAction[] = [
  "view",
  "create",
  "update",
  "delete",
  "publish",
  "archive",
  "upload",
  "manage_users",
  "manage_settings",
];

export default async function AdminPermissionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const users = await selectSupabaseRows<AdminUser>(
    "cms_admin_users",
    "select=id,nome,email,role,ativo,departamento_id,observacoes,created_at&order=role.asc,nome.asc&limit=120",
  );
  const usersByRole = new Map<AdminRole, AdminUser[]>(
    adminRoleList.map((adminRole) => [adminRole, users.filter((user) => normalizeAdminRole(user.role) === adminRole)]),
  );

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.error ?? params?.message} />

      <AdminPageHeader
        icon={ShieldCheck}
        eyebrow="Governança e RBAC"
        title="Matriz de Permissões e Perfis"
        description="Consulte o escopo de atuação de cada perfil (Administrador, Editor, Mídia e Leitura) e ajuste os acessos dos usuários cadastrados."
      />

      <section className="mb-6 grid gap-4 lg:grid-cols-4">
        {adminRoleList.map((adminRole) => {
          const allowedModules = adminModuleList.filter((moduleKey) =>
            adminActionList.some((action) => canPerformAdminAction(adminRole, moduleKey, action)),
          ).length;
          const allowedActions = adminModuleList.reduce(
            (total, moduleKey) => total + adminActionList.filter((action) => canPerformAdminAction(adminRole, moduleKey, action)).length,
            0,
          );
          const roleUsers = usersByRole.get(adminRole) ?? [];

          return (
            <article key={adminRole} className="border border-[#d8c38b] bg-white/76 p-5 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">{roleLabels[adminRole]}</p>
              <p className="mt-3 min-h-16 text-sm leading-6 text-[#5a472c]">{roleDescriptions[adminRole]}</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="border border-[#ead9a6] bg-[#fffaf0] p-3">
                  <strong className="block font-serif text-2xl">{roleUsers.length}</strong>
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#5a472c]/70">Usuários</span>
                </div>
                <div className="border border-[#ead9a6] bg-[#fffaf0] p-3">
                  <strong className="block font-serif text-2xl">{allowedModules}</strong>
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#5a472c]/70">Módulos</span>
                </div>
                <div className="border border-[#ead9a6] bg-[#fffaf0] p-3">
                  <strong className="block font-serif text-2xl">{allowedActions}</strong>
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#5a472c]/70">Ações</span>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mb-6 border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Usuários</p>
            <h2 className="mt-2 font-serif text-4xl font-black">Ajustar perfis cadastrados</h2>
          </div>
          <span className="border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/64">
            {users.length} cadastro{users.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {users.map((user) => (
            <article key={user.id} className="border border-white/10 bg-white/[0.055] p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center bg-[#f4cf6a] text-[#171006]">
                  <UserRound size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#f4cf6a]">{roleLabels[normalizeAdminRole(user.role)]}</span>
                    <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${user.ativo ? "bg-[#00b67a] text-white" : "bg-white/10 text-white/50"}`}>
                      {user.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl font-black">{user.nome}</h3>
                  <p className="mt-1 break-all text-sm text-white/58">{user.email}</p>

                  <form action="/api/admin/permissoes" method="post" className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input type="hidden" name="id" value={user.id} />
                    <label className="grid gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/46">Perfil</span>
                      <select
                        name="role"
                        defaultValue={normalizeAdminRole(user.role)}
                        className="border border-white/10 bg-[#120f0a] px-3 py-3 text-sm font-semibold text-white outline-none focus:border-[#f4cf6a]"
                      >
                        {adminRoleList.map((adminRole) => (
                          <option key={adminRole} value={adminRole}>
                            {roleLabels[adminRole]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button type="submit" className="inline-flex items-end justify-center gap-2 bg-[#f4cf6a] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#171006]">
                      <Save size={16} />
                      Salvar
                    </button>
                  </form>

                  <form action="/api/admin/permissoes" method="post" className="mt-4">
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="action" value={user.ativo ? "deactivate" : "activate"} />
                    <button type="submit" className="text-xs font-black uppercase tracking-[0.14em] text-white/54 transition hover:text-[#f4cf6a]">
                      {user.ativo ? "Desativar acesso" : "Ativar acesso"}
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>

        {users.length === 0 ? <div className="mt-8 border border-white/10 bg-white/[0.055] p-6 text-white/62">Nenhum usuário cadastrado ainda.</div> : null}
      </section>

      <div className="grid gap-6">
        {adminRoleList.map((adminRole) => (
          <section key={adminRole} className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Perfil</p>
                <h2 className="mt-2 font-serif text-3xl font-black leading-tight">{roleLabels[adminRole]}</h2>
              </div>
              <span className="inline-flex items-center gap-2 border border-[#d8c38b] bg-[#f7efd6] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#5a472c]">
                {roleLabels[adminRole]}
              </span>
            </div>

            <div className="mt-6 overflow-x-auto border border-[#ead9a6] bg-white">
              <div className="min-w-[920px]">
                <div className="grid grid-cols-[220px_repeat(9,minmax(90px,1fr))] border-b border-[#ead9a6] bg-[#f7efd6] text-[11px] font-black uppercase tracking-[0.16em] text-[#8b2f2b]">
                  <span className="px-4 py-3">Módulo</span>
                  {visibleActions.map((action) => (
                    <span key={action} className="px-3 py-3 text-center">
                      {actionLabels[action]}
                    </span>
                  ))}
                </div>

                {visibleModules.map((moduleKey) => (
                  <div key={moduleKey} className="grid grid-cols-[220px_repeat(9,minmax(90px,1fr))] border-b border-[#ead9a6] text-sm">
                    <span className="px-4 py-3 font-semibold text-[#5a472c]">{moduleLabels[moduleKey]}</span>
                    {visibleActions.map((action) => {
                      const allowed = canPerformAdminAction(adminRole, moduleKey, action);
                      return (
                        <div key={`${moduleKey}-${action}`} className="flex items-center justify-center px-3 py-3">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                              allowed
                                ? "border-[#0b4d2a] bg-[#0b4d2a]/10 text-[#0b4d2a]"
                                : "border-[#9c2b2b] bg-[#9c2b2b]/10 text-[#9c2b2b]"
                            }`}
                            title={allowed ? "Permitido" : "Bloqueado"}
                          >
                            {allowed ? <Check size={16} /> : <X size={16} />}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[#5a472c]">
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#0b4d2a] bg-[#0b4d2a]/10 text-[#0b4d2a]">
                  <Check size={14} />
                </span>
                Permitido
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#9c2b2b] bg-[#9c2b2b]/10 text-[#9c2b2b]">
                  <X size={14} />
                </span>
                Bloqueado
              </span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
