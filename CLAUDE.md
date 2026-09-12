# LIFE — instruções para o Claude

App de Yoga, Ayurveda, Ciência e Filosofia (celular + web) com motor de recomendação por regras.

## Antes de qualquer tarefa

1. Leia [docs/plano-de-desenvolvimento.md](docs/plano-de-desenvolvimento.md). Ele é a especificação (SDD) e define o escopo.
2. Leia [docs/progresso.md](docs/progresso.md) para saber onde o projeto parou.
3. Consulte [docs/decisoes.md](docs/decisoes.md) para decisões já tomadas.

## Regras de escopo

- **Trabalhe só na fase atual** (veja o Status na seção 7.2 do plano). Não adiante tarefas de fases futuras.
- Ao terminar uma tarefa, marque `[x]` nela no plano e acrescente uma linha em [docs/progresso.md](docs/progresso.md).
- **Só implemente o que está no plano.** Se o pedido não estiver lá, diga isso e proponha registrar na seção 12 (Pedidos de mudança) antes de programar.
- Para mudar um comportamento, atualize primeiro o plano (nova versão no Changelog) e depois o código.
- Commits citam o ID do requisito: `feat(CHK-03): ...`, `fix(MOT-01): ...`.
- Siga a Definição de pronto (seção 10 do plano).
- As regras da Matriz Técnica mantêm seus IDs (`SEG-001`, `EST-005`, `APR-007`...) no código e nos testes.

## Regras técnicas

- Stack: Vue 3 + Ionic + Capacitor (`apps/app`), Vue 3 + PrimeVue (`apps/admin`), NestJS + Prisma + PostgreSQL (`apps/api`), motor em TypeScript puro (`packages/motor`).
- `packages/motor` não importa framework, banco nem HTTP. É determinístico.
- Dados de saúde nunca aparecem em logs nem em endpoints do painel.
- Textos do app em português, seguindo as regras de linguagem (seção 9 do plano).

## Comunicação

- Responder em português (pt-BR).
