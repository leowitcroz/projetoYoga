# Hospedagem

Onde cada parte do LIFE roda fora da máquina de desenvolvimento.

| Parte | Onde | Endereço |
|---|---|---|
| App (aluno) | Vercel | a definir |
| API | Render | a definir |
| Banco | Render Postgres | interno, só a API enxerga |
| Painel (admin) | ainda não publicado | — |

Isto é a pendência **P-04** do plano, antecipada para o cliente poder testar no
celular dele. A hospedagem definitiva continua sendo assunto da Fase 7.

---

## API no Render, passo a passo

O repositório já tem o [`render.yaml`](../render.yaml) pronto: ele descreve a
API e o banco, então o Render cria os dois sozinho.

### 1. Criar o serviço

1. Entre em [render.com](https://render.com) com a conta do GitHub.
2. **New > Blueprint**.
3. Escolha o repositório `leowitcroz/projetoYoga` e confirme.
4. O Render mostra o que vai criar: o serviço `life-api` e o banco `life-db`.
   Clique em **Apply**.

O primeiro build demora alguns minutos. Ele roda:

```
npm ci --include=dev && npm run build -w @life/api
```

e sobe com:

```
npm run prisma:deploy -w @life/api && npm run start:prod -w @life/api
```

O `prisma:deploy` aplica as migrations a cada deploy, então o banco novo já
nasce com as tabelas certas.

### 2. Conferir se subiu

Quando o painel mostrar **Live**, abra `https://<nome-do-servico>.onrender.com/health`.
A resposta tem de ser:

```json
{ "status": "ok" }
```

### 3. Ligar o app na API

1. Copie o endereço da API (ex.: `https://life-api.onrender.com`).
2. Na **Vercel**, no projeto do app: *Settings > Environment Variables*, crie
   `VITE_API_URL` com esse endereço e mande republicar (*Redeploy*).
3. Copie o endereço do app na Vercel (ex.: `https://projeto-yoga.vercel.app`).
4. No **Render**, em *Environment*, preencha `CORS_ORIGIN` com o endereço do
   app. Sem isso o navegador bloqueia as chamadas.

Para mais de um endereço (produção e pré-visualização da Vercel), separe por
vírgula, sem espaços.

### 4. Variáveis de ambiente

| Variável | De onde vem | Para quê |
|---|---|---|
| `DATABASE_URL` | o Render preenche a partir do banco | conexão com o Postgres |
| `JWT_SECRET` | o Render gera sozinho | assina os tokens de acesso |
| `CORS_ORIGIN` | você preenche | endereços que podem chamar a API |
| `PORT` | o Render define | porta que a API escuta |

**Cuidado:** trocar o `JWT_SECRET` desconecta todo mundo que estiver logado.

---

## O que esperar do plano gratuito

- **O serviço dorme** depois de um tempo sem uso. A primeira chamada depois
  disso demora (algo entre alguns segundos e um minuto) enquanto ele acorda.
  Em uma demonstração ao cliente, vale abrir o `/health` alguns minutos antes.
- **O banco gratuito do Render tem prazo de validade** e é apagado quando
  vence. Serve para demonstração, não para dados de verdade. Antes de qualquer
  aluno usar o app, é preciso um banco pago (Render ou Neon) — e um backup.
- Confira os limites e preços atuais no site do Render antes de decidir: eles
  mudam com frequência.

## Se um dia mudar de ideia

Nada aqui prende o projeto ao Render: a API é um servidor Node comum, que roda
igual em Railway, Fly.io ou numa máquina virtual. O que precisa viajar junto é
o banco e as variáveis de ambiente.
