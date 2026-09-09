import { insertSupabaseRow, selectSupabaseRows, setAdminUserDirectPassword } from "../src/lib/supabase-admin";

async function run() {
  const email = "admin@comieadepa.org";
  const newPassword = "AdminPassword123!";

  console.log(`Verificando se o usuário ${email} está cadastrado em cms_admin_users...`);
  const existing = await selectSupabaseRows<{ id: string }>(
    "cms_admin_users",
    `select=id&email=eq.${encodeURIComponent(email)}`,
  );

  if (existing.length === 0) {
    console.log(`Criando registro de admin em cms_admin_users para ${email}...`);
    await insertSupabaseRow("cms_admin_users", {
      nome: "Administrador Geral",
      email,
      role: "admin",
      ativo: true,
      observacoes: "Conta master criada via CLI",
    });
    console.log(`✅ Registro de permissão admin criado!`);
  } else {
    console.log(`✅ Usuário ${email} já existe na tabela de permissões.`);
  }

  console.log(`Garantindo a senha do usuário...`);
  await setAdminUserDirectPassword(email, newPassword, "Administrador Geral");
  console.log(`✅ SUCESSO COMPLETO! E-mail: ${email} | Senha: ${newPassword}`);
}

run().catch(console.error);




