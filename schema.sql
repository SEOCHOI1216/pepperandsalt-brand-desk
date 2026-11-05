-- Supabase > SQL Editor 에 통째로 붙여넣고 Run
create table if not exists docs(
  collection text not null, id text not null, data jsonb not null default '{}',
  primary key(collection,id));
alter table docs enable row level security;
create policy "team all" on docs for all to authenticated using(true) with check(true);
alter publication supabase_realtime add table docs;
insert into storage.buckets(id,name,public) values('files','files',false) on conflict do nothing;
create policy "team files" on storage.objects for all to authenticated
  using(bucket_id='files') with check(bucket_id='files');
