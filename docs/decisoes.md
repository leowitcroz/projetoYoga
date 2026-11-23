# Decisões do projeto LIFE

Registro das decisões tomadas. Atualize sempre que algo mudar.

## Tecnologia (10/09/2026)

| Parte | Escolha |
|---|---|
| App celular + site do usuário | Vue 3 + Ionic + Capacitor (`apps/app`) |
| Painel de professores/admin | Vue 3 + PrimeVue (`apps/admin`) |
| API | NestJS + PostgreSQL (`apps/api`) |
| Motor de recomendação | TypeScript puro com testes (`packages/motor`), casos T01–T03 da matriz como critérios de aceite |
| Vídeo e áudio | Serviço de streaming externo (Bunny, Mux ou Cloudflare), a definir |
| Áudio com tela bloqueada | Plugin do Capacitor; decidido seguir sem prova de conceito prévia |

## Fundação técnica (Fase 0, 11/09/2026)

- **TypeScript 6.0** em todo o monorepo. O TypeScript 7 já existe, mas o typescript-eslint ainda só suporta até o 6.0.
- **NestJS 12 em ESM** e **Vitest** em todos os projetos (o Nest 12 já vem com Vitest).
- **Prisma 7**, com o cliente gerado em `apps/api/src/generated/prisma`.
- **Um linter só:** ESLint (flat config na raiz) para TypeScript e Vue, no lugar do oxlint que o Nest traz.
- **Portas locais:** API 3100, app 5173, painel 5174, banco 5433. As portas 3000, 3333 e 5432 já são usadas por outros projetos neste PC.
- **App ID do Capacitor:** `com.life.app`, **provisório**. Confirmar antes de gerar o projeto Android (F4.4), porque não dá para mudar depois de publicar na loja.
- **npm 11** obrigatório (o npm 10.5.1 global deste PC quebra o `npm install`).

## Produto (10/09/2026)

- **Idioma:** somente português.
- **O que é diário (11/09/2026):** o onboarding (objetivos, relação com o Yoga, saúde, Ayurveda, preferências) acontece **só quando a pessoa cria a conta**. Do segundo dia em diante o app faz **apenas o check-in** ("como você está hoje?" + tempo disponível) e recomenda a aula. Quem não quiser responder toca em "Pular" e escolhe a própria aula na biblioteca.
- **Monetização:** ainda fora do escopo. Modelo futuro: mensalidade para ter acesso.
- **Login:** e-mail e senha no início. Futuro: Google e Facebook.
- **Offline:** não é necessário por enquanto.
- **Certificados:** fora do MVP.
- **Privacidade:** base da política em [`politica-de-privacidade.md`](politica-de-privacidade.md), pendente de revisão jurídica.

## Identidade visual

- **Fonte dos títulos:** Playfair Display (Google Fonts), que é a serifada das telas de referência. Hoje carrega pela internet; antes de publicar nas lojas precisa ser embutida no app, para funcionar sem conexão.
- **Cores:** azul-marinho `#14304f` (texto e botões), azul `#2f7ea6` (links), verde `#3c6a4c` (ações dentro do app).
- **Fundo das telas de perguntas:** uma imagem pronta (`src/assets/fundo-perguntas.jpg`), montada a partir da referência: paisagem à esquerda, degradê para o branco e folhas no rodapé, tudo numa imagem só. Antes eram três camadas em CSS, o que criava emendas e manchas.
- **Fundo das telas de dentro do app (23/11):** luz azulada vindo do alto e folhas no canto de baixo, numa regra só (`ion-content.tela` no tema). Antes as abas eram chapadas, e o app ficava genérico depois do cadastro. **Adaptação consciente:** a referência põe a paisagem numa coluna à esquerda ocupando mais de um terço da largura — num celular de 393px isso come metade da tela, então aqui ficou a atmosfera, sem o recorte da foto.
- **Superfícies de apoio (23/11):** o cartão que explica algo ("Por que esta prática?", "Dica rápida") é cinza de areia `#ebeae5`, sem borda, e a faixa do ditado é `#eeeadf`. Eram um creme alaranjado com contorno, que puxava o olho para o aviso em vez de para a prática. O creme com borda ficou só onde chamar atenção é o objetivo: os avisos de segurança.

