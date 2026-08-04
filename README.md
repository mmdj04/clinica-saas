# Clinica SaaS

Plataforma completa de gestão para clínicas médicas, odontológicas e de psicologia — multi-tenancy, com interface moderna e design inspirado em Linear/Stripe/Vercel.

## Tech Stack

| Camada | Tecnologias |
|--------|------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js Server Actions + API Routes, Zod validation |
| Banco | PostgreSQL + Prisma ORM |
| Auth | Better Auth (multi-tenancy, session-based) |
| Estado | Zustand (client), TanStack Query (server) |
| Tabelas | TanStack Table v8 |
| Gráficos | Recharts |
| Animações | Framer Motion |
| Infra | Docker, Docker Compose, GitHub Actions |
| Testes | Vitest (unit), Playwright (e2e), Storybook (docs) |

## Funcionalidades

- **Dashboard** — KPIs, agenda do dia, receita mensal, atividade recente
- **Pacientes** — CRUD completo, tags, busca, histórico
- **Agenda** — Visualização diária/semanal/mensal, lista de espera
- **Financeiro** — Fluxo de caixa, receitas/despesas, categorias, comissões
- **Prontuário** — Anamnese, evolução, receitas médicas, exames, anexos
- **Administração** — Membros, especialidades, salas, profissionais, configurações, log de auditoria
- **Relatórios** — Pacientes, agendamentos, financeiro, cancelamentos com gráficos e exportação

## Arquitetura

```
src/
├── app/                  # Next.js App Router (rotas de página)
├── components/
│   ├── ui/               # 30+ componentes shadcn/ui
│   ├── shared/           # DataTable, PageHeader, EmptyState, etc.
│   └── layout/           # AppShell, Sidebar, Topbar, CommandMenu
├── config/               # Navigation, constants
├── features/             # Feature-based modules
│   ├── dashboard/
│   ├── pacientes/
│   ├── appointments/
│   ├── finance/
│   ├── prontuario/
│   ├── admin/
│   ├── reports/
│   └── organization/
├── lib/                  # Core utilities (auth, prisma, permissions, etc.)
├── providers/            # React Context providers
└── types/                # Shared TypeScript types
```

## Setup Local

### Pré-requisitos

- Node.js 20+
- Docker + Docker Compose
- npm

### Passo a passo

```bash
# 1. Clonar
git clone https://github.com/mmdj04/clinica-saas.git
cd clinica-saas

# 2. Instalar dependências
npm install --legacy-peer-deps

# 3. Aprovar scripts pós-instalação
npm install-scripts approve esbuild sharp @prisma/client @prisma/engines prisma

# 4. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com suas credenciais (Supabase, Better Auth secret, etc.)

# 5. Subir PostgreSQL via Docker
docker compose up -d

# 6. Rodar migrations
npx prisma migrate dev

# 7. Popular banco com dados demo
npm run seed

# 8. Iniciar dev server
npm run dev
```

Acesse: **http://localhost:3000**

**Login demo:** `demo@clinica.com.br` / `senha-demo-123`

### Variáveis de Ambiente (.env.local)

```env
# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# Supabase (opcional — para upload de arquivos)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinic_saas
```

## Comandos

```bash
npm run dev          # Dev server
npm run build        # Build de produção
npm run start        # Iniciar em produção
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run test         # Vitest (unit tests)
npm run test:e2e     # Playwright (e2e tests)
npm run storybook    # Storybook
npm run seed         # Popular banco com dados demo
```

## Docker

```bash
# Desenvolvimento
docker compose up -d

# Produção
docker build -t clinica-saas .
docker run -p 3000:3000 clinica-saas
```

## Estrutura de Permissões (RBAC)

| Papel | Descrição |
|-------|-----------|
| `owner` | Controle total sobre a organização |
| `admin` | Gestão de membros e configurações |
| `professional` | Acesso a prontuário, agenda e pacientes |
| `receptionist` | Agenda, pacientes e financeiro básico |
| `billing` | Acesso completo ao módulo financeiro |

## Licença

MIT
