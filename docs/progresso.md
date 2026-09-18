# Diário de bordo — LIFE

Onde o projeto parou e o que vem a seguir. Uma linha por coisa feita, do mais recente para o mais antigo.
O plano completo está em [plano-de-desenvolvimento.md](plano-de-desenvolvimento.md); aqui é só o dia a dia.

---

## Onde estamos agora

- **Fase atual:** 2 · API base (recorte antecipado: conta e onboarding). A Fase 0 só espera a CI verde no GitHub (F0.11).
- **Falta para fechar a fase 2:** verificação de e-mail (AUTH-02), recuperação de senha (AUTH-04), limite de tentativas (F2.7), Swagger (F2.4), check-in e catálogo.
- **Próximo passo:** Fase 1 · Motor (`packages/motor`), começando pelos tipos em `shared` (F1.1).
- **Commits locais ainda não enviados:** 4.

## Esperando resposta

| De quem | O quê | Trava o quê |
|---|---|---|
| Cliente | A pergunta sobre **dor** entra no check-in (tela 8)? Sem ela o motor não protege quem está com dor | Fases 1 e 4 |
| Cliente | **Humor** fica ou sai do check-in? Se ficar, como influencia a aula | Fases 1 e 4 |
| Cliente | Quem desenha as telas que faltam: **player e feedback** (o cadastro já foi feito) | Fase 4 |
| Cliente | **Idade mínima** do app (P-01) | Fase 7 |
| Cliente | Lista de **sinais de alerta** e limites de persistência (P-02) | Fase 7 |
| Leonardo | Confirmar o **App ID** (`com.life.app` é provisório) | Fase 4 |
| Leonardo | Atualizar o npm: `npm install -g npm@11` | Já contornado |

---

## Linha do tempo

### 18/09/2026

- **Corrigido:** o check-in do dia era guardado numa chave única do aparelho, sem dono — quem criasse uma conta nova via as respostas de quem tinha usado o app antes. Agora cada conta tem a sua chave, e sair da conta apaga o check-in e as respostas do cadastro do aparelho.

- **Aba Hoje refeita (HOME-01, CHK-01, CHK-04):** saudação pela hora do dia com o nome, frase de acolhimento, avatar (espaço pronto para foto), check-in em carrossel de até **3 perguntas por tela** (7 pendentes viram telas de 3, 2 e 2) com 3 opções cada (7 perguntas, incluindo **dor**; havendo dor, pergunta também a região — CHK-03), escolha do tempo, botão "Recomendar minha prática", ditado do Yoga que troca todo dia e rodapé da marca. Tocar num cartão do resumo refaz aquela resposta. O check-in fica guardado no aparelho e zera à meia-noite.
- **Aba Eu:** tela simples com nome, e-mail e "Sair da conta" — antes não havia como sair.
- **Bancos de frases:** 15 acolhimentos e 20 ditados do Yoga e do Ayurveda, escolhidos pelo dia do calendário. **As traduções precisam da revisão do Marcos.**

- **Protótipo completo no ar:** app em https://projeto-yoga-nine.vercel.app falando com a API em https://life-api-542y.onrender.com. Cadastro, login, sessão salva e leitura das respostas testados no site publicado, pelo navegador. `CORS_ORIGIN` fechado só para o endereço da Vercel.
- **API no ar em https://life-api-542y.onrender.com** (Render, plano gratuito): cadastro, login e leitura do onboarding testados contra o banco de lá. Falta apontar o app da Vercel para ela (`VITE_API_URL`) e fechar o `CORS_ORIGIN`, hoje aberto a qualquer endereço.
- **Hospedagem da API preparada (P-04 parcial):** `render.yaml` cria a API e o Postgres no Render, e o app aponta para lá pela variável `VITE_API_URL`. Passo a passo em [hospedagem.md](hospedagem.md).

- **Backend da conta no ar (F2.1, F2.3, F2.5, F2.8 parcial, F2.11, F2.12, F2.13):** cadastro com as respostas do onboarding, login, sessão que continua valendo no aparelho (refresh de 30 dias com rotação), logout e `GET /onboarding`. Senha em hash argon2, saúde em tabela separada e só com consentimento, banco Postgres com Prisma.
- **App ligado na API:** os 5 passos guardam as respostas no aparelho e o cadastro manda tudo junto; login e cadastro levam para a área do cliente (`/tabs/hoje`), que mostra o nome e as respostas vindas do banco. Quem já entrou não vê mais a tela de boas-vindas nem o login.
- **12 testes ponta a ponta** da conta, incluindo: senha nunca em texto puro, saúde recusada sem consentimento e refresh que não serve duas vezes.

### 13/09/2026

- **Botão "Pular" arrumado:** nos 5 passos do cadastro ele leva para a criação da conta (`/criar-conta`), porque conta é obrigatória; no check-in diário leva para a Home (`/tabs/hoje`), já que sem respostas não há prática recomendada.

- **Passo 6 do cadastro** ("Seu perfil está pronto!"): o cartão de criar conta foi compactado para caber inteiro em uma tela de celular (393×852), sem rolagem — marca, quatro campos, aceite da política, botão e rodapé.

- **Passo 5 do cadastro** ("O que você prefere?"): estilos de prática, temas de interesse e horário preferido, com fichas verdes quando marcadas e os três ícones de horário recortados da referência. Mesmo fundo dos passos 1 a 3.

### 12/09/2026

- **Passo 4 do cadastro** ("Conheça seu perfil ayurvédico"): constituição (Vata, Pitta, Kapha) e estado atual, com fundo próprio montado a partir da referência (foto das especiarias, logo e frase, sem a barra do celular nem a seta).

- **Passo 3 do cadastro** ("Saúde e bem-estar"): 10 condições com chave liga/desliga, aviso de que não substitui avaliação médica, e os 11 ícones recortados da referência.
- **Corrigido com o cliente:** o cadastro tem **6 passos** (antes estava 14). O check-in diário também tem 6 perguntas, mas são coisas separadas.

- **Passo 2 do cadastro** ("Qual sua relação com o Yoga?"): lista de experiência com escolha única e grade de práticas conhecidas, com os 11 ícones recortados da referência. Mesmo fundo do passo 1, sem rodapé.

- **Protótipo preparado para a Vercel** (`vercel.json`): build do app no monorepo e rotas do Vue tratadas. Serve para testar no celular pelo navegador, sem gerar o app.
- Tela inicial igual à referência: sem os véus brancos, foto com mais brilho e textos de baixo em branco.

- Fundo da tela de objetivos virou **uma imagem única** montada a partir da referência (paisagem + degradê + folhas), no lugar das camadas em CSS que geravam emenda e mancha branca.

- Tela de objetivos acertada com o cliente: fundo em degradê da foto (moça à esquerda) para o branco, arte com zoom out e rodapé da lótus visível na tela.

### 11/09/2026

- Acabamento da tela de objetivos: arte lateral recortada da referência (folhas + foto, em resolução melhor), fonte serifada **Playfair Display** nos títulos e frases, e degradê dissolvendo a foto na área branca.

- Tela de objetivos ajustada ao pedido do cliente: **Passo 1 de 6** e a **coluna da arte com a logo aparece também no celular**, como na imagem de referência.

- **Tela de criar conta** no fim das perguntas: nome completo, e-mail, telefone, senha e aceite da política. Decidido com o cliente: a conta é criada depois de responder, não antes.

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