## Conteúdo e catálogo

- **Quem define quantas aulas cada trilha/MVP tem:** o professor responsável.
- **Quem cataloga (preenche a ficha e as tags):** os próprios professores.
- **Quem aprova para entrar no catálogo:** apenas **professores master**. Hoje o master é **Marcos Crozetta**.
- Um conteúdo só pode ser recomendado automaticamente depois de aprovado por um master.

Papéis no painel:

| Papel | Pode |
|---|---|
| Professor | criar conteúdo, preencher ficha e tags, enviar para revisão, editar os próprios conteúdos |
| Professor master | tudo do professor + aprovar/reprovar conteúdos, publicar no catálogo |
| Admin | gerenciar usuários e papéis, pesos do motor |

## Paleta da marca

Decidida em 29/09/2026, com as cores tiradas da própria logo.

| Token | Cor | Onde |
|---|---|---|
| `--life-azul-profundo` | `#0e3050` | o traço escuro do círculo da logo; avatar, títulos fortes |
| `--life-azul` | `#1c5b80` | **cor principal**, início das ações e das capas |
| `--life-azul-claro` | `#3890b0` | a pincelada clara da logo; links e detalhes |
| `--life-verde` | `#35705f` | cor de apoio; seleções (opções do check-in, filtros) |
| `--life-verde-claro` | `#5b9382` | fim dos gradientes |

- **O azul manda.** É a cor da logo e a identidade do app.
- **O verde apoia**, e recua atrás do azul em vez de brigar com ele.
- **Nada de degradê nas ações.** Leonardo pediu para tirar em 29/09.

### Onde entra cada uma (esclarecido em 23/11)

A regra anterior dizia apenas "ações principais são azul sólido", e dava para
ler de duas maneiras. As telas de referência (`docs/midias de flow/`) mostram
uma divisão clara, e é ela que vale:

| Onde | Cor da ação | Exemplos nas referências |
|---|---|---|
| **Fora da conta** — boas-vindas, login, cadastro, perguntas do onboarding | **azul** `#1c5b80` | "Começar", "Continuar" |
| **Dentro do app** — abas e telas de prática e curso | **verde** `#42624d` | "Atualizar minha prática", "Iniciar prática", "Assistir agora" |
| Seleções (opção do check-in, tempo, filtro ativo) | verde | as caixas marcadas |

A leitura: o azul é a marca, e aparece enquanto a pessoa ainda está chegando;
o verde é o app trabalhando, e toma conta depois que ela entra.

**Tom do verde corrigido em 23/11:** era `#35705f`, escolhido "puxado para o
frio"; nas referências é `#42624d`, um verde de musgo mais escuro e menos
saturado. O frio continua — o que estava longe era o tom.
- As capas desenhadas das práticas partem todas do azul e caminham para a cor da modalidade: variedade sem perder a identidade.

## Painel sem PrimeVue

Decidido em 29/09/2026. O plano previa Vue + PrimeVue para o painel, mas o
PrimeVue instalado mostrava um aviso vermelho **"Invalid PrimeUI License"**
sobre a tela — e nenhum componente dele estava sendo usado: as telas foram
escritas em HTML e CSS, com a mesma paleta do app.

Removido. Se um dia o painel precisar de componentes prontos (tabelas com
ordenação, calendários), vale reavaliar — aí com a licença resolvida antes.

## Provedor de vídeo e áudio (P-03)

**Decisão vigente (01/10/2026): começar com o YouTube**, por escolha de Leonardo.
Mux fica como o caminho para quando o app sair do começo.

### Por que YouTube agora

Custo zero, nada para configurar e o Marcos já sabe publicar vídeo lá. Para
validar o produto com os primeiros alunos, isso vale mais do que a solução
definitiva. A troca é barata: guardamos apenas o **identificador da mídia**,
não a URL, então mudar de provedor é mexer no player e numa coluna.

### O que o YouTube custa em troca

1. **Áudio com a tela bloqueada não funciona.** Os Termos do YouTube reservam
   isso ao Premium, no app deles. O **PRA-04 é requisito do produto** — prática
   guiada por áudio com o celular no bolso — e fica **impossível** enquanto o
   vídeo estiver no YouTube. É a razão mais forte para a troca, não o preço.
