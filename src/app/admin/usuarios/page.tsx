import { Save, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { StatusMessage } from "../status-message";

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
  { value: "viewer", label: "Leitura", text: "Acompanhamento sem edição futura." },
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
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[430px_1fr]">
      <section className="h-fit border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <StatusMessage success={params?.success} error={params?.message ?? params?.error} />
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Usuários e perfis</p>
        <h2 className="mt-3 font-serif text-4xl font-black leading-tight">{editingUser ? "Editar usuário" : "Novo usuário"}</h2>
        <p className="mt-4 leading-7 text-[#5a472c]">
          Cadastro preparatório da equipe editorial. Nesta fase, o acesso ainda usa o login geral; os perfis já organizam responsabilidades para a próxima troca de autenticação.
        </p>

        <form action="/api/admin/usuarios" method="post" className="mt-8 grid gap-5">
          <input type="hidden" name="id" value={editingUser?.id ?? ""} />
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome</span>
            <input name="nome" required defaultValue={editingUser?.nome} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Nome da pessoa ou equipe" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">E-mail</span>
            <input name="email" type="email" required defaultValue={editingUser?.email} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="midia@comieadepa.org" />
          </label>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Perfil</span>
              <select name="role" defaultValue={editingUser?.role ?? "editor"} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]">
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Departamento</span>
              <select name="departamento_id" defaultValue={editingUser?.departamento_id ?? ""} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]">
                <option value="">Geral</option>
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
            <textarea name="observacoes" defaultValue={editingUser?.observacoes ?? ""} className="min-h-24 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Responsabilidades, restrições ou contexto operacional." />
          </label>
          <button type="submit" className="inline-flex w-fit items-center gap-3 bg-[#171006] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Equipe</p>
            <h2 className="mt-2 font-serif text-4xl font-black">Perfis cadastrados</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["todos", "Todos"],
              ["ativos", "Ativos"],
              ["inativos", "Inativos"],
            ].map(([value, label]) => (
              <Link
                key={value}
                href={value === "todos" ? "/admin/usuarios" : `/admin/usuarios?ativo=${value}`}
                className={`px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition ${
                  activeFilter === value ? "bg-[#f4cf6a] text-[#171006]" : "border border-white/10 text-white/54 hover:border-[#f4cf6a] hover:text-[#f4cf6a]"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
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
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#f4cf6a]">{formatRole(user.role)}</span>
                    <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${user.ativo ? "bg-[#00b67a] text-white" : "bg-white/10 text-white/50"}`}>
                      {user.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl font-black">{user.nome}</h3>
                  <p className="mt-1 break-all text-sm text-white/58">{user.email}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-white/58">
                    <ShieldCheck size={15} className="text-[#f4cf6a]" />
                    {departmentMap.get(user.departamento_id ?? "") ?? "Geral"}
                  </p>
                  {user.observacoes ? <p className="mt-3 text-sm leading-6 text-white/58">{user.observacoes}</p> : null}
                  <div className="mt-5 flex flex-wrap gap-4">
                    <Link href={`/admin/usuarios?edit=${user.id}`} className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a]">
                      Editar
                    </Link>
                    <form action="/api/admin/usuarios" method="post">
                      <input type="hidden" name="id" value={user.id} />
                      <input type="hidden" name="action" value={user.ativo ? "deactivate" : "activate"} />
                      <button type="submit" className="text-xs font-black uppercase tracking-[0.14em] text-white/54 transition hover:text-[#f4cf6a]">
                        {user.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {users.length === 0 ? <div className="mt-8 border border-white/10 bg-white/[0.055] p-6 text-white/62">Nenhum usuário cadastrado ainda.</div> : null}
      </section>
    </div>
  );
}

function formatRole(role: string) {
  return roleOptions.find((item) => item.value === role)?.label ?? role;
}
