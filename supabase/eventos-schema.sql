-- Columns and types
select table_schema, table_name, column_name, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('eventos', 'evento_tipos_inscricao')
order by table_name, ordinal_position;

-- Constraints
select tc.table_name, tc.constraint_name, tc.constraint_type, kcu.column_name
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
  and tc.table_schema = kcu.table_schema
where tc.table_schema = 'public'
  and tc.table_name in ('eventos', 'evento_tipos_inscricao')
order by tc.table_name, tc.constraint_type, tc.constraint_name, kcu.column_name;

-- Check constraints
select tc.table_name, tc.constraint_name, cc.check_clause
from information_schema.table_constraints tc
join information_schema.check_constraints cc
  on tc.constraint_name = cc.constraint_name
where tc.table_schema = 'public'
  and tc.table_name in ('eventos', 'evento_tipos_inscricao')
order by tc.table_name, tc.constraint_name;

-- Event status values (distinct)
select distinct status
from public.eventos
order by status;
