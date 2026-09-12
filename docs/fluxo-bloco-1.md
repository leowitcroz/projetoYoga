# Bloco 1 — Sequência inicial (telas de referência)

Mapa das 15 telas de `midias de flow/` e a sequência do primeiro momento do app, conforme o retorno do cliente em 11/09/2026.

## Mapa das telas

| Nº na tela | Tela | Área | Arquivo |
|---|---|---|---|
| (capa) | Boas-vindas — "Mais que um app. Uma jornada de vida." + Começar / Entrar | Entrada | `15.10.57.jpeg` |
| 2 de 7 | O que você busca? (objetivos, múltipla escolha) | Onboarding | `15.10.57 (1).jpeg` |
| 3 de 7 | Qual sua relação com o Yoga? + práticas que conhece | Onboarding | `15.10.57 (2).jpeg` |
| 4 de 7 | Saúde e bem-estar (condições) | Onboarding | `15.10.57 (3).jpeg` |
| 5 de 7 | Conheça seu perfil ayurvédico (Prakṛti + estado atual) | Onboarding | `15.10.57 (4).jpeg` |
| 6 de 7 | O que você prefere? (estilos, temas, horário) | Onboarding | `15.10.58.jpeg` |
| 7 de 7 | Seu perfil está pronto! → "Ir para o app" | Onboarding | `15.10.58 (1).jpeg` |
| 8 | **Hoje**: "Bom dia" + Como você está hoje? + Quanto tempo você tem? | Uso diário | `15.10.58 (2).jpeg` |
| 9 | **Sua prática de hoje** (28 min, blocos da aula, Por que esta prática?) | Uso diário | `15.10.58 (3).jpeg` |
| 10 | Aprenda hoje (conteúdo do dia + continue estudando) | Uso diário | `15.10.58 (4).jpeg` |
| 11 | Ayurveda hoje (uma orientação + Entenda por quê) | Uso diário | `15.10.58 (5).jpeg` |
| 12 | **Praticar** — "O que você quer praticar?" Biblioteca de atividades | Biblioteca | `15.10.58 (6).jpeg` |
| 13 | Aprender — Suas trilhas de aprendizado | Biblioteca | `15.10.58 (7).jpeg` |
| 14 | Cozinha Saudável | Biblioteca | `15.10.58 (8).jpeg` |
| 14 | Eu — Meu progresso / Minha jornada | Perfil | `15.10.58 (9).jpeg` |

> A numeração impressa nas telas tem falhas (aparece "8 de 7", "9 de 7" e dois "14 de 14"). O que vale é a ordem acima.

## A sequência do Bloco 1

```
[1] Boas-vindas
       ├── "Começar" (não tem conta)  → cadastro + perguntas iniciais
       └── "Entrar" (já tem conta)    → login → check-in do dia

[1] Boas-vindas → Começar
       ↓
[cadastro: e-mail e senha]            ← TELA NÃO EXISTE no deck
       ↓
[2..7] Onboarding, 6 passos           ← só na primeira vez
       objetivos → relação com Yoga → saúde → ayurveda → preferências → perfil pronto
       ↓
[8] Hoje: "Como você está hoje?" + "Quanto tempo você tem?"   ← todo dia
       ↓
[9] Sua prática de hoje (o motor escolhe) + "Por que esta prática?"
       ↓
[player da prática]                   ← TELA NÃO EXISTE no deck
       ↓
[feedback: como foi? como você está agora?]   ← TELA NÃO EXISTE no deck
       ↓
       o motor aprende (MOT-20, Fase 6)

Atalho a qualquer momento:
[8] Hoje → aba Praticar → [12] Biblioteca de atividades → escolhe a aula por conta própria
```

- **Primeira vez:** telas 1 → cadastro → 2 a 7 → 8 → 9 → player → feedback.
- **Do segundo dia em diante:** abre direto na tela 8 (Hoje). O onboarding não se repete.
- **Quem não quer seguir a sugestão:** vai pela aba Praticar para a tela 12 e escolhe qualquer aula do banco.
- **Quem não quer responder o check-in:** o "Pular" leva direto à tela 12 (biblioteca).

## Telas que ainda faltam desenhar

1. **Cadastro e login** (e-mail e senha, recuperação de senha).
2. **Player da prática** (vídeo/áudio, com o áudio seguindo de tela bloqueada).
3. **Feedback pós-prática** (como foi, gostei, como você está agora).

## Divergências entre as telas e o Documento Mestre

| Ponto | Telas | Documento Mestre / Matriz | Encaminhamento |
|---|---|---|---|
| **Dor no check-in** | A tela 8 não pergunta sobre dor | Dor (0–10 + local) é obrigatória: reabre o filtro de segurança (`SEG-R05`, `CTX-002`) | Precisa entrar na tela 8. Sem isso, o motor não protege quem está com dor |
| **Humor** | A tela 8 pergunta "Humor" | Humor não existe na Matriz | Definir: vira dado do motor ou sai da tela |
| **Cozinha** | A tela 14 mostra **6 abas** (Hoje, Praticar, Aprender, Ayurveda, Cozinha, Eu); as outras telas mostram 5 | O Documento Mestre (seção 2) define **6 áreas permanentes**, com Cozinha entre elas | Corrigido: o app usa 6 abas |
| **Onboarding** | 6 passos + resumo | Mesmos 6 blocos | Sem divergência |

## Perguntas para o cliente

1. O cadastro e o onboarding (telas 1 a 7) acontecem **só na primeira vez**, certo? Do segundo dia em diante o app abre direto na tela 8.
2. A pergunta sobre **dor** entra no check-in da tela 8? É o que garante a segurança da recomendação.
3. **Humor** fica ou sai? Se ficar, ele influencia a escolha da aula de que forma?
4. As telas de **cadastro/login, player e feedback** precisam ser desenhadas no mesmo estilo. Quem faz?

## Sobre "a IA que escolhe a aula"

A escolha da aula na tela 9 é feita pelo **Motor LIFE**: regras e pesos definidos na Matriz Técnica (segurança → tempo → nível → pontuação por estado, objetivo, Ayurveda, preferência e histórico). Não é IA generativa, e isso é uma exigência do próprio Documento Mestre (seção 12), porque decisões de segurança precisam ser auditáveis e explicáveis. O aprendizado existe (Bloco 6 / MOT-20): o app aprende com o uso real, mas devagar e com regras de proteção.
