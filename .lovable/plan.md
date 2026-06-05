## Visão geral

Expandir o painel administrativo com novos módulos e migrar os dados hard-coded das Regiões/Clubes para o banco, com hierarquia **Região → Divisão → Clube**. Adicionar CRUD de Notícias, Eventos, Projetos e Ex-Governadores. O site público passa a ler tudo do banco.

## Estrutura do banco (nova migração)

Novas tabelas (todas com RLS: leitura pública, escrita só admin via `has_role`):

- **regions** — `id`, `letter` (A,B,C…), `name`, `description`, `order_index`
- **divisions** — `id`, `region_id` (FK), `code` (ex: "A1"), `name`, `description`, `order_index`
- **clubs** — `id`, `division_id` (FK), `name`, `city`, `email`, `phone`, `meetings`, `address`, `website`, `instagram`, `facebook`, `president`, `logo_url`, `order_index`
- **news** — `id`, `title`, `slug`, `excerpt`, `content`, `cover_url`, `published_at`, `published` (bool)
- **events** — `id`, `title`, `description`, `location`, `starts_at`, `ends_at`, `cover_url`
- **projects** — `id`, `title`, `description`, `content`, `cover_url`, `order_index`
- **ex_governors** — `id`, `name`, `year_label` (ex: "2020–2021"), `photo_url`, `bio`, `order_index`

Cada tabela com `created_at`, `updated_at` e trigger `touch_updated_at`.

## Painel Admin — nova navegação

Sidebar atualizada:
- Início
- Conteúdo das Páginas (já existe)
- Líderes (já existe)
- **Regiões** (hierárquico: Regiões → Divisões → Clubes)
- **Notícias**
- **Eventos**
- **Projetos**
- **Ex-Governadores**

### Fluxo Regiões (hierárquico aninhado)

```text
/admin/regioes              → lista Regiões + botão "Nova Região"
/admin/regioes/$id          → edita Região + lista Divisões dela + "Nova Divisão"
/admin/regioes/$id/divisoes/$divId  → edita Divisão + lista Clubes + "Novo Clube"
/admin/regioes/$id/divisoes/$divId/clubes/$clubId → edita Clube (todos os campos)
```

Breadcrumb em cada nível para voltar.

### Demais módulos (padrão lista + edição)

Cada um segue o mesmo padrão dos Líderes existente:
- `/admin/<modulo>` → lista + criar
- `/admin/<modulo>/$id` → editar + excluir + upload de imagem

## Site público — leitura do banco

- `/clubes` e `/clubes/regiao` → passam a buscar do banco via `useQuery`
- `/clubes/regiao/$letra` → busca região por `letter`, lista divisões e clubes
- `/noticias`, `/eventos`, `/projetos`, `/ex-governadores` → leem do banco

Manter o visual atual; trocar apenas a fonte de dados.

## Migração de dados

A migração SQL já popula as tabelas com os dados atuais hard-coded (8 regiões A–H, divisões e clubes existentes em `clubes.regiao.tsx` e `clubes.tsx`), para o site não ficar vazio.

## Detalhes técnicos

- Hooks `useRegions`, `useDivisions(regionId)`, `useClubs(divisionId)`, `useNews`, `useEvents`, `useProjects`, `useExGovernors` em `src/lib/`.
- Upload de imagens reaproveita `uploadContentImage` no bucket `site-images`.
- RLS: políticas idênticas às de `leaders` (SELECT público, ALL para admins).
- Sem mudanças em auth — admin continua sendo `ahernams@gmail.com` via trigger existente.
- Rotas seguem convenção dot-separated do TanStack.

## Ordem de execução

1. Migração SQL (cria tabelas + popula dados iniciais)
2. Hooks de dados (`src/lib/regions.ts`, `news.ts`, etc.)
3. Rotas admin (Regiões hierárquico + 4 módulos novos)
4. Atualizar sidebar `admin.tsx`
5. Migrar páginas públicas (`/clubes*`, `/noticias`, `/eventos`, `/projetos`, `/ex-governadores`) para ler do banco
