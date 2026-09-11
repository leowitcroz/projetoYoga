# LIFE

Yoga · Ayurveda · Ciência · Filosofia. App para celular (Android e iOS), site web e painel de professores, com um motor de recomendação por regras.

- Especificação e escopo: [docs/plano-de-desenvolvimento.md](docs/plano-de-desenvolvimento.md)
- Decisões tomadas: [docs/decisoes.md](docs/decisoes.md)

## Estrutura

```
apps/
  app/      Vue 3 + Ionic + Capacitor: app dos alunos (web, Android, iOS)
  admin/    Vue 3 + PrimeVue: painel de professores e admin
  api/      NestJS + Prisma + PostgreSQL
packages/
  shared/   Tipos compartilhados entre todos
  motor/    Motor LIFE (TypeScript puro)
docs/       Especificações, matriz técnica, política de privacidade
```

## Requisitos

- **Node 24** (veja `.nvmrc`)
- **npm 11** ou mais novo (vem com o Node 24)
- **Docker Desktop** (para o banco de dados local)

> **Windows:** se `npm --version` mostrar 10.x, uma versão antiga do npm instalada globalmente está na frente da que vem com o Node. Isso quebra o `npm install` (erro `Cannot read properties of null (reading 'edgesOut')`). Para corrigir, rode uma vez: `npm install -g npm@11`.

## Primeira vez

```bash
npm install          # instala tudo e compila packages/shared e packages/motor
npm run db:up        # sobe o PostgreSQL no Docker
```

Copie os arquivos de exemplo de variáveis de ambiente:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/app/.env.example apps/app/.env
cp apps/admin/.env.example apps/admin/.env
```

## Rodar

| Comando | O que faz | Endereço |
|---|---|---|
| `npm run dev:api` | API em modo desenvolvimento | http://localhost:3100/health |
| `npm run dev:app` | App dos alunos no navegador | http://localhost:5173 |
| `npm run dev:admin` | Painel | http://localhost:5174 |
| `npm run db:up` / `npm run db:down` | Liga / desliga o banco | `localhost:5433` |

As portas 3100 (API) e 5433 (banco) foram escolhidas para não conflitar com outros projetos que usam 3000 e 5432.

Depois de mudar algo em `packages/shared` ou `packages/motor`, rode `npm run build:packages` para os apps enxergarem a mudança.

## Verificar antes de subir

```bash
npm run lint         # ESLint em todo o projeto
npm run format       # formata com Prettier
npm run typecheck    # TypeScript em todos os projetos
npm test             # testes de todos os projetos
npm run build        # build completo
```

A CI no GitHub Actions roda tudo isso a cada push na `main` e em cada pull request.

## Fluxo de trabalho

- Siga o plano: trabalhe só na fase atual e marque `[x]` nas tarefas concluídas.
- A partir da Fase 1, cada tarefa em uma branch própria, com pull request para a `main`:
  - branch: `feat/F1.6-filtro-seguranca`
  - commit: `feat(MOT-01): filtro de segurança` ou `feat(F1.6): ...`
- A `main` deve estar sempre com a CI verde.

**Celular ↔ computador:** no computador, `git pull` antes de começar e `git push` ao terminar. No celular, abra [claude.ai/code](https://claude.ai/code) e selecione este repositório.
