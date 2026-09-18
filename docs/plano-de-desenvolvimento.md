# LIFE 1.0 — Plano de Desenvolvimento (SDD)

**Versão do documento:** 1.9 · **Data:** 10/09/2026
**Fontes:** Documento Mestre Motor LIFE 1.0 · Matriz Técnica 1.1 · Storytelling (Ana e Júlia) · telas de referência · [decisoes.md](decisoes.md)

---

## 0. Regras deste documento

Este é o documento-base do desenvolvimento. Ele define **o que entra** no LIFE 1.0 e **o que não entra**.

1. **O que não está aqui está fora do escopo.** Ideia nova vai para a seção 12 (Pedidos de mudança) e só entra depois de aprovada e escrita neste documento.
2. **Primeiro a especificação, depois o código.** Para mudar um comportamento, primeiro atualize este documento (nova versão no Changelog) e só então programe.
3. **Todo requisito tem um ID** (ex.: `CHK-03`), e toda tarefa de fase também (ex.: `F2.5`). Commits e PRs citam o ID: `feat(CHK-03): reabrir segurança quando houver dor`.
4. **Cada requisito tem critérios de aceite.** Ele só está pronto quando todos os critérios passam (seção 10, Definição de pronto).
5. **As regras da Matriz Técnica mantêm seus IDs** (`SEG-001`, `EST-005`, `APR-007`…) no código, nos testes e nos dados.

---

## 1. Objetivo do LIFE 1.0

Validar o valor da personalização: mostrar que recomendar a prática certa para a pessoa, no dia certo, aumenta a adesão e a continuidade. Tudo isso **sem usar IA generativa** em decisões de segurança ou saúde.

**Como vamos medir** (Documento Mestre, seção 13):

| Métrica | Pergunta |
|---|---|
| Taxa de conclusão | As recomendações cabem na rotina? |
| Troca de recomendação | O motor está entendendo estado e preferência? |
| Conclusão por duração | Qual duração funciona para cada perfil? |
| Retorno semanal | O LIFE cria continuidade? |
| Avanço em trilhas | O aprendizado mantém progressão? |
| Feedback de intensidade | A demanda das práticas está adequada? |
| Uso por horário | A rotina real difere da declarada? |
| Consumo cruzado | Prática leva a Aprender, Ayurveda e Cozinha? |

---

## 2. Escopo

### 2.1 Dentro do LIFE 1.0

- Cadastro e login com e-mail e senha.
- Onboarding estruturado (6 blocos) com consentimento separado para dados de saúde.
- Check-in diário rápido ("como você está hoje?"), a porta de entrada de todo dia.
- **Motor LIFE** por regras e pesos configuráveis: segurança, filtros, ranking, modificadores, explicação.
- Motor de Jornada básico: objetivo estratégico, meta semanal, progressão por trilha, dia de recuperação, descoberta.
- Perguntas adaptativas simples (CTX-001 a CTX-005) e Home dinâmica.
- As 6 áreas permanentes do app: **Hoje, Praticar, Aprender, Ayurveda, Cozinha, Eu** (Documento Mestre, seção 2).
- Player de vídeo e áudio, com **áudio tocando com a tela bloqueada**.
- Feedback pós-prática e histórico de uso.
- Aprendizado gradual do sistema (APR-001 a APR-008).
- Painel de professores: catálogo, fichas, tags, trilhas, receitas e **aprovação pelo professor master**.
- Painel admin: pesos e regras do motor (versionados), papéis e métricas agregadas.
- Lembretes locais de prática.
- Privacidade (LGPD): consentimentos, exportar dados, apagar dados de saúde, excluir conta.
- Plataformas: **web** (navegador), **Android** e **iOS**, a partir do mesmo código.
- Idioma: **somente português**.

### 2.2 Fora do LIFE 1.0

| Item | Motivo / origem |
|---|---|
| Mensalidade e pagamento | Decisão de 10/09: ainda não vamos cobrar |
| Login com Google ou Facebook | Decisão: fica para depois |
| Uso offline e download de aulas | Decisão: não precisa por enquanto |
| Certificados | Decisão: fora do MVP |
| Outros idiomas | Decisão: só português |
| Questionários adaptativos sofisticados | Documento Mestre, seção 12 |
| Integração com wearables e sensores | Documento Mestre, seção 12 |
| Modelos preditivos e de propensão | Documento Mestre, seção 12 |
| Classificação automática de conteúdo | Documento Mestre, seção 12 |
| Montagem dinâmica de sequências | Documento Mestre, seção 12 |
| Tutor conversacional / chat com IA | Documento Mestre, seção 12 |
| Personalização ayurvédica longitudinal avançada | Documento Mestre, seção 12 |
| Planejamento alimentar e integrações externas | Documento Mestre, seção 12 |
| Comunidade, desafios sociais | Documento Mestre, seção 12 |
| Notificações push enviadas pelo servidor | Só lembretes locais no 1.0 |

---

## 3. Papéis

| Papel | Onde | O que pode |
|---|---|---|
| **Aluno** | App | Usar o app. Único que vê os próprios dados de saúde |
| **Professor** | Painel | Criar e catalogar os próprios conteúdos, definir trilhas, enviar para revisão, ver métricas agregadas dos próprios conteúdos |
| **Professor master** | Painel | Tudo do professor + aprovar ou devolver conteúdos de qualquer professor. Hoje: Marcos Crozetta |
| **Admin** | Painel | Gerenciar usuários e papéis, pesos e regras do motor, métricas gerais |

**Regra de privacidade:** nenhum papel do painel vê dados de saúde individuais de alunos.

---

## 4. Arquitetura

### 4.1 Estrutura do repositório (monorepo com npm workspaces)

```
projetoYoga/
├── apps/
│   ├── app/        Vue 3 + Ionic + Capacitor → web, Android, iOS (alunos)
│   ├── admin/      Vue 3 + PrimeVue → painel de professores e admin
│   └── api/        NestJS + Prisma + PostgreSQL
├── packages/
│   ├── motor/      Motor LIFE em TypeScript puro, sem dependências de framework
│   └── shared/     Tipos, enums e DTOs usados por todos
├── docs/           Especificações e decisões
└── CLAUDE.md       Regras para sessões do Claude
```

### 4.2 Tecnologias

| Camada | Escolha | Observação |
|---|---|---|
| Linguagem | TypeScript 6.0 em tudo | O typescript-eslint ainda não suporta o TypeScript 7 |
| App | Vue 3 (`<script setup>`), Ionic Vue, Capacitor, Pinia, Vue Router | |
| Painel | Vue 3, PrimeVue, Pinia | |
| API | NestJS 12 (ESM), Prisma 7, PostgreSQL 16 | Prisma gera o cliente em `apps/api/src/generated/prisma`; API na porta 3100 |
| Autenticação | JWT (access curto + refresh), senha com argon2 | |
| Motor | `packages/motor`, função pura | Recebe dados + configuração e devolve o resultado |
| Testes | Vitest em todos os projetos | O Nest 12 já vem com Vitest |
| Áudio em segundo plano | Plugin Capacitor (a escolher na Fase 4) | |
| Lembretes | `@capacitor/local-notifications` | |
| Vídeo/áudio (hospedagem) | Serviço de streaming, a escolher na Fase 3 | Bunny, Mux ou Cloudflare Stream |
| Banco local | PostgreSQL 16 via Docker (`docker-compose.yml`), porta 5433 | Decidido na Fase 0 |
| CI | GitHub Actions: lint + testes a cada push | |

