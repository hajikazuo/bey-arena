-- BeyArena - estrutura persistida e autorização.
-- Regras de torneio vivem em lib/domain e não devem ser alteradas por esta migration.

create extension if not exists pgcrypto;
create type public.papel_usuario as enum ('superadmin', 'admin', 'usuario');
create type public.papel_membro_grupo as enum ('dono', 'admin', 'membro');
create type public.formato_torneio as enum ('eliminacao_simples', 'eliminacao_dupla');
create type public.status_torneio as enum ('rascunho', 'inscricoes', 'em_andamento', 'finalizado', 'cancelado');
create type public.tipo_chave as enum ('vencedores', 'perdedores', 'grande_final');
create type public.status_partida as enum ('pendente', 'pronta', 'em_andamento', 'finalizada', 'bye');
create type public.tipo_finalizacao as enum ('spin', 'over', 'burst', 'extreme');

create table public.perfis_usuarios (
  id uuid primary key references auth.users(id) on delete restrict,
  nome text not null check (char_length(btrim(nome)) between 1 and 120),
  apelido text check (apelido is null or char_length(btrim(apelido)) between 1 and 60),
  papel public.papel_usuario not null default 'usuario',
  criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now()
);
create table public.grupos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(btrim(nome)) between 1 and 120), descricao text,
  criado_por uuid not null references public.perfis_usuarios(id) on delete restrict,
  criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now()
);
create table public.membros_grupos (
  id uuid primary key default gen_random_uuid(), grupo_id uuid not null references public.grupos(id) on delete cascade,
  usuario_id uuid not null references public.perfis_usuarios(id) on delete restrict,
  papel public.papel_membro_grupo not null default 'membro', entrou_em timestamptz not null default now(),
  unique (grupo_id, usuario_id)
);
create table public.torneios (
  id uuid primary key default gen_random_uuid(), grupo_id uuid not null references public.grupos(id) on delete restrict,
  nome text not null check (char_length(btrim(nome)) between 1 and 160), descricao text,
  formato public.formato_torneio not null, status public.status_torneio not null default 'rascunho',
  pontos_para_vencer integer not null default 4 check (pontos_para_vencer > 0),
  pontos_spin_finish integer not null default 1 check (pontos_spin_finish >= 0),
  pontos_over_finish integer not null default 2 check (pontos_over_finish >= 0),
  pontos_burst_finish integer not null default 2 check (pontos_burst_finish >= 0),
  pontos_extreme_finish integer not null default 3 check (pontos_extreme_finish >= 0),
  criado_por uuid not null references public.perfis_usuarios(id) on delete restrict,
  iniciado_em timestamptz, finalizado_em timestamptz,
  criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now(),
  check (finalizado_em is null or iniciado_em is not null), check (status <> 'finalizado' or finalizado_em is not null)
);
create table public.participantes_torneios (
  id uuid primary key default gen_random_uuid(), torneio_id uuid not null references public.torneios(id) on delete cascade,
  usuario_id uuid not null references public.perfis_usuarios(id) on delete restrict,
  cabeca_de_chave integer check (cabeca_de_chave is null or cabeca_de_chave > 0),
  colocacao_final integer check (colocacao_final is null or colocacao_final > 0), criado_em timestamptz not null default now(),
  unique (torneio_id, usuario_id), unique (id, torneio_id)
);
create table public.partidas_torneios (
  id uuid primary key default gen_random_uuid(), torneio_id uuid not null references public.torneios(id) on delete cascade,
  chave public.tipo_chave not null, rodada integer not null check (rodada > 0), posicao integer not null check (posicao > 0),
  jogador1_id uuid, jogador2_id uuid, pontos_jogador1 integer not null default 0 check (pontos_jogador1 >= 0),
  pontos_jogador2 integer not null default 0 check (pontos_jogador2 >= 0), vencedor_id uuid, perdedor_id uuid,
  proxima_partida_vencedor_id uuid, slot_vencedor smallint check (slot_vencedor is null or slot_vencedor in (1, 2)),
  proxima_partida_perdedor_id uuid, slot_perdedor smallint check (slot_perdedor is null or slot_perdedor in (1, 2)),
  status public.status_partida not null default 'pendente', iniciada_em timestamptz, finalizada_em timestamptz, criada_em timestamptz not null default now(),
  unique (torneio_id, chave, rodada, posicao), unique (id, torneio_id),
  foreign key (jogador1_id, torneio_id) references public.participantes_torneios(id, torneio_id) on delete restrict,
  foreign key (jogador2_id, torneio_id) references public.participantes_torneios(id, torneio_id) on delete restrict,
  foreign key (vencedor_id, torneio_id) references public.participantes_torneios(id, torneio_id) on delete restrict,
  foreign key (perdedor_id, torneio_id) references public.participantes_torneios(id, torneio_id) on delete restrict,
  foreign key (proxima_partida_vencedor_id, torneio_id) references public.partidas_torneios(id, torneio_id) on delete restrict,
  foreign key (proxima_partida_perdedor_id, torneio_id) references public.partidas_torneios(id, torneio_id) on delete restrict,
  check (jogador1_id is null or jogador1_id <> jogador2_id), check (vencedor_id is null or vencedor_id <> perdedor_id),
  check (status <> 'bye' or vencedor_id is null or jogador1_id is not null or jogador2_id is not null)
);
create table public.batalhas_partidas (
  id uuid primary key default gen_random_uuid(), partida_id uuid not null references public.partidas_torneios(id) on delete cascade,
  sequencia integer not null check (sequencia > 0), vencedor_id uuid not null references public.participantes_torneios(id) on delete restrict,
  tipo_finalizacao public.tipo_finalizacao not null, pontos_concedidos integer not null check (pontos_concedidos >= 0),
  criada_em timestamptz not null default now(), unique (partida_id, sequencia)
);

