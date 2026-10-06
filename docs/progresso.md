# Diário de bordo — LIFE

Onde o projeto parou e o que vem a seguir. Uma linha por coisa feita, do mais recente para o mais antigo.
O plano completo está em [plano-de-desenvolvimento.md](plano-de-desenvolvimento.md); aqui é só o dia a dia.

---

## Onde estamos agora

- **Fase atual:** 3 · Painel (parcial). A **Fase 2 está concluída**; a Fase 1 só espera Aprenda/Ayurveda/Cozinha Hoje (F1.14) e o motor de jornada (F1.16). A Fase 0 espera a CI verde no GitHub (F0.11).
- **Falta para fechar a fase 1:** Aprenda/Ayurveda/Cozinha Hoje (F1.14), pergunta adaptativa (F1.15) e jornada (F1.16).
- **Falta para fechar a fase 3:** receitas e orientações ayurvédicas (F3.7) e o editor de pesos do motor (F3.11). O **F3.5 está resolvido enquanto for YouTube**: o professor cola o link e digita a duração, como a decisão de 01/10 previu; ele volta a abrir quando a troca pelo Mux acontecer.
- **Próximo passo:** **receitas e orientações ayurvédicas (F3.7)**, que andam junto com a aba Cozinha (F1.14, da Fase 1) — vale fazer as duas de uma vez. O editor de pesos (F3.11) fica por último: serve para o Marcos ajustar o motor, e ele ainda não validou os pesos atuais.
- **Commits locais ainda não enviados:** 15.

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

### 06/10/2026 (tela da prática)

- **A tela que abre ao escolher uma prática foi refeita (PRA-07, novo).** Capa com o play, título, professor, modalidade e nível, a prática dividida em blocos com os minutos de cada um, o botão "Iniciar prática" e o rodapé da marca. Veio de tela de referência do Leonardo.
- **A divisão em blocos é informação nova.** Não dá para deduzir da duração quanto tempo de prāṇāyāma uma aula tem — quem sabe é o professor. Virou campo da ficha no painel, e **a API recusa blocos que não somem a duração**: a tela diria ao aluno uma coisa que a aula não cumpre.
- **O "por que esta prática?" só aparece quando a prática é a recomendada do dia.** Quem escolhe sozinho na aba Praticar não recebeu indicação nenhuma; nesse caso a tela mostra o que a prática trabalha, sem fingir que foi escolhida para a pessoa.
- **O vídeo só é carregado quando a pessoa toca no play** — antes o iframe do YouTube subia junto com a tela, contatando o Google mesmo de quem só estava olhando a aula.
- **Tema escuro do Ionic desligado.** Nenhuma tela do LIFE tem versão escura: num celular no modo escuro, só a barra de abas escurecia e destoava de todo o resto. A barra passou a seguir a paleta da marca, com o item atual em verde.
- **Teste que apodrecia pelo calendário:** o MOT-07 da jornada usava datas fixas de 01/10, e o motor conta os dias a partir do relógio — a "prática de ontem" virou "cinco dias atrás" e o teste passou a falhar sozinho. Agora as datas são relativas a hoje.
- 8 testes novos; 105 ponta a ponta na API.

### 02/10/2026 (trilhas)

- **Trilha virou tabela (F3.6, ADM-05).** Era um texto que o professor digitava em cada ficha: `TRILHA-MOB-1` em vez de `TRILHA-MOB-01` tirava a aula da sequência sem erro, sem aviso e sem ninguém perceber — o motor simplesmente deixava de oferecer a continuação (PER-008). Agora a trilha tem nome, descrição, número de aulas e pré-requisito, e a ficha da prática escolhe numa lista.
- **A posição deixou de ser digitada.** A tela da trilha manda a lista inteira na ordem e a API numera de 1 em diante, então buraco e repetição deixaram de ser possíveis. Salvar a ficha de uma aula para corrigir o título não reembaralha mais a sequência.
- **Pré-requisito não fecha ciclo:** "A exige B" e "B exige A" entravam as duas sem reclamar, e nenhuma das trilhas abriria nunca. A lista de pré-requisitos já nem oferece quem fecharia o círculo.
- **A trilha cobra o que falta:** quantas aulas faltam para o total e quantas ainda não foram aprovadas — aula não aprovada não chega ao aluno.
- **Corrida no gerador de id (achada pelo teste novo).** O id saía de "o último `PRAT-` mais um": dois professores clicando em "Nova prática" no mesmo instante escolhiam o mesmo número e um levava erro 500. Agora pega o próximo livre e tenta de novo.
- **Migração sem perder nada:** a trilha que já existia no catálogo virou registro com as duas aulas na ordem, e o seed passou a criar as trilhas antes das práticas — sem isso, repovoar um banco limpo quebraria na chave estrangeira.
- 17 testes novos; 100 ponta a ponta na API.