### 4.3 Princípios de arquitetura

- **O motor não conhece banco nem HTTP.** A API carrega dados e configuração, chama o motor e salva o resultado.
- **Mesma entrada, mesma saída.** O motor é determinístico: horário e sorteio de descoberta entram como parâmetros.
- **Configuração versionada.** Pesos e regras ficam no banco com número de versão. Cada recomendação guarda a versão usada.
- **Toda recomendação é auditável.** Salvamos candidatos, filtros aplicados, pontuação por critério, modificadores e a explicação.
- **Dados de saúde isolados.** Ficam em tabelas próprias, nunca aparecem em logs e não são expostos a nenhum endpoint do painel.

---

## 5. Modelo de dados (visão geral)

| Entidade | Conteúdo principal |
|---|---|
| `User` | nome completo, e-mail, telefone, hash da senha, papel, status (data de nascimento depende de P-01) |
| `Consent` | tipo (política, saúde, marketing), versão da política, aceito em, revogado em |
| `Profile` | objetivo principal, até 2 secundários, experiência por área, preferências de prática e estudo, formato, disponibilidade, frequência desejada, horário habitual, alergias e restrições alimentares |
| `HealthProfile` 🔒 | condições (cardiovascular, respiratória, ocular, vertigem, gestação e fase, neurológica, articular, outra), orientações profissionais prévias |
| `DailyCheckin` 🔒 | sono, energia, estresse (1–5), corpo, dor (0–10 + local), digestão, tempo disponível, horário |
| `AyurvedaAssessment` 🔒 | tipo (inicial ou semanal), respostas, Prakṛti estimada, sinais atuais |
| `ContextAnswer` 🔒 | respostas de perguntas adaptativas (ex.: refeição recente) |
| `Content` | ID (`PRAT-00142`), tipo, modalidade, título, professor, duração, nível técnico (1–5), demanda física (1–5), mídia, status de revisão |
| `ContentScores` | aderência a objetivos, adequação a estados do dia, tags ayurvédicas |
| `ContentSafety` | cargas regionais 0–3 (cervical, ombro, punho, coluna/lombar, quadril, joelho), invertida, semi-invertida, retenção respiratória, respiração rápida, bandha, risco de queda, demanda cardiovascular/respiratória, mudança rápida de posição, revisado para gestação |
| `Trail`, `TrailItem` | trilha, professor responsável, número de aulas, ordem, pré-requisitos |
| `Recipe` | ingredientes, alérgenos, tempo, dificuldade, bloco "Nutrição & Fisiologia", bloco "Visão Ayurvédica", tags |
| `AyurvedaGuidance` | orientação curta, condições de exibição, texto "Entenda por quê" |
| `ContentReview` | conteúdo, enviado por, revisado por (master), decisão, comentário, data |
| `EngineConfig` | versão, pesos, regras SEG/EST/PER/AYU/APR/JOR/CTX, ativa desde |
| `Recommendation` | usuário, data, tipo de saída, principal, alternativa, candidatos e pontuações, versão da configuração, explicação |
| `UsageEvent` | iniciou, concluiu, interrompeu, repetiu, pulou, trocou, com duração e horário |
| `PracticeFeedback` | intensidade percebida, gostou, estado depois |
| `SavedRecipe`, `TrailProgress` | progresso e salvos do aluno |
| `AccessLog` | IP e data/hora, guardados por 6 meses |

🔒 = dado sensível (LGPD). Tabela isolada, com acesso restrito.

**Dados iniciais (seed):** todas as regras das abas 01 a 06, 11 e 12 da Matriz Técnica 1.1 viram a `EngineConfig` versão 1.

---

## 6. Requisitos por módulo

### AUTH — Conta

| ID | Requisito | Critérios de aceite |
|---|---|---|
| AUTH-01 | Cadastro com **nome completo, e-mail, telefone e senha** | Acontece **no fim do onboarding** (depois das perguntas), na tela "Seu perfil está pronto!"; senha com mínimo de 8 caracteres; e-mail único; senha salva apenas como hash argon2; telefone com DDD; aceite da política registrado em `Consent`. Data de nascimento depende de P-01 |
| AUTH-02 | Verificação de e-mail | Link com validade de 24 h; conta não verificada não acessa o app |
| AUTH-03 | Login e sessão | Token de acesso de 15 min + refresh de 30 dias; logout invalida o refresh |
| AUTH-04 | Recuperação de senha | Link por e-mail com validade de 1 h; resposta igual para e-mail existente ou não |
| AUTH-05 | Idade mínima | Bloqueia cadastro abaixo da idade mínima (**valor pendente**, P-01); menores de 18 seguem o fluxo AUTH-06 |
| AUTH-06 | Consentimento do responsável (menores de 18) | **Pendente de P-01 e revisão jurídica** |
| AUTH-07 | Excluir conta dentro do app | Apaga ou anonimiza os dados em até 30 dias; mantém só `AccessLog` pelo prazo legal |

### ONB — Onboarding

| ID | Requisito | Critérios de aceite |
|---|---|---|
| ONB-01 | Objetivos | 1 principal obrigatório + até 2 secundários, entre: reduzir estresse, melhorar sono, mobilidade/flexibilidade, força, meditação/concentração, filosofia/Ayurveda/fisiologia, formação profissional |
| ONB-02 | Experiência por área | Āsanas, Prāṇāyāma, Meditação, Yoga Nidra, Kriyās, Filosofia, Ayurveda; escala Nunca/Básico/Regular/Experiente |
| ONB-03 | Consentimento de saúde | Tela própria antes das perguntas; caixa desmarcada; opção "Pular"; ao pular, o usuário entra no **modo conservador** (MOT-12) |
| ONB-04 | Saúde e segurança | Lista de condições da seção 5 (`HealthProfile`), com gestação e fase gestacional; aviso de que não substitui avaliação médica |
| ONB-05 | Ayurveda | Questionário curto de Prakṛti; resultado mostrado como estimativa, sem porcentagens |
| ONB-06 | Preferências | Modalidades, temas de estudo, formato, duração habitual, frequência semanal, horário habitual, alergias e restrições alimentares |
| ONB-07 | Perfil pronto | Resumo editável antes de entrar; tudo pode ser alterado depois em Eu |
| ONB-08 | Retomar onboarding | Se o app fechar no meio, retoma do passo em que parou |

### CHK — Check-in diário