create index membros_grupos_usuario_idx on public.membros_grupos(usuario_id);
create index torneios_grupo_idx on public.torneios(grupo_id);
create index torneios_criado_por_idx on public.torneios(criado_por);
create index participantes_torneios_usuario_idx on public.participantes_torneios(usuario_id);
create index partidas_torneios_torneio_idx on public.partidas_torneios(torneio_id);
create index batalhas_partidas_partida_idx on public.batalhas_partidas(partida_id);
create index batalhas_partidas_vencedor_idx on public.batalhas_partidas(vencedor_id);

alter table public.perfis_usuarios enable row level security;
alter table public.grupos enable row level security;
alter table public.membros_grupos enable row level security;
alter table public.torneios enable row level security;
alter table public.participantes_torneios enable row level security;
alter table public.partidas_torneios enable row level security;
alter table public.batalhas_partidas enable row level security;

create policy perfis_select_autenticados on public.perfis_usuarios for select to authenticated using (true);
create policy perfil_insert_proprio on public.perfis_usuarios for insert to authenticated with check (id = auth.uid());
create policy perfil_update_proprio on public.perfis_usuarios for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy grupos_select_membros on public.grupos for select to authenticated using (exists (select 1 from public.membros_grupos mg where mg.grupo_id = id and mg.usuario_id = auth.uid()));
create policy grupos_insert_proprio on public.grupos for insert to authenticated with check (criado_por = auth.uid());
create policy grupos_update_administradores on public.grupos for update to authenticated using (exists (select 1 from public.membros_grupos mg where mg.grupo_id = id and mg.usuario_id = auth.uid() and mg.papel in ('dono', 'admin')));
create policy grupos_delete_dono on public.grupos for delete to authenticated using (exists (select 1 from public.membros_grupos mg where mg.grupo_id = id and mg.usuario_id = auth.uid() and mg.papel = 'dono'));
create policy membros_select_proprios on public.membros_grupos for select to authenticated using (usuario_id = auth.uid());
create policy membros_insert_proprios on public.membros_grupos for insert to authenticated with check (usuario_id = auth.uid());
create policy membros_update_proprios on public.membros_grupos for update to authenticated using (usuario_id = auth.uid()) with check (usuario_id = auth.uid() and papel <> 'dono');
create policy membros_delete_proprios on public.membros_grupos for delete to authenticated using (usuario_id = auth.uid() and papel <> 'dono');
create policy torneios_select_membros on public.torneios for select to authenticated using (exists (select 1 from public.membros_grupos mg where mg.grupo_id = grupo_id and mg.usuario_id = auth.uid()));
create policy torneios_insert_membros on public.torneios for insert to authenticated with check (criado_por = auth.uid() and exists (select 1 from public.membros_grupos mg where mg.grupo_id = torneios.grupo_id and mg.usuario_id = auth.uid()));
create policy torneios_update_criador on public.torneios for update to authenticated using (criado_por = auth.uid() and status not in ('finalizado', 'cancelado')) with check (criado_por = auth.uid());
create policy torneios_delete_criador on public.torneios for delete to authenticated using (criado_por = auth.uid() and status = 'rascunho');
create policy participantes_select_membros on public.participantes_torneios for select to authenticated using (exists (select 1 from public.torneios t join public.membros_grupos mg on mg.grupo_id = t.grupo_id where t.id = torneio_id and mg.usuario_id = auth.uid()));
create policy participantes_write_criador on public.participantes_torneios for all to authenticated using (exists (select 1 from public.torneios t where t.id = torneio_id and t.criado_por = auth.uid() and t.status in ('rascunho', 'inscricoes'))) with check (exists (select 1 from public.torneios t where t.id = torneio_id and t.criado_por = auth.uid() and t.status in ('rascunho', 'inscricoes')));
create policy partidas_select_membros on public.partidas_torneios for select to authenticated using (exists (select 1 from public.torneios t join public.membros_grupos mg on mg.grupo_id = t.grupo_id where t.id = torneio_id and mg.usuario_id = auth.uid()));
create policy partidas_write_criador on public.partidas_torneios for all to authenticated using (exists (select 1 from public.torneios t where t.id = torneio_id and t.criado_por = auth.uid() and t.status not in ('finalizado', 'cancelado'))) with check (exists (select 1 from public.torneios t where t.id = torneio_id and t.criado_por = auth.uid()));
create policy batalhas_select_membros on public.batalhas_partidas for select to authenticated using (exists (select 1 from public.partidas_torneios p join public.torneios t on t.id = p.torneio_id join public.membros_grupos mg on mg.grupo_id = t.grupo_id where p.id = partida_id and mg.usuario_id = auth.uid()));