2. **Duração não vem sozinha.** O ADM-04 previa a duração preenchida
   automaticamente no upload; com link do YouTube, o professor digita. Resolve
   com a API do YouTube (precisa de chave) se incomodar.
3. **Privacidade.** Mesmo com `youtube-nocookie.com`, parte do tráfego do aluno
   passa pelo Google. Precisa estar na política de privacidade antes de o app
   ir para alunos de verdade.
4. **Controle do conteúdo.** Vídeo não listado não aparece em busca, mas quem
   tem o link assiste sem ter conta no LIFE.

### Como catalogar enquanto for YouTube

- Vídeos **não listados**, nunca públicos.
- O player usa `youtube-nocookie.com`, sem vídeos relacionados no fim.
- A duração é digitada pelo professor, como já é hoje.

### Quando trocar

Quando qualquer uma destas acontecer: o áudio em segundo plano virar prioridade
(PRA-04), o conteúdo precisar ser realmente privado, ou o catálogo justificar o
custo. Aí vale o que está escrito abaixo.

---

## Provedor definitivo, quando sair do começo: Mux

### O que o LIFE precisa

| Necessidade | De onde vem |
|---|---|
| Upload pelo painel, com a duração preenchida sozinha | ADM-04 |
| Streaming adaptativo (a aluna pratica no 4G do celular) | PRA-03 |
| **Áudio continuando com a tela bloqueada** | PRA-04 |
| Vídeo privado, que só abre para quem tem conta | PRIV |
| Conta brasileira, cobrança previsível | — |

### Por que Mux

- A API de upload é direta e devolve a duração assim que o vídeo é processado — que é exatamente o que o ADM-04 pede, sem o professor digitar nada.
- Entrega HLS adaptativo, que é o que faz a prática não travar no 4G.
- Os links são assinados e expiram: o vídeo não vaza para fora do app.
- Cobra por minuto armazenado e por minuto assistido. Para um catálogo pequeno com poucos alunos — que é o começo do LIFE — isso custa pouco e cresce junto com o uso, em vez de cobrar um plano fixo desde o primeiro dia.

### Por que não as outras

- **YouTube/Vimeo não pagos:** vídeo público ou semi-público, com recomendações de terceiros no fim da prática. Não dá para um app com conteúdo de saúde.
- **Cloudflare Stream:** muito parecido e um pouco mais barato no armazenamento. Fica como segunda opção — a troca é de poucos dias, porque o que guardamos é só um identificador de mídia.
- **Guardar os vídeos nós mesmos** (S3 + player): mais barato no papel, mas significa cuidar de transcodificação, múltiplas resoluções e CDN. É trabalho de infraestrutura que não é o produto.

### O que isso não resolve

**O áudio com a tela bloqueada (PRA-04) não vem do provedor.** Ele é do aplicativo: no Capacitor, precisa de um plugin de áudio em segundo plano, com serviço em primeiro plano no Android e sessão de áudio no iOS. O provedor só entrega o arquivo; quem mantém tocando é o app. Isso continua sendo o maior risco técnico da Fase 4, e merece um teste cedo, antes de o catálogo estar pronto.

### Como fica guardado

A tabela `Content` ganha o identificador da mídia no provedor, não a URL: assim trocar de provedor é trocar uma coluna e o player, sem mexer no catálogo.

### Antes de assinar

Leonardo confirma a conta e os preços do dia (eles mudam), e o Marcos decide se o conteúdo antigo será migrado.

## Em aberto

- **Sinais de alerta e limites de persistência** (regras SEG-R03 e SEG-R04 da matriz): quem define? Proposta: os professores master redigem e, de preferência, um profissional de saúde valida.
- **Idade mínima:** não será 18. Falta definir a idade exata. Menores de 18 vão precisar de consentimento do responsável (LGPD, art. 14).

## Privacidade

- **Professores não veem dados de saúde individuais dos alunos** (decidido em 10/09/2026). Veem apenas estatísticas agregadas e anônimas dos próprios conteúdos.