| ID | Requisito | Critérios de aceite |
|---|---|---|
| CHK-01 | Check-in | Sono, energia e estresse (1–5); corpo (leve, bem, cansado, rígido, muito cansado); dor (sim/não); digestão (boa, normal, pesada, desconfortável, azia/queimação); tempo (10, 20, 30, 45, 60+ min) |
| CHK-02 | Horário automático | Capturado do dispositivo, no fuso do usuário |
| CHK-03 | Dor reabre a segurança | Dor = sim → pergunta local e intensidade (0–10) → motor reaplica o Bloco 1 (`SEG-R05`, `CTX-002`) |
| CHK-04 | Editar o check-in | Pode refazer no mesmo dia; a recomendação é recalculada |
| CHK-05 | Rapidez | Check-in completo sem dor em até 7 toques |
| CHK-06 | O que é diário e o que não é | O onboarding (objetivos, relação com o Yoga, saúde, Ayurveda, preferências) acontece **só na criação da conta**. Todo dia o app pergunta **apenas** o check-in: "como você está hoje?" e "quanto tempo você tem?" |
| CHK-07 | Pular o check-in | "Pular" leva à biblioteca (aba Praticar), onde a pessoa escolhe a própria aula. Sem check-in, a Home não recomenda |

### MOT — Motor LIFE (`packages/motor`)

Pipeline conforme a aba 08 da Matriz.

| ID | Requisito | Critérios de aceite |
|---|---|---|
| MOT-01 | Filtro de segurança | Aplica SEG-001 a SEG-010 e SEG-R01 a SEG-R05; status Livre/Atenção/Adaptar/Bloquear; bloqueado nunca volta pelo score; experiência não neutraliza segurança (SEG-R01) |
| MOT-02 | Conteúdo não aprovado | Só conteúdo com status "aprovado" é candidato à recomendação automática |
| MOT-03 | Filtro de tempo | Duração ≤ tempo disponível (não oferecer 32 min para 30 min) |
| MOT-04 | Filtro de nível e pré-requisitos | Por área de experiência (PER-003) |
| MOT-05 | Estado funcional | Classifica em recuperação, tensão, ativação, disponibilidade ou desaceleração (Documento Mestre, seção 5) |
| MOT-06 | Score base 0–100 | Pesos: estado 30, objetivo principal 25, secundários 10, perfil 10, Ayurveda 10, preferências 10, histórico 5 (lidos da `EngineConfig`). O objetivo vem do **perfil** (definido no cadastro, revisto a cada 30–45 dias); o que muda todo dia é o estado (CHK-01) |
| MOT-07 | Modificadores | Continuidade +10; repetição ontem −15; últimos 3 dias −8; descoberta em 10–15% das sugestões secundárias; horário (EST-010/011) |
| MOT-08 | Saída Prática Hoje | Principal + alternativa de natureza diferente |
| MOT-09 | Explicação | Texto gerado por template a partir dos critérios de maior peso; linguagem da seção 9 |
| MOT-10 | Auditoria | Devolve candidatos, filtros, pontuação por critério, modificadores e versão da configuração |
| MOT-11 | Casos de aceite | **T01 (Ana), T02 (Ricardo) e T03 (Helena)** da aba 13 viram testes automatizados e passam |
| MOT-12 | Modo conservador | Sem dados de saúde: exclui conteúdos com invertidas, retenções e demanda alta (≥ 3) da recomendação automática |
| MOT-13 | Sinais de alerta | Mecanismo SEG-R04 pronto (interrompe o fluxo e orienta avaliação); **lista pendente, P-02** |
| MOT-14 | Persistência de sintoma | SEG-R03 com limite configurável por tipo de sintoma; **valores pendentes, P-02** |
| MOT-15 | Aprenda Hoje | Etapa 7: próxima aula da trilha atual ou conteúdo relacionado à prática do dia |
| MOT-16 | Ayurveda Hoje | Etapa 8: uma orientação; não exibe se a confiança for baixa |
| MOT-17 | Cozinha Hoje | Etapa 9: alergia e restrição são filtros obrigatórios; ranking por objetivo, digestão, Ayurveda e horário |
| MOT-18 | Pergunta adaptativa | CTX-001: pergunta refeição recente só quando a resposta muda a decisão |
| MOT-19 | Jornada | JOR-001 a JOR-006: objetivo estratégico mantido em dia de recuperação; meta semanal sem punição; progressão por critérios |
| MOT-20 | Aprendizado do sistema | APR-001 a APR-008: preferência observada a partir do histórico, respeitando ocorrências mínimas, recência, efeito máximo e regras de proteção; um evento isolado nunca muda o perfil |

### HOME — Hoje

| ID | Requisito | Critérios de aceite |
|---|---|---|
| HOME-01 | Check-in primeiro | Sem check-in no dia, a Home pede o check-in antes de recomendar |
| HOME-02 | Prática Hoje em destaque | Principal com botão "Iniciar prática" + alternativa abaixo |
| HOME-03 | "Por que esta prática?" | Mostra a explicação de MOT-09 |
| HOME-04 | Cards secundários | Aprenda Hoje, Ayurveda Hoje e Cozinha Hoje, menores que a prática |
| HOME-05 | Home dinâmica | Após prática concluída, muda o destaque (CTX-004); à noite com objetivo sono, favorece Nidra e relaxamento (CTX-005) |
| HOME-06 | Explore algo novo | Exibe a sugestão de descoberta quando o motor a gerar |

### PRA — Praticar

| ID | Requisito | Critérios de aceite |
|---|---|---|
| PRA-01 | Biblioteca | Āsanas, Prāṇāyāma, Meditação, Yoga Nidra, Relaxamento, Kriyās; filtros por modalidade, duração, nível e professor |
| PRA-02 | Acesso livre | Conteúdo fora da recomendação automática continua acessível; mostra aviso educativo, sem dizer que é proibido (SEG-R02) |
| PRA-03 | Player de vídeo | Streaming do provedor escolhido; pausa e retomada |
| PRA-04 | Player de áudio em segundo plano | Continua com a tela bloqueada; controles na tela de bloqueio (título, play/pause); Android com serviço em primeiro plano |
| PRA-05 | Feedback pós-prática | Muito leve / Na medida / Intensa; Gostei; Melhor / Igual / Pior; opcional |
| PRA-06 | Eventos de uso | Registra iniciou, concluiu, interrompeu (com tempo), repetiu, trocou |

### EDU — Aprender

| ID | Requisito | Critérios de aceite |
|---|---|---|
| EDU-01 | Trilhas | Lista de trilhas por tema (Fisiologia, Filosofia, Yoga, Ayurveda, Clássicos) com progresso |
| EDU-02 | Aula | Vídeo, áudio ou texto; marca como concluída |
| EDU-03 | Continue estudando | Mostra a próxima aula da trilha em andamento |
| EDU-04 | Formações | Tratadas como trilhas longas, sem certificado |

### AYV — Ayurveda

| ID | Requisito | Critérios de aceite |
|---|---|---|
| AYV-01 | Meu Ayurveda | Prakṛti estimada e tendência atual, sem precisão numérica falsa |
| AYV-02 | Check-in semanal | Apetite, intestino, sono, energia, sinais predominantes; no máximo 1 vez por semana |
| AYV-03 | Ayurveda Hoje | Uma orientação + "Entenda por quê", separando tradição de evidência biomédica |
| AYV-04 | Refazer questionário | Permite refazer a avaliação de Prakṛti |

### COZ — Cozinha

