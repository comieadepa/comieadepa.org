import { Save, ShieldCheck, UserCog, UserRound } from "lucide-react";
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
  { value: "admin", label: "Administrador", text: "Acesso total ao painel e governança." },
  { value: "editor", label: "Editor", text: "Cria e edita notícias, departamentos e conteúdos." },
  { value: "midia", label: "Mídia", text: "Foco em vídeos, imagens e biblioteca de mídia." },
  { value: "viewer", label: "Leitura", text: "Acompanhamento sem edição de conteúdo." },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string; edit?: string; ativo?: string }>;
}) {
  const params = await searchParams;
  const activeFilter = params?.ativo ?? "todos";
  const activeQuery = activeFilter !== "todos" ? `&ativo=eq.${activeFilter === "ativos"}` : "";
  const [users, departments] = await Promise.all([
    selectSupabaseRows<AdminUser>(
      "cms_admin_users",
      `select=id,nome,email,role,departamento_id,ativo,observacoes,created_at${activeQuery}&order=created_at.desc&limit=60`,
    ),
    selectSupabaseRows<DepartmentOption>("cms_departamentos", "select=id,nome&ativo=eq.true&order=ordem.asc,nome.asc"),
  ]);
  const editingUser = users.find((user) => user.id === params?.edit);
  const departmentMap = new Map(departments.map((department) => [department.id, department.nome]));

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.error} successMessage={params?.message} />

      <AdminPageHeader
        icon={UserCog}
        eyebrow="Equipe e Acessos"
        title="Usuários e Perfis Administrativos"
        description="Gerencie os membros da equipe editorial e de comunicação. Defina os perfis de acesso (Administrador, Editor, Mídia e Leitura) e vincule a departamentos."
      />

      <div className="grid gap-6 lg:grid-cols-[430px_1fr]">
        <section className="h-fit border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Formulário</p>
          <h2 className="mt-2 font-serif text-3xl font-black leading-tight">
            {editingUser ? "Editar usuário" : "Novo usuário"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#5a472c]">
            O perfil atribuído determina as permissões de visualização e edição dentro do painel.
          </p>
          {!editingUser ? (
            <p className="mt-4 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 text-xs leading-5 text-[#5a472c]">
              Ao salvar, o sistema envia um e-mail para definição de senha e ativação do acesso.
            </p>
          ) : null}

          <form action="/api/admin/usuarios" method="post" className="mt-6 grid gap-5">
            <input type="hidden" name="id" value={editingUser?.id ?? ""} />
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome completo</span>
              <input
                name="nome"
                required
                defaultValue={editingUser?.nome}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
                placeholder="Nome da pessoa ou equipe"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">E-mail de acesso</span>
              <input
                name="email"
                type="email"
                required
                defaultValue={editingUser?.email}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
                placeholder="midia@comieadepa.org"
              />
            </label>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Perfil (Role)</span>
                <select
                  name="role"
                  defaultValue={editingUser?.role ?? "editor"}
                  className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Departamento</span>
                <select
                  name="departamento_id"
                  defaultValue={editingUser?.departamento_id ?? ""}
                  className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
                >
                  <option value="">Geral (Todos)</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Observações</span>
              <textarea
                name="observacoes"
                defaultValue={editingUser?.observacoes ?? ""}
                className="min-h-24 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
                placeholder="Responsabilidades, restrições ou contexto operacional."
              />
            </label>
            <button
              type="submit"
              className="inline-flex w-fit items-center gap-3 bg-[#171006] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white"
            >
              <Save size={18} />
              {editingUser ? "Atualizar usuário" : "Salvar usuário"}
            </button>
            {editingUser ? (
              <Link href="/admin/usuarios" className="w-fit text-sm font-semibold text-[#8b2f2b] underline underline-offset-4">
                Cancelar edição
              </Link>
            ) : null}
          </form>
        </section>

        <section className="border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Equipe</p>
              <h2 className="mt-1 font-serif text-3xl font-black">Perfis cadastrados</h2>
            </div>
            <AdminFilterPills
              current={activeFilter}
              baseUrl="/admin/usuarios"
              paramName="ativo"
              options={[
                { value: "todos", label: "Todos" },
                { value: "ativos", label: "Ativos" },
                { value: "inativos", label: "Inativos" },
              ]}
            />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {users.map((user) => (
              <article key={user.id} className="border border-white/10 bg-white/[0.055] p-5">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center bg-[#f4cf6a] text-[#171006]">
                    <UserRound size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#f4cf6a]">
                        {formatRole(user.role)}
                      </span>
                      <AdminStatusBadge status={user.ativo ? "ativo" : "inativo"} />
                    </div>
                    <h3 className="mt-2 font-serif text-2xl font-black">{user.nome}</h3>
                    <p className="mt-1 break-all text-sm text-white/58">{user.email}</p>
                    <p className="mt-3 flex items-center gap-2 text-sm text-white/58">
                      <ShieldCheck size={15} className="text-[#f4cf6a]" />
                      {departmentMap.get(user.departamento_id ?? "") ?? "Geral"}
                    </p>
                    {user.observacoes ? <p className="mt-3 text-sm leading-6 text-white/58">{user.observacoes}</p> : null}
                    <div className="mt-5 flex flex-wrap gap-4 border-t border-white/10 pt-3">
                      <Link
                        href={`/admin/usuarios?edit=${user.id}`}
                        className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a]"
                      >
                        Editar
                      </Link>
                      <form action="/api/admin/usuarios" method="post">
                        <input type="hidden" name="id" value={user.id} />
                        <input type="hidden" name="nome" value={user.nome} />
                        <input type="hidden" name="email" value={user.email} />
                        <input type="hidden" name="action" value="send_access" />
                        <button
                          type="submit"
                          className="text-xs font-black uppercase tracking-[0.14em] text-white/54 transition hover:text-[#f4cf6a]"
                        >
                          Enviar acesso
                        </button>
                      </form>
                      <form action="/api/admin/usuarios" method="post">
                        <input type="hidden" name="id" value={user.id} />
                        <input type="hidden" name="action" value={user.ativo ? "deactivate" : "activate"} />
                        <button
                          type="submit"
                          className="text-xs font-black uppercase tracking-[0.14em] text-white/54 transition hover:text-[#f4cf6a]"
                        >
                          {user.ativo ? "Desativar" : "Ativar"}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {users.length === 0 ? (
            <div className="mt-8 border border-white/10 bg-white/[0.055] p-6 text-white/62">
              Nenhum usuário cadastrado ainda.
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function formatRole(role: string) {
  return roleOptions.find((item) => item.value === role)?.label ?? role;
}
