<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="conteudo">
        <header class="topo">
          <div class="saudacao">
            <h1 class="titulo">{{ saudacao }}, {{ primeiroNome }}</h1>
            <p class="acolhimento">“{{ acolhimento }}”</p>
          </div>

          <button
            type="button"
            class="avatar"
            :aria-label="'Perfil de ' + primeiroNome"
            @click="irParaPerfil"
          >
            <img v-if="foto" :src="foto" alt="" class="foto" />
            <ion-icon v-else :icon="personOutline" />
          </button>
        </header>

        <section class="bloco">
          <h2 class="bloco-titulo">Como você está hoje?</h2>

          <!-- Onde dói: só aparece para quem respondeu que sente dor (CHK-03). -->
          <div v-if="faltaLocalDaDor" class="carrossel">
            <p class="pergunta">
              <ion-icon :icon="iconeDaDor" class="pergunta-icone" />
              Onde está doendo?
            </p>

            <ul class="regioes">
              <li v-for="regiao in regioesDaDor" :key="regiao.valor">
                <button
                  type="button"
                  class="opcao regiao"
                  :class="{ escolhida: regiaoEscolhida === regiao.valor }"
                  @click="regiaoEscolhida = regiao.valor"
                >
                  {{ regiao.rotulo }}
                </button>
              </li>
            </ul>

            <p class="cuidado">
              Com dor, a prática vem mais suave. Dor forte ou persistente pede avaliação de um
              profissional de saúde.
            </p>

            <button
              type="button"
              class="continuar"
              :disabled="!regiaoEscolhida"
              @click="confirmarLocalDaDor"
            >
              Continuar
            </button>
          </div>

          <!-- Duas perguntas por vez, até responder as sete. -->
          <div v-else-if="perguntasDaVez.length" class="carrossel">
            <div v-for="pergunta in perguntasDaVez" :key="pergunta.id" class="dupla">
              <p class="pergunta">
                <ion-icon :icon="pergunta.icone" class="pergunta-icone" />
                {{ pergunta.pergunta }}
              </p>

              <ul class="opcoes">
                <li v-for="opcao in pergunta.opcoes" :key="opcao.valor">
                  <button
                    type="button"
                    class="opcao"
                    :class="{ escolhida: escolhas[pergunta.id] === opcao.valor }"
                    @click="escolhas[pergunta.id] = opcao.valor"
                  >
                    {{ opcao.rotulo }}
                  </button>
                </li>
              </ul>
            </div>

            <button type="button" class="continuar" :disabled="!podeContinuar" @click="continuar">
              Continuar
            </button>
          </div>

          <!-- Respondeu tudo: vira o resumo, que continua editável (CHK-04). -->
          <ul v-else class="resumo">
            <li
              v-for="pergunta in perguntas"
              :key="pergunta.id"
              :class="{ largo: pergunta.id === 'dor' }"
            >
              <button
                type="button"
                class="cartao"
                :class="{ atencao: pergunta.id === 'dor' && temDor() }"
                @click="refazer(pergunta.id)"
              >
                <ion-icon :icon="pergunta.icone" class="cartao-icone" />
                <span class="cartao-nome">{{ pergunta.nome }}</span>
                <span class="cartao-valor">{{ valorNoResumo(pergunta.id) }}</span>
              </button>
            </li>
          </ul>
        </section>

        <section v-if="checkinCompleto" class="bloco">
          <h2 class="bloco-titulo">Quanto tempo você tem hoje?</h2>

          <ul class="tempos">
            <li v-for="minutos in temposDisponiveis" :key="minutos">
              <button
                type="button"
                class="tempo"
                :class="{ escolhido: checkin.tempo === minutos }"
                @click="escolherTempo(minutos)"
              >
                {{ rotuloDoTempo(minutos) }}
              </button>
            </li>
          </ul>

          <button
            type="button"
            class="principal"
            :disabled="checkin.tempo === undefined"
            @click="atualizarPratica"
          >
            Recomendar minha prática
          </button>

          <p v-if="aviso" class="aviso">{{ aviso }}</p>
        </section>

        <!-- CHK-07: quem não quer recomendação escolhe a própria aula. -->
        <button type="button" class="escolher" @click="escolherSozinho">
          Prefiro escolher minha prática
        </button>

        <figure class="ditado">
          <blockquote>“{{ ditado.texto }}”</blockquote>
          <figcaption>{{ ditado.fonte }}</figcaption>
        </figure>

        <footer class="rodape">
          <img :src="lotus" alt="" class="lotus" />
          <p class="lema">Prática · Conhecimento · Equilíbrio para a vida</p>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { personOutline } from 'ionicons/icons';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import lotus from '@/assets/lotus.png';