| ID | Requisito | Critérios de aceite |
|---|---|---|
| COZ-01 | Receitas | Lista com filtros; receitas com alérgeno do usuário **nunca** aparecem |
| COZ-02 | Receita | Ingredientes, preparo, tempo, dificuldade, blocos separados "Nutrição & Fisiologia" e "Visão Ayurvédica" |
| COZ-03 | Salvar receita | Salva e lista em Eu |

### EU — Eu

| ID | Requisito | Critérios de aceite |
|---|---|---|
| EU-01 | Meu progresso | Práticas, dias seguidos, tempo total, conteúdos estudados, receitas salvas, regularidade semanal × meta |
| EU-02 | Minha jornada | Frases de observação com linguagem da seção 9 |
| EU-03 | Revisão de objetivo | Entre 30 e 45 dias: "Seu objetivo principal continua sendo…? Sim / Quero ajustar" |
| EU-04 | Perfil e preferências | Editar tudo do onboarding |
| EU-05 | Privacidade | Baixar meus dados (JSON), apagar dados de saúde (revoga consentimento), excluir conta |
| EU-06 | Configurações | Lembretes (liga/desliga, horário), sair |

### NOT — Lembretes

| ID | Requisito | Critérios de aceite |
|---|---|---|
| NOT-01 | Lembrete de prática | Notificação local no horário habitual, nos dias da meta; pede permissão só quando o usuário ativa |

### ADM — Painel

| ID | Requisito | Critérios de aceite |
|---|---|---|
| ADM-01 | Login do painel | Somente professor, master e admin |
| ADM-02 | Cadastro de conteúdo | Ficha completa da aba 07 da Matriz, com campos obrigatórios validados |
| ADM-03 | Tags de segurança | Todos os campos de `ContentSafety`; conteúdo com invertida, retenção, demanda alta ou gestação exige marcação explícita |
| ADM-04 | Upload de mídia | Envio para o provedor de streaming; duração preenchida automaticamente |
| ADM-05 | Trilhas | Professor cria trilha, define número de aulas, ordem e pré-requisitos |
| ADM-06 | Fluxo de aprovação | Rascunho → Em revisão → Aprovado ou Devolvido (com comentário); **só master aprova**; editar um conteúdo aprovado gera nova revisão |
| ADM-07 | Receitas e orientações ayurvédicas | CRUD com o mesmo fluxo de aprovação |
| ADM-08 | Pesos e regras | Só admin; toda alteração cria nova versão da `EngineConfig`; permite voltar à versão anterior |
| ADM-09 | Métricas | Métricas da seção 1, agregadas; professor vê só as dos próprios conteúdos |
| ADM-10 | Usuários e papéis | Admin atribui papéis; nenhum papel vê dados de saúde individuais |

### PRIV — Privacidade e LGPD

| ID | Requisito | Critérios de aceite |
|---|---|---|
| PRIV-01 | Registro de consentimentos | Versão da política, data e hora de aceite e de revogação |
| PRIV-02 | Dados sensíveis isolados | Tabelas 🔒 sem acesso pelo painel; nunca aparecem em logs |
| PRIV-03 | Logs de acesso | IP e data/hora guardados por 6 meses e apagados depois |
| PRIV-04 | Política no app | Link visível no cadastro e em Eu |
| PRIV-05 | Criptografia | HTTPS em tudo; senhas com hash |

---

## 7. Fases de entrega

### 7.1 Regras das fases

- **Trabalhe só na fase atual.** Não adiante tarefas de fases futuras, mesmo que pareçam rápidas.
- Uma fase termina quando **todos** os critérios de saída passam. Só então a próxima começa (exceto onde a coluna "Pode rodar junto com" permite).
- Cada tarefa tem um ID (`F2.5`). Commits citam o ID da tarefa ou do requisito: `feat(F2.5): ...` ou `feat(CHK-03): ...`.
- Marque `[x]` na tarefa quando ela estiver pronta pela Definição de pronto (seção 10).
- Atualize o **Status** da fase ao começar e ao terminar.

### 7.2 Visão geral

| Fase | Entrega principal | Depende de | Pode rodar junto com | Status |
|---|---|---|---|---|
| **0 · Fundação** | Monorepo, ferramentas, CI, apps vazios rodando | — | — | Em andamento |
| **1 · Motor** | Motor LIFE completo e testado, sem telas | 0 | — | Não iniciada |
| **2 · API base** | Conta, perfil, check-in, recomendação e eventos via API | 1 | — | Não iniciada |
| **3 · Painel** | Professores catalogam, master aprova, admin ajusta pesos | 2 | 4 | Não iniciada |
| **4 · App núcleo** | Cadastro, onboarding, check-in, Hoje, Praticar e players | 2 | 3 | Não iniciada |
| **5 · App completo** | Aprender, Ayurveda, Cozinha, Eu, lembretes, privacidade, web desktop | 3 e 4 | — | Não iniciada |
| **6 · Aprendizado e métricas** | O sistema aprende com o uso; métricas no painel | 4 | 5 | Não iniciada |
| **7 · Beta fechado** | Produção, lojas em teste fechado, usuários reais | 5 e 6 | — | Não iniciada |

---

### Fase 0 · Fundação

**Status:** Em andamento (falta a CI verde no GitHub: F0.11)

**Objetivo:** deixar o repositório pronto para desenvolver, com todas as partes criadas, rodando e verificadas automaticamente a cada push.

**Tarefas**