### 01/10/2026 (limite de tentativas)

- **A tela mostrava `ThrottlerException: Too Many Requests`.** Era a mensagem crua do NestJS, em inglês e com o nome da classe dentro, chegando inteira ao aluno. Agora o F2.7 responde em português e diz quanto falta: *"Muitas tentativas em pouco tempo. Tente de novo em 12 minutos."*
- **Cadastro passou de 5 para 10 tentativas por hora.** O limite conta toda tentativa, inclusive a que nem chega ao banco (senha curta, e-mail já usado), então quem errasse três vezes ficava trancado para fora do próprio cadastro — e numa rede compartilhada as pessoas gastavam as tentativas umas das outras.
- 4 testes novos.

### 01/10/2026 (painel do master)

- **Conta de equipe não entra mais no app de aluno.** O Marcos entrava e via o check-in de sono, dor e humor — perguntas que não fazem sentido para quem cataloga aulas. Agora o login do app recusa professor, master e admin e explica que o acesso deles é pelo painel.
- **Painel ganhou o Início:** o que precisa da atenção do master (práticas esperando revisão, aprovadas sem vídeo, devolvidas) e os números do catálogo e dos alunos.
- **Lista de alunos (ADM-10):** nome, inscrição, se confirmou o e-mail e quantas práticas fez. **Nada de saúde** — nem condições, nem dor, nem check-in; a própria tela diz isso, e um teste garante.
- **Aulas com vídeo são marcadas na lista do app.** O vídeo não aparecia porque as 22 práticas do catálogo de teste não têm nenhum; agora dá para ver quais têm antes de abrir.
- 4 testes novos; 83 ponta a ponta na API.

### 01/10/2026 (vídeo)

- **P-03 revisto: começamos pelo YouTube**, por escolha de Leonardo. O Mux continua registrado como o destino quando o app sair do começo.
- **O professor cola o link no painel** (watch, youtu.be, embed, Shorts ou o identificador puro) e o banco guarda **provedor + identificador**, nunca a URL — é o que torna barata a troca depois.
- **Player na ficha da aula**, em `youtube-nocookie.com` e sem vídeos relacionados no fim: ninguém termina uma prática e cai num vídeo de terceiros.
- **Consequência registrada:** o **PRA-04 (áudio com a tela bloqueada) fica impossível enquanto for YouTube** — os Termos deles reservam isso ao Premium. É a razão mais forte para a troca futura, mais que o preço.
- Links que não dão para ler são recusados na hora, em vez de virar prática sem vídeo. 7 testes da leitura do link.
- **Corrigido:** desde o AUTH-02, as contas de equipe criadas pelo comando nasciam sem e-mail confirmado — e **nenhum professor conseguia entrar no painel**. Agora nascem confirmadas: quem cria a conta é a administração, que já sabe de quem é o e-mail.

### 01/10/2026 (Fase 2 fechada)

- **Fase 2 concluída.** Faltavam seis tarefas; todas prontas.
- **Swagger em `/docs` (F2.4)**, só fora de produção: a documentação descreve todas as rotas, inclusive as de conta, e não precisa estar no ar.
- **Pergunta adaptativa (F1.15, F2.17, MOT-18/CTX-001):** o motor pergunta sobre refeição recente **só quando a resposta mudaria a escolha** — se a melhor prática fosse a mesma dos dois jeitos, ele cala e recomenda. Quem responde que comeu há pouco não recebe prática que pede estômago vazio.
- **Eventos de uso e feedback (F2.18):** iniciada, concluída e trocada, mais a avaliação de depois da prática.
- **Corrigido:** o histórico que o motor usa passou a vir dos **eventos de conclusão**. Antes ele supunha que a prática recomendada tinha sido feita; agora só conta o que a pessoa concluiu de verdade.
- **Jornada completa testada (F2.19 a F2.21):** cadastro → confirmação do e-mail → onboarding → check-in → prática do dia → conclusão → feedback, mais a dor reaplicando a segurança e a garantia de que saúde não aparece nos logs.
- **Provedor de vídeo escolhido (P-03): Mux**, com Cloudflare Stream como segunda opção. Razões e o que a decisão **não** resolve em [decisoes.md](decisoes.md).
- **80 testes no motor, 77 ponta a ponta na API.**

