-- ==========================================
-- CRIAR ACESSO ADMIN AO PAINEL COMIEADEPA
-- URL: /admin
--
-- COMO USAR
-- 1. Abra o Supabase SQL Editor
-- 2. Edite os 3 valores abaixo:
--    - v_admin_name
--    - v_admin_email
--    - v_admin_password
-- 3. Execute o script inteiro
-- ==========================================

create extension if not exists pgcrypto;

do $$
declare
  v_admin_name text := 'Administrador COMIEADEPA';
  v_admin_email text := 'admin.portal@comieadepa.org';
  v_admin_password text := 'Siren001001';
  v_admin_role text := 'admin';
  v_user_id uuid;
begin
  if v_admin_role not in ('admin', 'editor', 'midia', 'viewer') then
    raise exception 'Perfil inválido: %', v_admin_role;
  end if;

  select id
    into v_user_id
  from auth.users
  where email = lower(v_admin_email)
  limit 1;

  if v_user_id is null then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      lower(v_admin_email),
      crypt(v_admin_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object('name', v_admin_name),
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    returning id into v_user_id;
  else
    update auth.users
    set
      email = lower(v_admin_email),
      encrypted_password = crypt(v_admin_password, gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('name', v_admin_name),
      updated_at = now()
    where id = v_user_id;
  end if;

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  select
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', lower(v_admin_email),
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    lower(v_admin_email),
    now(),
    now(),
    now()
  where not exists (
    select 1
    from auth.identities
    where user_id = v_user_id
      and provider = 'email'
  );

  insert into site.cms_admin_users (
    nome,
    email,
    role,
    ativo,
    observacoes,
    updated_at
  )
  values (
    v_admin_name,
    lower(v_admin_email),
    v_admin_role,
    true,
    'Acesso administrativo criado via SQL Editor.',
    now()
  )
  on conflict (email) do update
  set
    nome = excluded.nome,
    role = excluded.role,
    ativo = true,
    observacoes = excluded.observacoes,
    updated_at = now();

  raise notice 'Acesso admin preparado para %', lower(v_admin_email);
end $$;
