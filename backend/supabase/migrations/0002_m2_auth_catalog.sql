-- BuildNest M2 migration for a fresh, owner-controlled Supabase project.
-- PREREQUISITE: apply 0001_schema_draft.sql *once* before this migration.
-- NO DATABASE HAS BEEN MODIFIED BY THE CHATGPT BUILD.
-- Admin writes are transactional RPC requests; only service_role is granted execute.

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(user_id,display_name,locale)
  values (new.id,coalesce(new.raw_user_meta_data->>'display_name',''),'en')
  on conflict (user_id) do nothing;
  return new;
end;$$;
revoke all on function public.create_profile_for_new_user() from public,anon,authenticated;
drop trigger if exists on_auth_user_created_buildnest on auth.users;
create trigger on_auth_user_created_buildnest after insert on auth.users
for each row execute function public.create_profile_for_new_user();

-- Only publicly published products, with valid two-language content, are exposed.
-- security_invoker guarantees RLS of underlying catalog tables applies to clients.
create or replace view public.public_catalog_items with (security_invoker = true) as
select p.id, p.slug, p.product_type as type, p.featured,
       c.slug as category,
       lt.name as title_th, le.name as title_en,
       lt.summary as summary_th, le.summary as summary_en,
       t.amount_minor as amount_thb_minor, u.amount_minor as amount_usd_minor
from public.products p
join public.categories c on c.id=p.category_id and c.is_active
join public.product_localizations lt on lt.product_id=p.id and lt.locale='th'
join public.product_localizations le on le.product_id=p.id and le.locale='en'
left join public.product_prices t on t.product_id=p.id and t.currency='THB' and t.license_tier='personal' and t.is_active
left join public.product_prices u on u.product_id=p.id and u.currency='USD' and u.license_tier='personal' and u.is_active
where p.status='published' and t.id is not null and u.id is not null;
grant select on public.public_catalog_items to anon,authenticated;

-- One atomic SQL transaction per Create/Update request.
-- No direct browser INSERT/UPDATE is granted for the catalog.
create or replace function public.admin_upsert_catalog_product(
  p_product_id uuid,
  p_slug text,
  p_category_slug text,
  p_type text,
  p_status text,
  p_featured boolean,
  p_locales jsonb,
  p_prices jsonb,
  p_actor_id uuid
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_product_id uuid;
  v_category_id uuid;
  v_currency text;
  v_price numeric;
  v_locale text;
  v_content jsonb;
begin
  if coalesce(auth.role(),'') <> 'service_role' then
    raise exception 'service role required' using errcode='42501';
  end if;
  if not exists(select 1 from public.admin_members where user_id=p_actor_id and role in ('owner','admin')) then
    raise exception 'administrator membership required' using errcode='42501';
  end if;
  if p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug)>80 or
     p_category_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_category_slug)>80 then
    raise exception 'invalid slug';
  end if;
  if p_type not in ('desktop_app','source_code','automation_actor','hosted_tool','api_credits','template','course','other') or
     p_status not in ('draft','review','published','archived') then
    raise exception 'invalid type/status';
  end if;
  select id into v_category_id from public.categories where slug=p_category_slug and is_active=true;
  if v_category_id is null then raise exception 'unknown or inactive category'; end if;
  if jsonb_typeof(p_locales)<>'object' or jsonb_typeof(p_prices)<>'object' then raise exception 'invalid JSON';end if;

  for v_locale in select unnest(array['th','en']) loop
    v_content:=p_locales->v_locale;
    if v_content is null or jsonb_typeof(v_content)<>'object' or
       length(btrim(coalesce(v_content->>'name','')))=0 or
       length(v_content->>'name')>120 or
       length(btrim(coalesce(v_content->>'summary','')))=0 or
       length(v_content->>'summary')>500 or
       length(coalesce(v_content->>'description',''))>20000 then
      raise exception 'missing or invalid locale: %',v_locale;
    end if;
  end loop;

  for v_currency in select unnest(array['THB','USD']) loop
    if (p_prices->>v_currency) is null or (p_prices->>v_currency) !~ '^\d+$' then
      raise exception 'invalid price currency %',v_currency;
    end if;
    v_price:=(p_prices->>v_currency)::numeric;
    if v_price>100000000 then raise exception 'price too large'; end if;
  end loop;

  if p_product_id is null then
    insert into public.products(slug,category_id,product_type,status,featured)
    values(p_slug,v_category_id,p_type,p_status,p_featured) returning id into v_product_id;
  else
    update public.products
      set slug=p_slug,category_id=v_category_id,product_type=p_type,status=p_status,featured=p_featured,updated_at=now()
      where id=p_product_id returning id into v_product_id;
    if v_product_id is null then raise exception 'product not found'; end if;
  end if;

  for v_locale in select unnest(array['th','en']) loop
    v_content:=p_locales->v_locale;
    insert into public.product_localizations(product_id,locale,name,summary,description_md)
    values(v_product_id,v_locale,v_content->>'name',v_content->>'summary',coalesce(v_content->>'description',''))
    on conflict(product_id,locale) do update set name=excluded.name,summary=excluded.summary,description_md=excluded.description_md;
  end loop;
  for v_currency in select unnest(array['THB','USD']) loop
    insert into public.product_prices(product_id,currency,amount_minor,license_tier,is_active)
    values(v_product_id,v_currency,(p_prices->>v_currency)::bigint,'personal',true)
    on conflict(product_id,currency,license_tier) do update set amount_minor=excluded.amount_minor,is_active=true;
  end loop;
  insert into public.audit_logs(actor_user_id,action,entity_type,entity_id,detail)
    values(p_actor_id, case when p_product_id is null then 'product.create' else 'product.update' end,
           'product',v_product_id::text,jsonb_build_object('slug',p_slug,'status',p_status));
  return v_product_id;
end; $$;
revoke all on function public.admin_upsert_catalog_product(uuid,text,text,text,text,boolean,jsonb,jsonb,uuid) from PUBLIC,anon,authenticated;
grant execute on function public.admin_upsert_catalog_product(uuid,text,text,text,text,boolean,jsonb,jsonb,uuid) to service_role;

-- Admin membership bootstrap MUST be done manually in the trusted Supabase SQL editor,
-- after owner identity is verified. Never accept an admin role from signup metadata.
-- Example (replace ID after manually confirming user):
-- INSERT INTO public.admin_members(user_id, role) VALUES ('00000000-0000-0000-0000-000000000000','owner');

-- Atomic category insert with an audit record.
create or replace function public.admin_create_category(
  p_slug text,p_label_th text,p_label_en text,p_actor_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
 if coalesce(auth.role(),'') <> 'service_role' or
    not exists(select 1 from public.admin_members where user_id=p_actor_id and role in ('owner','admin')) then
   raise exception 'administrator membership required' using errcode='42501';
 end if;
 if p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug)>80 or
    length(btrim(coalesce(p_label_th,''))) not between 1 and 100 or
    length(btrim(coalesce(p_label_en,''))) not between 1 and 100 then
   raise exception 'invalid category input';
 end if;
 insert into public.categories(slug,label_th,label_en)
 values(p_slug,p_label_th,p_label_en) returning id into v_id;
 insert into public.audit_logs(actor_user_id,action,entity_type,entity_id,detail)
 values(p_actor_id,'category.create','category',v_id::text,jsonb_build_object('slug',p_slug));
 return v_id;
end;$$;
revoke all on function public.admin_create_category(text,text,text,uuid) from PUBLIC,anon,authenticated;
grant execute on function public.admin_create_category(text,text,text,uuid) to service_role;