### 01/10/2026 (privacidade)

- **Registro de acesso (PRIV-03, F2.6):** cada pedido fica anotado com rota, método, IP e quem chamou — e **só isso**. Corpo de requisição não entra, o que mantém dado de saúde fora do registro por construção, não por disciplina de quem escreve o código. Some sozinho depois de 6 meses.
- **Excluir conta (AUTH-07, F2.10):** apaga a pessoa, as respostas, a saúde, os check-ins, as recomendações, os consentimentos e as sessões. Sobra o registro de acesso, sem dono, que é o que a lei manda guardar. A tela pede confirmação e avisa que não dá para desfazer.
- **Política de privacidade no app (PRIV-04):** resumo em linguagem simples, com link no cadastro e na aba Eu. O texto completo continua em revisão jurídica, e a tela diz isso.
- **Corrigido antes de virar problema:** o registro do próprio pedido de exclusão guardava o id de quem acabava de ser apagado. Agora sai sem dono.
- **8 testes novos**; 65 ponta a ponta na API.

### 01/10/2026

- **Segurança da conta (AUTH-02, AUTH-04, F2.7, F2.9):** verificação de e-mail, recuperação de senha e limite de tentativas nas rotas de conta.
- **O cadastro deixou de abrir sessão.** Sem confirmar o e-mail ninguém entra, como manda o AUTH-02. A tela de "confirme o seu e-mail" tem o reenvio do link.
- **"Esqueci minha senha" deixou de ser enfeite:** a tela existia e não fazia nada; agora pede o link e, com ele, troca a senha — o que também **derruba as sessões abertas**, que é o que torna a redefinição útil quando alguém mais tinha acesso à conta.
- **Links de uso único:** no banco fica só o hash, como já era com o refresh token. Vencem em 24 h (confirmação) e 1 h (senha); pedir um novo invalida o anterior.
- **Respostas iguais para e-mail que existe e que não existe** em "esqueci a senha" e no reenvio: a API não vira uma lista de quem tem conta aqui.
- **Mailpit no `docker compose`:** os e-mails de desenvolvimento ficam em http://localhost:8025 e não saem para o mundo.
- **13 testes novos** de segurança da conta; 57 ponta a ponta na API no total.

### 29/09/2026 (Fase 3)

- **Painel dos professores no ar (F3.1 a F3.4, F3.8 a F3.10, F3.12):** login por papel, lista de práticas, ficha completa e fila de revisão do master. Roda em http://localhost:5174 (`npm run dev:admin`).
- **Papéis:** ALUNO, PROFESSOR, MASTER e ADMIN. Quem se cadastra pelo app nasce ALUNO; contas de equipe são criadas por `npm run conta:equipe -w @life/api`, nunca pelo app.
- **Fluxo de aprovação (ADM-06):** Rascunho → Em revisão → Aprovado ou Devolvido com comentário. Só o master aprova, ninguém aprova a própria prática, e editar uma prática aprovada devolve para revisão — a versão no ar não muda sozinha.
- **14 testes do painel**, incluindo: aluno não entra, professor não aprova, professor não vê rascunho de outro, e nenhuma rota do painel devolve dado de saúde.
- **PrimeVue removido:** mostrava "Invalid PrimeUI License" sobre a tela e não estava sendo usado. Decisão registrada em [decisoes.md](decisoes.md).

### 29/09/2026 (fim do dia)

- **Paleta da marca definida a partir da logo:** o azul passa a ser a cor principal (`#1c5b80`, com o profundo `#0e3050` e o claro `#3890b0`, todos tirados da imagem da logo) e o verde vira cor de apoio, puxado para o frio para conversar com o azul. As ações principais usam a mescla das duas, em gradiente. As cores saíram de dentro das telas para tokens em `theme/variables.css`. Registrada em [decisoes.md](decisoes.md).