import {
  perguntas,
  regioesDaDor,
  rotuloDaRegiao,
  rotuloDaResposta,
  rotuloDoTempo,
  temposDisponiveis,
  type ChaveCheckin,
} from '@/dados/checkin';
import { acolhimentoDoDia, ditadoDoDia, saudacaoDaHora } from '@/dados/frases';
import {
  carregarCheckin,
  checkin,
  escolherTempo,
  informarLocalDaDor,
  marcarEnviado,
  responder,
  temDor,
} from '@/servicos/checkin-do-dia';
import { sessao } from '@/servicos/sessao';

const router = useRouter();

// Saudação e frases são fixadas ao abrir a tela: não mudam enquanto a pessoa usa.
const agora = new Date();
const saudacao = saudacaoDaHora(agora);
const acolhimento = acolhimentoDoDia(agora);
const ditado = ditadoDoDia(agora);

const primeiroNome = computed(() => sessao.value?.usuario.nome.split(' ')[0] ?? '');
// Ainda não guardamos foto de perfil; o espaço já fica pronto para ela.
const foto = ref<string | null>(null);

/** Respostas da tela atual, antes de a pessoa confirmar no Continuar. */
const escolhas = reactive<Partial<Record<ChaveCheckin, string>>>({});
const regiaoEscolhida = ref<string | null>(null);
const aviso = ref('');

/** Teto de perguntas por tela. */
const MAXIMO_POR_TELA = 3;

/**
 * As próximas perguntas sem resposta. Lista vazia = respondeu todas.
 *
 * Em vez de sempre tirar três, dividimos o que falta em telas do mesmo
 * tamanho: com sete pendentes saem 3, 2 e 2, e nenhuma tela fica com uma
 * pergunta só, boiando no meio do vazio.
 */
const perguntasDaVez = computed(() => {
  const pendentes = perguntas.filter((pergunta) => checkin.respostas[pergunta.id] === undefined);
  if (pendentes.length === 0) return [];

  const telasQueFaltam = Math.ceil(pendentes.length / MAXIMO_POR_TELA);
  return pendentes.slice(0, Math.ceil(pendentes.length / telasQueFaltam));
});

const podeContinuar = computed(() =>
  perguntasDaVez.value.every((pergunta) => escolhas[pergunta.id] !== undefined),
);

/** Disse que dói, mas ainda não disse onde. */
const faltaLocalDaDor = computed(() => temDor() && checkin.localDaDor === undefined);

/** Respondeu tudo, inclusive a região da dor quando havia dor. */
const checkinCompleto = computed(() => perguntasDaVez.value.length === 0 && !faltaLocalDaDor.value);

const iconeDaDor = perguntas.find((pergunta) => pergunta.id === 'dor')?.icone ?? '';

/** No resumo, a dor aparece junto com a região: "Leve · Lombar". */
function valorNoResumo(id: ChaveCheckin): string | undefined {
  const valor = rotuloDaResposta(id, checkin.respostas[id]);
  if (id !== 'dor' || !temDor()) return valor;

  const regiao = rotuloDaRegiao(checkin.localDaDor);
  return regiao ? `${valor} · ${regiao}` : valor;
}

onMounted(async () => {
  await carregarCheckin();
});

async function continuar() {
  if (!podeContinuar.value) return;

  for (const pergunta of perguntasDaVez.value) {
    await responder(pergunta.id, escolhas[pergunta.id] as string);
    delete escolhas[pergunta.id];
  }
  aviso.value = '';
}

async function confirmarLocalDaDor() {
  if (!regiaoEscolhida.value) return;

  await informarLocalDaDor(regiaoEscolhida.value);
  regiaoEscolhida.value = null;
  aviso.value = '';
}

/** Tocar em um cartão do resumo devolve aquela pergunta ao carrossel (CHK-04). */
function refazer(id: ChaveCheckin) {
  escolhas[id] = checkin.respostas[id];
  delete checkin.respostas[id];
  // Mudar a resposta sobre dor também joga fora a região informada antes.
  if (id === 'dor') {
    checkin.localDaDor = undefined;
    regiaoEscolhida.value = null;
  }
  aviso.value = '';
}

async function atualizarPratica() {
  await marcarEnviado();
  // O motor entra na Fase 1 e o /hoje na Fase 2 (F2.16). Por enquanto, confirmamos.
  aviso.value = 'Check-in guardado. A prática de hoje chega quando o motor entrar.';
}

function irParaPerfil() {
  router.push('/tabs/eu');
}

/** CHK-07 — sem check-in não há recomendação; a pessoa vai à biblioteca. */
function escolherSozinho() {
  router.push('/tabs/praticar');
}
</script>

<style scoped>
.tela {
  --background: #f2f7f9;
}

.conteudo {
  box-sizing: border-box;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: calc(20px + var(--ion-safe-area-top, 0px)) 18px
    calc(18px + var(--ion-safe-area-bottom, 0px));
}

