import { Building2, Edit2, KeyRound, Power, Save, Search, Send, UserCog, UserX, X } from "lucide-react";
import Link from "next/link";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { StatusMessage } from "../status-message";
import { AdminFilterPills, AdminPageHeader, AdminStatusBadge } from "../admin-ui";

type AdminUser = {
  id: string;
  nome: string;
  email: string;
  role: string;
  departamento_id: string | null;
  ativo: boolean;
  observacoes: string | null;
  created_at: string;
};

type DepartmentOption = {
  id: string;
  nome: string;
};

const roleOptions = [
  { value: "admin", label: "Administrador", description: "Acesso total ao painel e governança.", badgeClass: "bg-[#8b2f2b] text-white" },
  { value: "editor", label: "Editor", description: "Cria e edita notícias, páginas e conteúdos.", badgeClass: "bg-[#171006] text-[#f4cf6a]" },
  { value: "midia", label: "Mídia", description: "Foco em vídeos, imagens e biblioteca de mídia.", badgeClass: "border border-[#8b2f2b]/40 bg-[#f7efd6] text-[#8b2f2b]" },
  { value: "viewer", label: "Leitura", description: "Acompanhamento sem edição de conteúdo.", badgeClass: "bg-stone-200 text-stone-700" },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{
    success?: string;
    error?: string;
    message?: string;
    edit?: string;
    ativo?: string;
    q?: string;
    reset?: string;
  }>;
}) {
  const params = await searchParams;
  const activeFilter = params?.ativo ?? "todos";
  const searchQuery = (params?.q ?? "").trim();
  const resetUserId = params?.reset;

  let activeQuery = "";
  if (activeFilter !== "todos") {
    activeQuery += `&ativo=eq.${activeFilter === "ativos"}`;
  }
  if (searchQuery) {
    activeQuery += `&or=(nome.ilike.*${encodeURIComponent(searchQuery)}*,email.ilike.*${encodeURIComponent(searchQuery)}*)`;
  }

  const [users, departments] = await Promise.all([
    selectSupabaseRows<AdminUser>(
      "cms_admin_users",
      `select=id,nome,email,role,departamento_id,ativo,observacoes,created_at${activeQuery}&order=created_at.desc&limit=80`,
    ),
    selectSupabaseRows<DepartmentOption>("cms_departamentos", "select=id,nome&ativo=eq.true&order=ordem.asc,nome.asc"),
  ]);

  const editingUser = users.find((user) => user.id === params?.edit);
  const resetUser = users.find((user) => user.id === resetUserId);
  const departmentMap = new Map(departments.map((department) => [department.id, department.nome]));

  const activeUsersCount = users.filter((u) => u.ativo).length;
  const inactiveUsersCount = users.filter((u) => !u.ativo).length;

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.error} successMessage={params?.message} />

      <AdminPageHeader
        icon={UserCog}
        eyebrow="Equipe e Acessos"
        title="Usuários e Perfis Administrativos"
        description="Gerencie os membros da equipe editorial e de comunicação. Cadastre e libere usuários diretamente com perfil de acesso e senha sincronizados no Supabase."
      />

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* 1. Formulário Lateral (Novo / Editar) */}
        <section className="h-fit border border-[#d8c38b] bg-white/80 p-6 shadow-[0_18px_50px_rgba(23,16,6,.06)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Formulário</p>
              <h2 className="mt-1 font-serif text-2xl font-black text-[#171006]">
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </h2>
            </div>
            {editingUser ? (
              <Link
                href="/admin/usuarios"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#8b2f2b] underline hover:opacity-80"
              >
                <X size={14} />
                Cancelar
              </Link>
            ) : null}
          </div>

          <p className="mt-2 text-xs leading-5 text-[#5a472c]">
            {editingUser
              ? "Atualize o nome, departamento, permissões ou senha deste operador."
              : "Cadastre um novo operador. O acesso é liberado imediatamente para login com a senha definida."}
          </p>

          <form action="/api/admin/usuarios" method="post" className="mt-5 grid gap-4">
            <input type="hidden" name="id" value={editingUser?.id ?? ""} />

            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome completo</span>
              <input
                name="nome"
                required
                defaultValue={editingUser?.nome}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3.5 py-2.5 text-sm outline-none focus:border-[#8b2f2b]"
                placeholder="Ex.: Pr. Carlos Silva"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">E-mail de acesso</span>
              <input
                name="email"
                type="email"
                required
                defaultValue={editingUser?.email}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3.5 py-2.5 text-sm outline-none focus:border-[#8b2f2b]"
                placeholder="usuario@comieadepa.org"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">
                {editingUser ? "Nova senha (opcional)" : "Senha de acesso"}
              </span>
              <input
                name="password"
                type="password"
                minLength={8}
                required={!editingUser}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3.5 py-2.5 text-sm outline-none focus:border-[#8b2f2b]"
                placeholder={editingUser ? "Deixar em branco para manter atual" : "Mínimo 8 caracteres"}
              />
              <span className="text-[11px] text-[#5a472c]/70">
                {editingUser
                  ? "Preencha apenas se desejar redefinir a senha do usuário."
                  : "O usuário é liberado imediatamente no Supabase Auth para login com esta senha."}
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Perfil (Role)</span>
                <select
                  name="role"
                  defaultValue={editingUser?.role ?? "editor"}
                  className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2.5 text-sm outline-none focus:border-[#8b2f2b]"
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Departamento</span>
                <select
                  name="departamento_id"
                  defaultValue={editingUser?.departamento_id ?? ""}
                  className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2.5 text-sm outline-none focus:border-[#8b2f2b]"
                >
                  <option value="">Geral (Todos)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Observações</span>
              <textarea
                name="observacoes"
                defaultValue={editingUser?.observacoes ?? ""}
                rows={2}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3.5 py-2.5 text-sm outline-none focus:border-[#8b2f2b]"
                placeholder="Função, secretaria ou anotação interna."
              />
            </label>

            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center gap-2 bg-[#8b2f2b] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-[#6e2421]"
            >
              <Save size={16} />
              {editingUser ? "Atualizar Usuário" : "Salvar e Liberar Acesso"}
            </button>
          </form>
        </section>

        {/* 2. Listagem Limpa e Elegante */}
        <section className="border border-[#d8c38b] bg-white/80 p-6 shadow-[0_18px_50px_rgba(23,16,6,.06)]">
          {/* Cabeçalho da Lista + Filtros */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Equipe</p>
                <span className="rounded-full bg-[#171006] px-2 py-0.5 text-[10px] font-black text-[#f4cf6a]">
                  {users.length}
                </span>
              </div>
              <h2 className="mt-1 font-serif text-2xl font-black text-[#171006]">Perfis Cadastrados</h2>
            </div>

            <AdminFilterPills
              current={activeFilter}
              baseUrl="/admin/usuarios"
              paramName="ativo"
              options={[
                { value: "todos", label: "Todos", count: users.length },
                { value: "ativos", label: "Ativos", count: activeUsersCount },
                { value: "inativos", label: "Inativos", count: inactiveUsersCount },
              ]}
            />
          </div>

          {/* Barra de Busca */}
          <form method="get" action="/admin/usuarios" className="mt-5 flex gap-2">
            <input type="hidden" name="ativo" value={activeFilter} />
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a472c]/60" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Buscar por nome ou e-mail..."
                className="w-full border border-[#d8c38b] bg-[#fffaf0] py-2.5 pl-10 pr-10 text-sm outline-none focus:border-[#8b2f2b]"
              />
              {searchQuery ? (
                <Link
                  href={`/admin/usuarios?ativo=${activeFilter}`}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5a472c]/60 hover:text-[#8b2f2b]"
                >
                  <X size={16} />
                </Link>
              ) : null}
            </div>
            <button
              type="submit"
              className="bg-[#171006] px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#f4cf6a] hover:bg-[#2c2212]"
            >
              Buscar
            </button>
          </form>

          {/* Tabela / Lista Elegante */}
          <div className="mt-5 divide-y divide-[#ead9a6] border border-[#ead9a6] bg-white">
            {users.map((user) => {
              const initials = user.nome
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0].toUpperCase())
                .join("");

              const roleConfig = roleOptions.find((r) => r.value === user.role) || {
                label: user.role,
                badgeClass: "bg-stone-200 text-stone-700",
              };

              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 p-4 transition hover:bg-[#fffaf0] lg:flex-row lg:items-center lg:justify-between"
                >
                  {/* Usuário info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#171006] text-xs font-black text-[#f4cf6a]">
                      {initials || "US"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-base font-bold text-[#171006] truncate">
                          {user.nome}
                        </h3>
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] ${roleConfig.badgeClass}`}
                        >
                          {roleConfig.label}
                        </span>
                        <AdminStatusBadge status={user.ativo ? "ativo" : "inativo"} />
                      </div>

                      <p className="mt-0.5 text-xs text-[#5a472c] truncate">{user.email}</p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#5a472c]/80">
                        <span className="inline-flex items-center gap-1">
                          <Building2 size={12} className="text-[#8b2f2b]" />
                          {departmentMap.get(user.departamento_id ?? "") || "Geral (Todos os departamentos)"}
                        </span>
                        {user.observacoes ? (
                          <span className="italic text-[#5a472c]/60 truncate max-w-xs">
                            • {user.observacoes}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[#ead9a6]/60 pt-3 lg:border-t-0 lg:pt-0">
                    {/* Editar */}
                    <Link
                      href={`/admin/usuarios?edit=${user.id}${activeFilter !== "todos" ? `&ativo=${activeFilter}` : ""}`}
                      className="inline-flex items-center gap-1 border border-[#8b2f2b]/40 bg-[#f7efd6] px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#8b2f2b] transition hover:bg-[#8b2f2b] hover:text-white"
                    >
                      <Edit2 size={12} />
                      Editar
                    </Link>

                    {/* Enviar Acesso / Recuperação */}
                    <form action="/api/admin/usuarios" method="post" className="inline">
                      <input type="hidden" name="id" value={user.id} />
                      <input type="hidden" name="nome" value={user.nome} />
                      <input type="hidden" name="email" value={user.email} />
                      <input type="hidden" name="action" value="send_access" />
                      <button
                        type="submit"
                        title="Enviar e-mail para definição ou recuperação de senha"
                        className="inline-flex items-center gap-1 border border-[#d8c38b] bg-white px-2.5 py-1.5 text-xs font-bold text-[#5a472c] transition hover:border-[#8b2f2b] hover:text-[#8b2f2b]"
                      >
                        <Send size={12} />
                        Enviar Acesso
                      </button>
                    </form>

                    {/* Definir Senha Direta */}
                    <Link
                      href={`/admin/usuarios?reset=${user.id}${activeFilter !== "todos" ? `&ativo=${activeFilter}` : ""}`}
                      title="Definir uma senha diretamente pelo administrador"
                      className="inline-flex items-center gap-1 border border-[#d8c38b] bg-white px-2.5 py-1.5 text-xs font-bold text-[#5a472c] transition hover:border-[#8b2f2b] hover:text-[#8b2f2b]"
                    >
                      <KeyRound size={12} />
                      Definir Senha
                    </Link>

                    {/* Ativar/Desativar */}
                    <form action="/api/admin/usuarios" method="post" className="inline">
                      <input type="hidden" name="id" value={user.id} />
                      <input type="hidden" name="action" value={user.ativo ? "deactivate" : "activate"} />
                      <button
                        type="submit"
                        title={user.ativo ? "Desativar usuário" : "Ativar usuário"}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold transition ${
                          user.ativo
                            ? "text-red-700 hover:bg-red-50"
                            : "text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        <Power size={12} />
                        {user.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}

            {users.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#5a472c]">
                <UserX size={32} className="mx-auto mb-2 text-[#5a472c]/40" />
                <p className="font-bold">Nenhum usuário encontrado.</p>
                <p className="mt-1 text-xs text-[#5a472c]/70">
                  Ajuste os filtros de status ou o termo de busca.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {/* Modal: Definir Senha Diretamente */}
      {resetUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md border border-[#d8c38b] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center bg-[#8b2f2b] text-white">
                  <KeyRound size={16} />
                </div>
                <h3 className="font-serif text-lg font-black text-[#171006]">Definir Senha</h3>
              </div>
              <Link
                href={`/admin/usuarios${activeFilter !== "todos" ? `?ativo=${activeFilter}` : ""}`}
                className="text-[#5a472c] hover:text-[#8b2f2b]"
              >
                <X size={18} />
              </Link>
            </div>

            <p className="mt-3 text-xs leading-5 text-[#5a472c]">
              Defina uma nova senha para o usuário{" "}
              <strong className="text-[#171006]">{resetUser.nome}</strong> ({resetUser.email}).
            </p>

            <form action="/api/admin/usuarios" method="post" className="mt-4 grid gap-4">
              <input type="hidden" name="id" value={resetUser.id} />
              <input type="hidden" name="nome" value={resetUser.nome} />
              <input type="hidden" name="email" value={resetUser.email} />
              <input type="hidden" name="action" value="set_password" />

              <label className="grid gap-1.5">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Nova Senha</span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="border border-[#d8c38b] bg-[#fffaf0] px-3.5 py-2 text-sm outline-none focus:border-[#8b2f2b]"
                  placeholder="Mínimo 8 caracteres"
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Link
                  href={`/admin/usuarios${activeFilter !== "todos" ? `?ativo=${activeFilter}` : ""}`}
                  className="px-4 py-2 text-xs font-bold text-[#5a472c] hover:underline"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-[#8b2f2b] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#6e2421]"
                >
                  <Save size={14} />
                  Salvar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