### 29/09/2026 (noite)

- **Imagem de capa por prática:** campo `capaUrl` no conteúdo, escolhido pelo professor no painel (Fase 3). Aparece no cartão da prática de hoje, na lista da aba Praticar e na ficha da aula. Enquanto não houver imagem, o app **desenha a capa** a partir da modalidade — gradiente e símbolo próprios — em vez de mostrar um retângulo vazio.
- **Professor na ficha:** campo `professor`, mostrado como "com Fulano".

### 29/09/2026 (tarde)

- **Catálogo de demonstração no Render:** o seed passa a rodar a cada partida da API, mas só faz alguma coisa com `SEED_CATALOGO_DE_TESTE=1`. É idempotente (upsert) e, sem a variável, sai sem tocar no banco. Passo a passo em [hospedagem.md](hospedagem.md).

### 29/09/2026

- **Corrigido:** o histórico que o motor usa vinha da tabela de recomendações **incluindo o dia de hoje** — então pedir a recomendação duas vezes no mesmo dia penalizava a aula sugerida minutos antes, como se já tivesse sido praticada. Agora só contam dias anteriores. A aproximação some quando existir o evento de conclusão (F2.18): recomendar não é praticar.
- **MOT-03 reescrito: a adequação vence o relógio.** O tempo continua sendo teto (nada mais longo passa), mas abaixo dele é preferência: a prática mais curta perde até 15 pontos, enquanto o estado do dia vale 30 — então quem tem 60 minutos e está cansado recebe a prática suave de 30, e a tela explica que sobra tempo. Calibrado medindo os resultados com 0, 8, 10 e 15 pontos.
- **O critério de perfil parou de premiar o nível alto:** um praticante experiente era empurrado para o conteúdo mais avançado mesmo quando ele não servia ao objetivo. Experiência amplia repertório, não obriga a praticar o mais difícil (SEG-R01).

### 28/09/2026

- **Aba Praticar (F2.15):** `GET /catalogo` com filtros de duração, modalidade e objetivo, mais `GET /catalogo/:id`. A tela lista as aulas, filtra por tempo e modalidade e abre a ficha com duração, nível, intensidade e o que a aula ajuda. "Iniciar prática" agora leva à ficha da aula recomendada.
- **SEG-R02 na prática:** a biblioteca mostra até o que o motor não recomendaria hoje — deixar de recomendar não é proibir o acesso.

- **Motor ligado na tela (F2.2, F2.14, F2.16):** `PUT /checkin` guarda o check-in do dia e `GET /hoje` carrega perfil, saúde, catálogo e histórico, chama o motor e devolve a prática, gravando a recomendação com a auditoria. A aba Hoje mostra a prática principal, a alternativa e o "por quê".
- **Catálogo no banco:** as 22 práticas de teste viraram linhas da tabela `Content`, populadas por `npm run db:seed -w @life/api` (só em desenvolvimento).
- **Corrigido:** o motor oferecia "Saudações ao sol para gestantes" a quem não está grávida. Conteúdo de público específico agora só vai para quem pertence ao público.

- **Motor da prática do dia pronto (F1.1 a F1.13, F1.17 a F1.21):** o check-in vira recomendação passando por segurança (Bloco 1), tempo, nível técnico, score 0–100 com os pesos da aba 05, modificadores de trilha e repetição, e sai como principal + alternativa de outra natureza, com explicação e auditoria completa.
- **Regras transcritas da Matriz 1.1** com os IDs originais: SEG-001 a SEG-010, SEG-R01 a SEG-R05, EST-001 a EST-011, PER-003, PER-008, AYU-010 a AYU-012 e os pesos do ranking. Nova regra **EST-012** (humor), que não existe na Matriz.
- **61 testes no motor**, incluindo os cenários T01 (Ana), T02 (Ricardo) e T03 (Helena) da aba 13, e cobertura de 95%.

### 18/09/2026

- **CHK-07 feito:** link "Prefiro escolher minha prática" na aba Hoje, visível antes e depois do check-in, leva para a aba Praticar — quem não quer recomendação escolhe a própria aula.

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
