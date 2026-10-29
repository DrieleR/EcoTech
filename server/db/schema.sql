-- Estrutura do banco (Neon / PostgreSQL). Pode rodar mais de uma vez:
-- tudo usa "if not exists". Aplicar com: npm run db:setup

create table if not exists usuarios (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  email       text not null unique,
  perfil      text not null default 'participante' check (perfil in ('participante', 'admin')),
  -- null = conta sem senha definida (não consegue entrar até redefinir)
  senha_hash  text,
  criado_em   timestamptz not null default now()
);

-- Sessões de login. Guardamos só o hash do token: quem ler o banco não
-- consegue usar os tokens para entrar na conta de ninguém.
create table if not exists sessoes (
  token_hash  text primary key,
  usuario_id  uuid not null references usuarios(id) on delete cascade,
  expira_em   timestamptz not null,
  criado_em   timestamptz not null default now()
);
create index if not exists sessoes_usuario_idx on sessoes (usuario_id);

create table if not exists redefinicoes_senha (
  token_hash  text primary key,
  usuario_id  uuid not null references usuarios(id) on delete cascade,
  expira_em   timestamptz not null
);

-- Uma linha só: os dados do evento que o admin edita
create table if not exists evento (
  id                      int primary key default 1 check (id = 1),
  nome                    text not null,
  data_inicio             date not null,
  data_fim                date not null,
  horario                 text not null,
  local                   text not null,
  valor_inscricao         numeric(10, 2) not null check (valor_inscricao >= 0),
  inclui_na_inscricao     text not null,
  prazo_troca_atividades  date not null,
  prazo_reembolso         date not null
);

create table if not exists atividades (
  id           uuid primary key default gen_random_uuid(),
  titulo       text not null,
  tipo         text not null check (tipo in ('Minicurso', 'Oficina')),
  palestrante  text not null,
  dia          int not null check (dia >= 1),
  inicio       time not null,
  fim          time not null check (fim > inicio),
  local        text not null,
  nivel        text not null check (nivel in ('Iniciante', 'Intermediário', 'Avançado', 'Todos os níveis')),
  vagas        int not null check (vagas >= 1),
  valor        numeric(10, 2) not null default 0 check (valor >= 0),
  criado_em    timestamptz not null default now()
);

create sequence if not exists inscricoes_numero_seq start 1;

-- Nome e e-mail ficam em "usuarios"; aqui o resto dos dados da inscrição
create table if not exists inscricoes (
  id             uuid primary key default gen_random_uuid(),
  numero         text not null unique,
  usuario_id     uuid not null unique references usuarios(id) on delete cascade,
  criada_em      timestamptz not null default now(),
  status         text not null default 'confirmada' check (status in ('confirmada', 'cancelada')),
  cancelada_em   timestamptz,
  reembolso      boolean,
  telefone       text not null,
  categoria      text not null check (categoria in ('Estudante', 'Professor', 'Profissional')),
  detalhes       jsonb not null default '{}',
  pcd            boolean not null default false,
  recursos       text[] not null default '{}',
  outro_recurso  text not null default '',
  valor_total    numeric(10, 2) not null
);

create table if not exists inscricao_atividades (
  inscricao_id  uuid not null references inscricoes(id) on delete cascade,
  -- "restrict": não dá para apagar uma atividade que tem inscritos
  atividade_id  uuid not null references atividades(id) on delete restrict,
  primary key (inscricao_id, atividade_id)
);
create index if not exists inscricao_atividades_atividade_idx on inscricao_atividades (atividade_id);

-- Pagamento (adicionado depois): a inscrição nasce "pendente" e vira
-- "confirmada" quando o pagamento é aprovado
alter table inscricoes add column if not exists pago_em timestamptz;
-- Hash do token do QR Code de pagamento (o token puro só existe no QR)
alter table inscricoes add column if not exists pagamento_token_hash text unique;
alter table inscricoes alter column status set default 'pendente';
alter table inscricoes drop constraint if exists inscricoes_status_check;
alter table inscricoes add constraint inscricoes_status_check
  check (status in ('pendente', 'confirmada', 'cancelada'));

-- Não há mais limite de minicursos por pessoa
alter table evento drop column if exists limite_minicursos;

-- Personalização do site (identidade, home, menu) e histórico de eventos
alter table evento add column if not exists site jsonb;
alter table evento add column if not exists status text not null default 'ativo';
alter table evento drop constraint if exists evento_status_check;
alter table evento add constraint evento_status_check check (status in ('ativo', 'encerrado'));

create table if not exists eventos_anteriores (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  encerrado_em timestamptz not null default now(),
  data_inicio  date not null,
  data_fim     date not null,
  local        text not null,
  inscritos    int not null,
  atividades   int not null,
  site         jsonb
);

-- Conteúdo da página Sobre (texto, carrossel, parceiros, patrocinadores)
alter table evento add column if not exists sobre jsonb;
