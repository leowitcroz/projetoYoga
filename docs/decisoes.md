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

## Produto (10/09/2026)

- **Idioma:** somente português.
- **Monetização:** ainda fora do escopo. Modelo futuro: mensalidade para ter acesso.
- **Login:** e-mail e senha no início. Futuro: Google e Facebook.
- **Offline:** não é necessário por enquanto.
- **Certificados:** fora do MVP.
- **Privacidade:** base da política em [`politica-de-privacidade.md`](politica-de-privacidade.md), pendente de revisão jurídica.

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

## Em aberto

- **Sinais de alerta e limites de persistência** (regras SEG-R03 e SEG-R04 da matriz): quem define? Proposta: os professores master redigem e, de preferência, um profissional de saúde valida.
- **Idade mínima:** não será 18. Falta definir a idade exata. Menores de 18 vão precisar de consentimento do responsável (LGPD, art. 14).

## Privacidade

- **Professores não veem dados de saúde individuais dos alunos** (decidido em 10/09/2026). Veem apenas estatísticas agregadas e anônimas dos próprios conteúdos.
