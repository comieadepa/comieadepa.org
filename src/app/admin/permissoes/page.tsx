import { Check, ShieldCheck, X } from "lucide-react";
import { headers } from "next/headers";
import {
  AdminAction,
  AdminModule,
  AdminRole,
  adminRoleList,
  canPerformAdminAction,
  normalizeAdminRole,
} from "@/lib/admin-permissions";

const roleLabels: Record<AdminRole, string> = {
  admin: "Administrador",
  editor: "Editor",
  midia: "Mídia",
  viewer: "Leitura",
};

const moduleLabels: Record<AdminModule, string> = {
  dashboard: "Dashboard",
  home: "Home",
  eventos: "Eventos",
  noticias: "Notícias",
  videos: "Vídeos",
  departamentos: "Departamentos",
  midia: "Mídia",
  auditoria: "Auditoria",
  usuarios: "Usuários",
  configuracoes: "Configurações",
  permissoes: "Permissões",
  paginas: "Páginas",
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
  manage_settings: "Gerenciar configs",
};

const visibleModules: AdminModule[] = [
  "dashboard",
  "home",
  "eventos",
  "noticias",
  "videos",
  "departamentos",
  "midia",
  "auditoria",
  "usuarios",
  "configuracoes",
  "paginas",
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

export default async function AdminPermissionsPage() {
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));

  return (
    <div className="mx-auto max-w-7xl">
      <section className="mb-6 border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="grid h-14 w-14 place-items-center bg-[#171006] text-[#f4cf6a]">
            <ShieldCheck size={27} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Permissões</p>
            <h1 className="mt-2 font-serif text-4xl font-black leading-tight">Matriz de acesso do painel.</h1>
            <p className="mt-3 max-w-4xl leading-7 text-[#5a472c]">
              Esta tela é somente leitura. Use-a para validar o que cada perfil pode acessar por módulo e ação.
            </p>
            <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-[#5a472c]/70">Perfil atual: {roleLabels[role]}</p>
          </div>
        </div>
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
                {adminRole}
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