/* Cabeçalho */

.topo {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.saudacao {
  flex: 1;
  min-width: 0;
}

.titulo {
  margin: 0 0 6px;
  font-family: var(--life-serif);
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.15;
  color: #14304f;
}

.acolhimento {
  margin: 0;
  font-size: 0.82rem;
  font-style: italic;
  line-height: 1.4;
  color: #5b7183;
}

.avatar {
  flex: none;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  padding: 0;
  background: #3f6b52;
  border: 0;
  border-radius: 50%;
  color: #fff;
  font-size: 1.25rem;
  overflow: hidden;
}

.foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Blocos */

.bloco-titulo {
  margin: 0 0 12px;
  font-family: var(--life-serif);
  font-size: 1.1rem;
  font-weight: 600;
  color: #14304f;
}

/* Carrossel de perguntas */

.dupla + .dupla {
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid rgba(20, 48, 79, 0.08);
}

.pergunta {
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #4d627a;
}

.pergunta-icone {
  flex: none;
  font-size: 1.3rem;
  color: #3f6b52;
}

.opcoes {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.opcoes li {
  min-width: 0;
  display: flex;
}

.opcao {
  flex: 1;
  min-width: 0;
  display: grid;
  place-items: center;
  padding: 20px 6px;
  background: #fff;
  border: 1px solid rgba(20, 48, 79, 0.08);
  border-radius: 14px;
  color: #4d627a;
  font-size: 0.82rem;
  line-height: 1.25;
  text-align: center;
}

.opcao.escolhida {
  background: #3f6b52;
  border-color: #3f6b52;
  color: #fff;
}

.continuar {
  margin-top: 14px;
  width: 100%;
  padding: 13px;
  background: #3f6b52;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  border: 0;
  border-radius: 999px;
}

.continuar[disabled] {
  opacity: 0.45;
}

.regioes {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.regioes li {
  min-width: 0;
  display: flex;
}

.regiao {
  padding: 13px 4px;
  font-size: 0.75rem;
}

.cuidado {
  margin: 14px 0 0;
  font-size: 0.75rem;
  line-height: 1.45;
  color: #7a8da0;
}

/* Resumo das respostas */

.resumo {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.resumo li {
  min-width: 0;
  display: flex;
}

/* A dor ocupa a linha inteira: é a resposta que muda a segurança da prática. */
.resumo li.largo {
  grid-column: 1 / -1;
}

.resumo li.largo .cartao {
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  padding: 11px 10px;
}

.cartao.atencao {
  background: #fbf3ea;
  border-color: #e0c9a8;
}

.cartao {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 13px 5px;
  background: #fff;
  border: 1px solid rgba(20, 48, 79, 0.08);
  border-radius: 14px;
  text-align: center;
}

.cartao-icone {
  font-size: 1.4rem;
  color: #3f6b52;
}

.cartao-nome {
  font-size: 0.72rem;
  color: #14304f;
}

.cartao-valor {
  font-size: 0.68rem;
  color: #7a8da0;
}

/* Tempo */

.tempos {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 7px;
}

.tempos li {
  min-width: 0;
  display: flex;
}

.tempo {
  flex: 1;
  min-width: 0;
  padding: 11px 2px;
  background: #fff;
  border: 1px solid rgba(20, 48, 79, 0.08);
  border-radius: 12px;
  color: #4d627a;
  font-size: 0.85rem;
}

.tempo.escolhido {
  background: #3f6b52;
  border-color: #3f6b52;
  color: #fff;
}

.principal {
  margin-top: 14px;
  width: 100%;
  padding: 14px;
  background: #3f6b52;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  border: 0;
  border-radius: 999px;
}

.principal[disabled] {
  opacity: 0.45;
}

.aviso {
  margin: 10px 0 0;
  text-align: center;
  font-size: 0.78rem;
  color: #5b7183;
}

.escolher {
  align-self: center;
  padding: 6px 4px;
  background: none;
  border: 0;
  color: #3f6b52;
  font-size: 0.85rem;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Ditado do dia */

.ditado {
  margin: 0;
  padding: 18px 16px;
  background: #f3eee4;
  border-radius: 16px;
  text-align: center;
}

.ditado blockquote {
  margin: 0;
  font-family: var(--life-serif);
  font-size: 1rem;
  font-style: italic;
  line-height: 1.45;
  color: #14304f;
}

.ditado figcaption {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(20, 48, 79, 0.12);
  font-size: 0.72rem;
  color: #7a8da0;
}

/* Rodapé */

.rodape {
  margin-top: auto;
  padding-top: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.lotus {
  width: 26px;
  height: auto;
  opacity: 0.75;
}

.lema {
  margin: 0;
  text-align: center;
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8a9aa8;
}
</style>
