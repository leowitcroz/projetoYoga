# Diário de bordo — LIFE

Onde o projeto parou e o que vem a seguir. Uma linha por coisa feita, do mais recente para o mais antigo.
O plano completo está em [plano-de-desenvolvimento.md](plano-de-desenvolvimento.md); aqui é só o dia a dia.

---

## Onde estamos agora

- **Fase atual:** 0 · Fundação — 12 de 13 tarefas prontas.
- **Falta para fechar a fase:** subir para o GitHub e ver a CI verde (F0.11).
- **Próximo passo depois disso:** Fase 1 · Motor (`packages/motor`), começando pelos tipos em `shared` (F1.1).
- **Commits locais ainda não enviados:** 4.

## Esperando resposta

| De quem | O quê | Trava o quê |
|---|---|---|
| Cliente | A pergunta sobre **dor** entra no check-in (tela 8)? Sem ela o motor não protege quem está com dor | Fases 1 e 4 |
| Cliente | **Humor** fica ou sai do check-in? Se ficar, como influencia a aula | Fases 1 e 4 |
| Cliente | Quem desenha as telas que faltam: **cadastro, player e feedback** | Fase 4 |
| Cliente | **Idade mínima** do app (P-01) | Fase 7 |
| Cliente | Lista de **sinais de alerta** e limites de persistência (P-02) | Fase 7 |
| Leonardo | Confirmar o **App ID** (`com.life.app` é provisório) | Fase 4 |
| Leonardo | Atualizar o npm: `npm install -g npm@11` | Já contornado |

---

## Linha do tempo

### 11/09/2026

- **Esclarecido com o cliente:** o onboarding (objetivo, relação com o Yoga, saúde, Ayurveda, preferências) é **só na criação da conta**. O que se repete todo dia é o **check-in** ("como você está hoje?") que leva à recomendação da aula. Quem pular escolhe a aula na biblioteca. Plano 1.7, CHK-06 e CHK-07.
- Fluxo do protótipo: **"Começar"** (sem conta) → perguntas iniciais → check-in; **"Entrar"** (com conta) → login → check-in → Hoje. O cadastro completo fica em `/onboarding`.

- **Tela "O que você busca?"** refeita igual à referência, com os **12 ícones recortados da imagem** do cliente (PNG transparente em `src/assets/icones/`), logo e coluna da marca em telas largas.
- Telas de **onboarding** e **check-in diário** criadas por Leonardo e ajustadas (tipos e lint).

- **Tela de boas-vindas** como página inicial, no estilo da tela 1 de referência. "Entrar" leva ao login. `ad0214f`
- Descoberto que `logo.jpg` e `lotus.jpg` eram **PNG com transparência**: renomeados, recortados e sem gambiarra de mistura de cor.
- **Tela de login** (protótipo visual, sem API) com a marca do cliente. Antecipada da Fase 4, registrada na seção 12 do plano. `f3abb3f`
- **Mapa das 15 telas** e a sequência do Bloco 1 em [fluxo-bloco-1.md](fluxo-bloco-1.md), a partir do retorno do cliente. `9cec1cf`
- **Correção:** a Cozinha é a 6ª aba (o Documento Mestre define 6 áreas permanentes). O app tinha 5.
- **Fase 0 concluída no PC:** monorepo, TypeScript, ESLint, Prettier, CI escrita, API com `/health`, app com as abas, painel, banco no Docker. `ab424db`

### 10/09/2026

- **Plano de desenvolvimento (SDD)** com escopo, requisitos, 8 fases e 114 tarefas. `e4f9e7c`
- **CLAUDE.md** para as sessões seguirem o plano e não fugirem do escopo.
- **Política de privacidade** (rascunho para o advogado) e **registro de decisões**.
- **Storytelling da Júlia** em página e PDF, enviado ao cliente.
- Documentos do cliente lidos: Documento Mestre, Matriz Técnica (14 abas) e as telas.
- **Repositório criado** e tecnologia definida: Ionic + Vue + Capacitor, NestJS, motor em TypeScript puro. `4ac5432`

---

## Como usar este arquivo

- Terminou algo? Acrescente **uma linha** no topo da data de hoje, com o número do commit.
- Mudou de fase? Atualize o bloco "Onde estamos agora".
- Decisão que vale para sempre (tecnologia, produto, regra) vai para [decisoes.md](decisoes.md), não aqui.
- Ideia nova fora do escopo vai para a seção 12 do plano (Pedidos de mudança).