- [x] **F0.1** Monorepo com npm workspaces: `package.json` raiz, `apps/*`, `packages/*`, `.nvmrc` com Node 24.
- [x] **F0.2** TypeScript base (`tsconfig.base.json`) compartilhado por todos os projetos.
- [x] **F0.3** ESLint + Prettier + EditorConfig com a mesma configuração para todos.
- [x] **F0.4** Scripts na raiz: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run dev:api`, `npm run dev:app`, `npm run dev:admin`.
- [x] **F0.5** `packages/shared` vazio, exportando um tipo de exemplo e com Vitest configurado.
- [x] **F0.6** `packages/motor` vazio, importando de `shared`, com Vitest configurado.
- [x] **F0.7** `apps/api` criado com Nest CLI + Prisma, com rota `GET /health` respondendo `{ status: "ok" }`.
- [x] **F0.8** `apps/app` criado com o starter de abas do Ionic Vue: 6 abas vazias (Hoje, Praticar, Aprender, Ayurveda, Cozinha, Eu).
- [x] **F0.9** `apps/admin` criado com Vite + Vue 3 + PrimeVue, com uma tela vazia.
- [x] **F0.10** Banco de dados: decidir entre Docker e Neon; criar `docker-compose.yml` (se Docker) e `.env.example` em cada app.
- [ ] **F0.11** GitHub Actions: instalar, lint, typecheck, testes e build a cada push e PR.
- [x] **F0.12** Fluxo de trabalho: a partir da Fase 1, cada tarefa em uma branch (`feat/F1.3-filtro-seguranca`) com PR para `main`; `main` sempre verde.
- [x] **F0.13** README atualizado com "como rodar" no Windows.

**Entregáveis:** repositório com as 5 partes criadas; CI verde; README com instruções.

**Critérios de saída**

- `npm install && npm run lint && npm run typecheck && npm test && npm run build` passam no PC e no GitHub Actions.
- `GET /health` da API responde; o app abre no navegador com as 5 abas; o painel abre no navegador.

**Fora desta fase:** qualquer tela real, regra de negócio, tabela do banco além do necessário para o Prisma iniciar.

---

### Fase 1 · Motor

**Status:** Não iniciada

**Objetivo:** construir o Motor LIFE completo em `packages/motor`, como função pura, provado pelos casos T01, T02 e T03, sem banco, API ou telas.

**Requisitos:** MOT-01 a MOT-19 (MOT-13 e MOT-14 só o mecanismo; as listas vêm na Fase 7).

**Tarefas**

*Tipos e configuração*
- [ ] **F1.1** Em `shared`: enums de objetivos, áreas de experiência, modalidades, tipos de conteúdo, corpo, digestão, tempo disponível, status de segurança (Livre, Atenção, Adaptar, Bloquear) e estados funcionais.
- [ ] **F1.2** Em `shared`: tipo `Conteudo` com a ficha completa da aba 07 (incluindo características usadas pelo estado do dia: intensidade, mobilidade, respiração calma, Yoga Nidra, relaxamento, ativação).
- [ ] **F1.3** Em `shared`: tipos `ContextoUsuario` (perfil, saúde, check-in, Ayurveda, histórico recente) e `ResultadoDia`.
- [ ] **F1.4** `EngineConfig` versão 1 em JSON, transcrita da Matriz 1.1: pesos (aba 05), SEG (01), EST (02), PER (03), AYU (04), APR (06), JOR (11), CTX (12) e modificadores. Cada regra mantém seu ID.
- [ ] **F1.5** Catálogo de teste (fixtures): cerca de 40 práticas fictícias cobrindo modalidades, durações, níveis, cargas, invertidas e retenções; 10 receitas com alérgenos; 10 orientações ayurvédicas; 2 trilhas.

*Pipeline (etapas da aba 08)*
- [ ] **F1.6** Segurança: MOT-01, MOT-02, MOT-12 (modo conservador), MOT-13 e MOT-14 (mecanismo com lista vazia).
- [ ] **F1.7** Filtros de tempo, nível e pré-requisitos: MOT-03, MOT-04.
- [ ] **F1.8** Estado funcional: MOT-05.
- [ ] **F1.9** Score base 0–100: MOT-06.
- [ ] **F1.10** Modificadores (continuidade, repetição, descoberta, horário): MOT-07. A descoberta usa uma semente recebida por parâmetro.
- [ ] **F1.11** Seleção de principal + alternativa: MOT-08.
- [ ] **F1.12** Explicação por templates, seguindo a seção 9: MOT-09.
- [ ] **F1.13** Objeto de auditoria completo: MOT-10.
- [ ] **F1.14** Aprenda Hoje, Ayurveda Hoje e Cozinha Hoje: MOT-15, MOT-16, MOT-17.
- [ ] **F1.15** Pergunta adaptativa: MOT-18. O motor devolve "pergunta pendente" quando a resposta muda a decisão.
- [ ] **F1.16** Jornada (objetivo estratégico, meta semanal, progressão, recuperação, diversidade): MOT-19.
- [ ] **F1.17** Função pública única: `recomendarDia(contexto, catalogo, config, { agora, semente })`.

*Testes*
- [ ] **F1.18** Um teste por regra da Matriz (SEG, EST, AYU, CTX, JOR), com o ID da regra no nome do teste.
- [ ] **F1.19** Testes de cenário T01 (Ana), T02 (Ricardo) e T03 (Helena), conforme a seção 8.
- [ ] **F1.20** Testes de garantia: conteúdo bloqueado nunca aparece em nenhuma saída; receita com alérgeno nunca aparece; mesma entrada gera sempre a mesma saída.
- [ ] **F1.21** Desempenho: catálogo de 1.200 conteúdos processado em menos de 100 ms.

**Entregáveis:** pacote `motor` publicado no workspace; `EngineConfig` v1; catálogo de teste.

**Critérios de saída**

- T01, T02 e T03 passam.
- Todas as regras SEG da Matriz têm teste.
- Cobertura de testes do `motor` ≥ 90%.
- O `motor` não importa nada de fora de `shared`.

**Fora desta fase:** banco de dados, HTTP, telas, aprendizado a partir de eventos reais (MOT-20, Fase 6), conteúdo real.

---

### Fase 2 · API base

**Status:** Em andamento (recorte antecipado: conta e onboarding, veja a seção 12)

**Objetivo:** expor pela API tudo o que o app precisa para a jornada principal, com dados reais no banco e o motor ligado.

**Requisitos:** AUTH-01 a AUTH-04, AUTH-07, CHK-01 a CHK-05, PRIV-01, PRIV-02, PRIV-03, PRIV-05.

**Tarefas**

*Banco*
- [x] **F2.1** Schema Prisma com todas as entidades da seção 5 (inclusive as do painel, para estabilizar o modelo) e migrations.
- [ ] **F2.2** Seed: `EngineConfig` v1 e catálogo de teste da Fase 1 (somente em desenvolvimento).

*Base da API*
- [x] **F2.3** Configuração por variáveis de ambiente, validação de entrada (DTOs), formato padrão de erro, CORS.
- [ ] **F2.4** Documentação automática da API (Swagger) em `/docs`, só em desenvolvimento.
- [x] **F2.5** Logger que remove campos de saúde antes de gravar (PRIV-02), com teste.
- [ ] **F2.6** Registro de acesso (IP e data/hora) e rotina que apaga registros com mais de 6 meses (PRIV-03).
- [ ] **F2.7** Limite de tentativas nas rotas de login, cadastro e recuperação de senha.

*Conta*
- [~] **F2.8** Cadastro, verificação de e-mail, login, refresh, logout, recuperação de senha: AUTH-01 a AUTH-04. **Parcial:** cadastro, login, refresh e logout prontos; verificação de e-mail (AUTH-02) e recuperação de senha (AUTH-04) continuam pendentes.
- [ ] **F2.9** Envio de e-mail em desenvolvimento com Mailpit (caixa de e-mail local); provedor real fica para a Fase 7.
- [ ] **F2.10** Excluir conta: AUTH-07.
- [x] **F2.11** Registro de consentimentos: PRIV-01.

*Aluno*
- [x] **F2.12** Perfil e onboarding: endpoints para salvar cada bloco (objetivos, experiência, preferências, Ayurveda) e retomar de onde parou.
- [x] **F2.13** Saúde em módulo separado; só aceita dados se houver consentimento de saúde ativo.
- [ ] **F2.14** Check-in diário: CHK-01 a CHK-04.
- [ ] **F2.15** Catálogo para o app: listar e detalhar conteúdos aprovados, com filtros.
- [ ] **F2.16** `GET /hoje`: carrega contexto, chama o motor, salva a `Recommendation` com auditoria e devolve o resultado.
- [ ] **F2.17** Resposta de pergunta adaptativa, que recalcula a recomendação.
- [ ] **F2.18** Eventos de uso e feedback pós-prática.

*Testes*
- [ ] **F2.19** Teste ponta a ponta: cadastro → verificação → onboarding → check-in → `/hoje` → evento de conclusão → feedback.
- [ ] **F2.20** Teste: check-in com dor reaplica a segurança (CHK-03).
- [ ] **F2.21** Teste: nenhum dado de saúde aparece nos logs.

**Entregáveis:** API rodando localmente com Swagger; banco com seed.

**Critérios de saída**

- O teste ponta a ponta F2.19 passa.
- Toda recomendação salva tem auditoria e versão da configuração.
- Os testes F2.20 e F2.21 passam.

**Fora desta fase:** rotas do painel (Fase 3), idade mínima e menores (Fase 7), exportar dados e apagar saúde (Fase 5), login social.

---

### Fase 3 · Painel

**Status:** Não iniciada

**Objetivo:** permitir que os professores cataloguem conteúdo real, que o master aprove e que o admin ajuste o motor. **Ao final desta fase, os professores já podem começar a catalogar** enquanto o app é terminado.

**Requisitos:** ADM-01 a ADM-08, ADM-10.

**Antes de começar:** decidir o provedor de vídeo e áudio (P-03).

**Tarefas**

*Base*
- [ ] **F3.1** Login do painel e controle de acesso por papel, no painel e na API: ADM-01.
- [ ] **F3.2** Layout do painel: menu lateral, lista, formulário, estados vazio e de erro.

*Catálogo*
- [ ] **F3.3** Cadastro de conteúdo com a ficha completa e validação: ADM-02.
- [ ] **F3.4** Tags de segurança com marcação obrigatória para casos sensíveis: ADM-03.
- [ ] **F3.5** Upload de mídia para o provedor escolhido, com duração preenchida automaticamente: ADM-04.
- [ ] **F3.6** Trilhas: criar, definir número de aulas, ordem e pré-requisitos: ADM-05.
- [ ] **F3.7** Receitas e orientações ayurvédicas: ADM-07.

*Aprovação*
- [ ] **F3.8** Fluxo Rascunho → Em revisão → Aprovado ou Devolvido, com comentário: ADM-06.
- [ ] **F3.9** Fila "Aguardando revisão" para o master.
- [ ] **F3.10** Editar conteúdo aprovado gera nova revisão; a versão aprovada continua no ar até a nova ser aprovada.

*Admin*
- [ ] **F3.11** Editor de pesos (soma obrigatória = 100) e de regras, com histórico de versões e botão de voltar versão: ADM-08.
- [ ] **F3.12** Usuários e papéis: ADM-10. Criar as contas do Marcos (master) e dos professores.

*Testes*
- [ ] **F3.13** Teste: professor não consegue aprovar; professor não vê conteúdo de rascunho de outro professor.
- [ ] **F3.14** Teste: nenhuma rota do painel devolve dados de saúde de alunos.
- [ ] **F3.15** Teste: conteúdo só aparece no `/hoje` depois de aprovado.

**Entregáveis:** painel funcionando; contas dos professores criadas; guia rápido de catalogação para os professores (1 página).

**Critérios de saída**

- Um professor cadastra um conteúdo real com mídia, o master aprova e o conteúdo aparece no `/hoje`.
- Mudar um peso cria uma nova versão, e as recomendações seguintes registram essa versão.
- Os testes F3.13 a F3.15 passam.
- Professores catalogando conteúdo real.

**Fora desta fase:** métricas (ADM-09, Fase 6), notificação por e-mail de aprovação, edição em massa.

---

### Fase 4 · App núcleo

**Status:** Não iniciada

**Objetivo:** entregar a jornada principal do aluno no app, do cadastro à prática com feedback, funcionando no navegador e em um Android de verdade.

**Requisitos:** ONB-01 a ONB-08, CHK-01 a CHK-05, HOME-01 a HOME-06, PRA-01 a PRA-06, PRIV-04.

**Tarefas**

*Base do app*
- [ ] **F4.1** Tema visual das telas de referência: cores (azul-marinho, verde), fontes, botões, cards, barra de abas.
- [ ] **F4.2** Cliente da API com os tipos de `shared`; tratamento de erro e de sessão expirada.
- [ ] **F4.3** Guardar tokens com armazenamento seguro no celular (plugin de secure storage), e não em armazenamento comum.
- [ ] **F4.4** Projeto Android do Capacitor gerado e rodando em um celular pelo Android Studio.

*Entrada*
- [ ] **F4.5** Tela de boas-vindas, cadastro, verificação, login, recuperação de senha e link da política: PRIV-04.
- [ ] **F4.6** Onboarding em passos, com barra de progresso, retomada e consentimento de saúde em tela própria: ONB-01 a ONB-08.

*Dia a dia*
- [ ] **F4.7** Check-in com pergunta de dor (local e intensidade): CHK-01 a CHK-05.
- [ ] **F4.8** Hoje: prática em destaque, alternativa, "Por que esta prática?", cards secundários, Explore algo novo e Home dinâmica: HOME-01 a HOME-06.
- [ ] **F4.9** Pergunta adaptativa (ex.: refeição recente) quando o `/hoje` pedir.

*Praticar*
- [ ] **F4.10** Biblioteca com filtros e aviso educativo para conteúdos fora das sugestões: PRA-01, PRA-02.
- [ ] **F4.11** Player de vídeo: PRA-03.
- [ ] **F4.12** Escolher, instalar e configurar o plugin de áudio em segundo plano; controles na tela de bloqueio: PRA-04.
- [ ] **F4.13** Feedback pós-prática e envio de eventos: PRA-05, PRA-06.

*Testes*
- [ ] **F4.14** Testes de componente nas telas de onboarding e check-in.
- [ ] **F4.15** Roteiro de teste manual no Android: jornada da Ana (T01) do começo ao fim.

**Entregáveis:** app rodando no navegador e instalado num Android de teste.

**Critérios de saída**

- Jornada do T01 completa no navegador e no Android: cadastro → onboarding → check-in → recomendação → prática → feedback → Home muda.
- Yoga Nidra continua tocando por 20 minutos com a tela bloqueada no Android, com controles na tela de bloqueio.

**Fora desta fase:** abas Aprender, Ayurveda e Eu completas (Fase 5); build de iOS (Fase 7); layout de desktop (Fase 5).

---

### Fase 5 · App completo

**Status:** Não iniciada

**Objetivo:** completar todas as áreas do app e a versão web para computador.

**Requisitos:** EDU-01 a EDU-04, AYV-01 a AYV-04, COZ-01 a COZ-03, EU-01, EU-03 a EU-06, NOT-01.

**Antes de começar:** decidir se "Minhas anotações" entra (P-06).

**Tarefas**

- [ ] **F5.1** Aprender: trilhas, aula, progresso, "Continue estudando", formações como trilhas longas: EDU-01 a EDU-04.
- [ ] **F5.2** Ayurveda: Meu Ayurveda, check-in semanal, Ayurveda Hoje com "Entenda por quê", refazer questionário: AYV-01 a AYV-04.
- [ ] **F5.3** Cozinha: lista com filtros, receita com os dois blocos, salvar: COZ-01 a COZ-03.
- [ ] **F5.4** Eu: progresso, revisão de objetivo, perfil e preferências, configurações: EU-01, EU-03, EU-04, EU-06.
- [ ] **F5.5** Privacidade: API e telas para baixar meus dados, apagar dados de saúde e excluir conta: EU-05.
- [ ] **F5.6** Lembretes locais no horário habitual: NOT-01.
- [ ] **F5.7** Versão web para computador: layout responsivo para telas grandes (conteúdo centralizado ou em duas colunas), sem quebrar o celular.
- [ ] **F5.8** Acessibilidade básica: tamanho de fonte do sistema respeitado, contraste, rótulos para leitor de tela.
- [ ] **F5.9** Revisão de todos os textos do app pelos professores master, seguindo a seção 9.

**Entregáveis:** app com as 5 áreas completas; site web usável no computador.

**Critérios de saída**

- Todas as áreas navegáveis com conteúdo real aprovado.
- Baixar dados, apagar dados de saúde e excluir conta funcionando de ponta a ponta.
- Textos revisados pelos masters.

**Fora desta fase:** "Minha jornada" com frases de observação (EU-02, Fase 6); pagamento; login social.

---

### Fase 6 · Aprendizado e métricas

**Status:** Não iniciada

**Objetivo:** fazer o sistema aprender com o uso real, devagar, e dar à equipe as métricas para validar o produto.

**Requisitos:** MOT-20, EU-02, ADM-09.

**Tarefas**

- [ ] **F6.1** Aprendizado no motor: preferência observada a partir do histórico, com ocorrências mínimas, recência, efeito máximo e regras de proteção de APR-001 a APR-008: MOT-20.
- [ ] **F6.2** Um teste por regra APR, com o ID no nome.
- [ ] **F6.3** API: montar o histórico recente de cada aluno a partir dos eventos e enviar ao motor.
- [ ] **F6.4** Minha jornada: frases de observação geradas a partir dos dados, com linguagem da seção 9: EU-02.
- [ ] **F6.5** Métricas no painel: as 8 métricas da seção 1, agregadas; professor vê só as dos próprios conteúdos: ADM-09.
- [ ] **F6.6** Simulador: gera 3 semanas de uso sintético e mostra como as recomendações mudam.

**Entregáveis:** motor com aprendizado; painel de métricas; simulador.

**Critérios de saída**

- A simulação de 3 semanas da Ana reproduz o storytelling: prioridade maior para 20 min, noite e Hatha/Yoga Nidra, e a descoberta continua aparecendo.
- Um evento isolado nunca muda a recomendação (teste).
- As 8 métricas aparecem no painel.

**Fora desta fase:** modelos preditivos, IA, ajuste automático de pesos.

---

### Fase 7 · Beta fechado

**Status:** Não iniciada

**Objetivo:** colocar o LIFE nas mãos de usuários reais, em ambiente de produção, com as pendências legais e de segurança resolvidas.

**Requisitos:** AUTH-05, AUTH-06, MOT-13 e MOT-14 (com as listas reais).

**Antes de começar:** P-01, P-02, P-04, P-05 e P-07 resolvidas.

**Tarefas**

*Pendências*
- [ ] **F7.1** Idade mínima e fluxo de menores: AUTH-05, AUTH-06 (P-01).
- [ ] **F7.2** Carregar a lista de sinais de alerta e os limites de persistência na configuração do motor (P-02).
- [ ] **F7.3** Publicar a política de privacidade revisada pelo advogado (P-05).

*Produção*
- [ ] **F7.4** Hospedagem da API e do banco, com backup diário (P-04).
- [ ] **F7.5** Publicar o app web e o painel com domínio próprio e HTTPS.
- [ ] **F7.6** Provedor de e-mail real para verificação e recuperação de senha.
- [ ] **F7.7** Monitoramento de erros, com remoção de dados de saúde dos relatórios.
- [ ] **F7.8** Revisão de segurança: dependências, limites de tentativa, permissões por papel, segredos fora do código.

*Lojas*
- [ ] **F7.9** Conta de desenvolvedor Google Play; build Android; teste interno.
- [ ] **F7.10** Conta Apple Developer; build iOS (Mac ou serviço na nuvem, como Codemagic); TestFlight.
- [ ] **F7.11** Formulários de privacidade das lojas (Google "Segurança dos dados" e Apple "Privacidade do app").

*Beta*
- [ ] **F7.12** Convidar o grupo de beta e acompanhar as métricas por 4 semanas.
- [ ] **F7.13** Ajustar pesos pelo painel com base nos dados, registrando cada versão.
- [ ] **F7.14** Registrar os aprendizados e os pedidos de mudança para o LIFE 1.1.

**Entregáveis:** LIFE em produção; app em teste fechado nas duas lojas; relatório do beta.

**Critérios de saída**

- Pendências P-01 a P-07 fechadas.
- App disponível no teste interno do Google Play e no TestFlight.
- Grupo de beta usando o app, com métricas coletadas por 4 semanas.

**Fora desta fase:** lançamento público, mensalidade, login social (entram como pedidos de mudança para depois do beta).

---

## 8. Critérios de aceite do motor (resumo da aba 13)

| Caso | Entrada | Resultado esperado |
|---|---|---|
| **T01 — Ana, 47, básica** | Hipertensão controlada; estresse 5, sono 2, energia 2, corpo rígido, 20h15, 20 min | Principal: Hatha suave com respiração; alternativa: Yoga Nidra; retenção respiratória e invertida fora da recomendação automática; explicação menciona estresse, energia e rigidez |
| **T02 — Ricardo, 38, avançado** | Dor cervical, energia alta, preferência por invertidas | Conteúdos com carga cervical alta fora da recomendação automática; oferece prática dinâmica compatível; objetivo de força preservado; conteúdos continuam acessíveis na biblioteca |
| **T03 — Helena, 52, iniciante** | Força + sono + interesse em Ayurveda ao longo de semanas | Planejamento semanal; progressão na trilha; Home muda após a prática; profundidade da explicação adaptada ao nível |

---

## 9. Regras de linguagem (valem para todo texto do app)

- Nunca afirmar causa: "você relatou menos estresse", e não "esta prática reduziu seu estresse".
- Nunca dizer que uma prática é proibida: ela fica "fora das sugestões de hoje".
- Ayurveda sempre identificado como leitura tradicional, sem certeza e sem porcentagens.
- Separar "Nutrição & Fisiologia" de "Visão Ayurvédica".
- Lembrar que o app não substitui avaliação médica nos pontos de saúde.

---

## 10. Definição de pronto

Um requisito está pronto quando:

- [ ] todos os critérios de aceite passam;
- [ ] tem teste automatizado (obrigatório no motor e nas regras de segurança);
- [ ] funciona no navegador e no Android (itens do app);
- [ ] nenhum dado de saúde aparece em log;
- [ ] os textos seguem a seção 9;
- [ ] o commit cita o ID do requisito;
- [ ] este documento e o `decisoes.md` estão atualizados, se algo mudou.

---

## 11. Pendências que bloqueiam requisitos

| ID | Pendência | Bloqueia | Até |
|---|---|---|---|
| P-01 | Idade mínima exata e regras para menores | AUTH-05, AUTH-06 | Fase 7 |
| P-02 | Lista de sinais de alerta e limites de persistência (masters + profissional de saúde) | MOT-13, MOT-14 | Fase 7 (o mecanismo é feito na Fase 1) |
| P-03 | Provedor de vídeo e áudio | ADM-04, PRA-03, PRA-04 | Fase 3 |
| P-04 | Hospedagem da API e do banco | Fase 7 | **Parcial:** API e banco no Render para demonstração, descritos em [hospedagem.md](hospedagem.md) e no `render.yaml`. A hospedagem de produção, com banco pago e backup diário, continua na Fase 7 (F7.4) |
| P-05 | Revisão jurídica da política de privacidade | Publicação | Fase 7 |
| P-06 | "Minhas anotações" (aparece nas telas, mas não nos documentos): entra ou não? | — | Fase 5 |
| P-07 | Catálogo mínimo para o beta: quantos conteúdos, trilhas e receitas (definido pelos professores) | Fase 7 | Fim da Fase 3 |

---

## 12. Pedidos de mudança

Toda ideia nova entra aqui antes de virar código.

| Data | Pedido | Impacto | Decisão |
|---|---|---|---|
| 11/09/2026 | Perguntar **"o que você busca?" todos os dias** | Alto: mudaria o Bloco 3 e o ranking | **Recusado / esclarecido** pelo cliente no mesmo dia: as perguntas de objetivo, relação com o Yoga, saúde, Ayurveda e preferências são **só na criação da conta**. Diário é só o check-in ("como você está hoje?"), que leva à recomendação. Virou CHK-06 |
| 11/09/2026 | Antecipar a tela de **login** (visual, com as imagens da marca) da Fase 4 para agora, para mostrar ao cliente | Baixo. A tela é só visual: validação no próprio aparelho, sem API. Na Fase 2 ela é ligada ao AUTH-03 e na Fase 4 recebe o tema completo | **Aprovado** por Leonardo. Feito em `apps/app/src/views/LoginPage.vue` |
| 12/09/2026 | Publicar o protótipo na **Vercel** para testar no celular pelo navegador, sem gerar o app | Baixo. É só a versão web do protótipo, sem API e sem dados reais. A hospedagem de produção continua na Fase 7 (P-04) | **Aprovado** por Leonardo. `vercel.json` na raiz |
| 11/09/2026 | Antecipar as telas de **boas-vindas**, **onboarding (passo 2)** e **check-in diário** como protótipo visual | Baixo, mesma lógica do login: sem API | **Aprovado** por Leonardo. `WelcomePage`, `OnboardingPage` e `DailyCheckinPage` |
| 18/09/2026 | Antecipar o **backend de conta** (cadastro, login, sessão salva no aparelho) e o **salvamento das respostas do onboarding**, pulando da Fase 0 para um recorte da Fase 2 | Médio. Entra cedo o banco, o Prisma e o JWT. Ficam de fora desta antecipação: verificação de e-mail (AUTH-02), recuperação de senha (AUTH-04), limite de tentativas (F2.7), Swagger (F2.4) e tudo do motor e do check-in | **Aprovado** por Leonardo em 18/09. Vira a Fase 2 parcial: F2.1, F2.3, F2.5, F2.8 (parcial), F2.11, F2.12 e F2.13 |
| 18/09/2026 | Hospedar a **API no Render** (com Postgres) para o cliente testar o cadastro e o login no celular dele | Baixo para o código: a API é a mesma, só ganha `render.yaml` e a variável `VITE_API_URL` no app. O plano gratuito dorme quando fica parado e o banco tem prazo de validade — serve para demonstração, não para dados de aluno | **Aprovado** por Leonardo em 18/09. Guia em [hospedagem.md](hospedagem.md) |
| 18/09/2026 | Refazer a aba **Hoje**: saudação pela hora do dia com o nome e a foto da pessoa, frase de acolhimento, o check-in como **carrossel de uma pergunta por vez com 3 opções** (sono, energia, corpo, estresse, digestão e **humor**), a escolha do tempo, o botão "Atualizar minha prática", um **ditado do Yoga que troca todo dia** e o rodapé da marca | **Alto.** Muda o CHK-01: a escala de sono, energia e estresse cai de 1–5 para 3 opções, corpo e digestão caem de 5 para 3, entra **humor** (era pendência com o cliente) e **sai a pergunta de dor**. As faixas da Matriz Técnica (Bloco 1 e CTX-002) foram escritas para 1–5 e para a dor, então o motor precisa ser reescrito nessas partes | **Aprovado** por Leonardo em 18/09 para a tela. **Pendências levantadas:** (a) sem a pergunta de dor o motor perde a reaplicação de segurança (CHK-03, `SEG-R05`); (b) o cliente precisa confirmar a tradução das 3 opções para as faixas da Matriz; (c) fotos de perfil (Cloudinary?) ainda não decididas |

---

## Changelog

| Versão | Data | Mudança |
|---|---|---|
| 1.0 | 10/09/2026 | Primeira versão |
| 1.1 | 10/09/2026 | Fases detalhadas com tarefas (F0.1 a F7.14), dependências, entregáveis e critérios de saída; novo requisito MOT-20 (aprendizado); nova pendência P-07; EU-02 movido para a Fase 6; módulos Aprender e Ayurveda renomeados para EDU e AYV |
| 1.2 | 11/09/2026 | Fase 0: TypeScript 6.0 (limite do typescript-eslint), Vitest também na API (Nest 12), NestJS 12 em ESM e Prisma 7; banco local decidido (Docker, porta 5433); API na porta 3100 |
| 2.2 | 18/09/2026 | Aba Hoje refeita: check-in em carrossel com 3 opções por pergunta, humor no lugar da dor, ditado do dia (seção 12). CHK-01 e HOME-01 afetados |
| 2.1 | 18/09/2026 | Hospedagem da API no Render antecipada para demonstração (seção 12 e P-04); guia em hospedagem.md |
| 2.0 | 18/09/2026 | Backend de conta antecipado: cadastro, login com sessão salva e salvamento das respostas do onboarding (seção 12). Fase 2 começa parcial, antes da Fase 1 |
| 1.9 | 12/09/2026 | Protótipo publicado na Vercel para teste no celular (seção 12) |
| 1.8 | 11/09/2026 | Cadastro no fim do onboarding, com nome completo, e-mail, telefone e senha (AUTH-01) |
| 1.7 | 11/09/2026 | Esclarecido pelo cliente: onboarding só na criação da conta; diário é só o check-in. CHK-06 reescrito e MOT-06 volta ao objetivo do perfil |
| 1.6 | 11/09/2026 | Objetivo do dia perguntado todo dia (CHK-06 e CHK-07); MOT-06 passa a usar o objetivo do dia no ranking |
| 1.5 | 11/09/2026 | Telas de boas-vindas, onboarding e check-in antecipadas como protótipo; registrada a dúvida sobre perguntar o objetivo todo dia (seção 12) |
| 1.4 | 11/09/2026 | Registrado o pedido de mudança: tela de login antecipada como protótipo visual (seção 12) |
| 1.3 | 11/09/2026 | Correção: são 6 áreas permanentes (a Cozinha é aba, conforme o Documento Mestre seção 2 e a tela 14), não 5; mapa das telas em [fluxo-bloco-1.md](fluxo-bloco-1.md) |
