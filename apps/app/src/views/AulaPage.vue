<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="conteudo">
        <button type="button" class="voltar" aria-label="Voltar" @click="voltar">
          <ion-icon :icon="chevronBackOutline" />
          Praticar
        </button>

        <p v-if="carregando" class="recado">Carregando...</p>
        <p v-else-if="erro" class="recado">{{ erro }}</p>

        <template v-else-if="aula">
          <h1 class="titulo">{{ ehARecomendada ? 'Sua prática de hoje' : aula.titulo }}</h1>
          <p class="tempo">{{ aula.duracaoMin }} minutos</p>
          <p v-if="ehARecomendada" class="chamada">
            Uma sequência pensada para hoje, a partir do seu perfil e do seu check-in.
          </p>

          <!-- PRA-03: a capa segura o play até a pessoa pedir; só então o -->
          <!-- vídeo é carregado, para o YouTube não ser contatado antes disso. -->
          <div v-if="tocando && urlDoVideo" class="player">
            <iframe
              :src="urlDoVideo"
              :title="aula.titulo"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowfullscreen
              referrerpolicy="strict-origin-when-cross-origin"
            ></iframe>
          </div>

          <div v-else class="capa-area">
            <capa-da-pratica
              :url="aula.capaUrl"
              :modalidade="aula.modalidade"
              alta
              class="capa"
            />
            <button
              v-if="urlDoVideo"
              type="button"
              class="play"
              :aria-label="`Assistir ${aula.titulo}`"
              @click="comecar"
            >
              <ion-icon :icon="playSharp" />
            </button>
          </div>

          <!-- Identificação da aula -->
          <article class="cartao identificacao">
            <h2 class="aula-titulo">{{ aula.titulo }}</h2>
            <p v-if="aula.professor" class="professor">{{ aula.professor }}</p>
            <p class="marcas">
              <span class="marca">{{ NOME_DA_MODALIDADE[aula.modalidade] ?? aula.modalidade }}</span>
              <span class="marca">Nível: {{ nomeDoNivel(aula.nivelTecnico) }}</span>
            </p>
          </article>

          <!-- PRA-07: a estrutura só aparece quando o professor a descreveu. -->
          <section v-if="estrutura.length" class="bloco">
            <h2 class="bloco-titulo">O que esta prática inclui</h2>
            <ul class="partes">
              <li v-for="parte in estrutura" :key="parte.tipo" class="parte">
                <span class="simbolo" :class="parte.tom">
                  <img :src="parte.icone" alt="" />
                </span>
                <span class="sobre">
                  <strong>{{ parte.nome }} – {{ parte.minutos }} min</strong>
                  <span class="detalhe">{{ parte.descricao }}</span>
                </span>
              </li>
            </ul>
          </section>

          <button
            v-if="urlDoVideo"
            type="button"
            class="iniciar"
            @click="comecar"
          >
            Iniciar prática
            <ion-icon :icon="arrowForwardOutline" />
          </button>
          <p v-else class="aviso">
            Esta prática ainda não tem vídeo. O professor publica pelo painel.
          </p>

          <!-- MOT-09. Só quando a prática é a que o motor indicou: quem -->
          <!-- escolheu sozinho na aba Praticar não recebeu indicação nenhuma, -->
          <!-- e dizer que recebeu seria falso. -->
          <aside v-if="porque" class="porque">
            <ion-icon :icon="bulbOutline" class="lampada" />
            <div>
              <p class="porque-titulo">Por que esta prática?</p>
              <p class="porque-texto">{{ porque }}</p>
            </div>
          </aside>

          <section v-else-if="objetivos.length" class="bloco">
            <h2 class="bloco-titulo">O que ela trabalha</h2>
            <ul class="objetivos">
              <li v-for="objetivo in objetivos" :key="objetivo">
                {{ NOME_DO_OBJETIVO[objetivo] ?? objetivo }}
              </li>
            </ul>
          </section>

        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { arrowForwardOutline, bulbOutline, chevronBackOutline, playSharp } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import CapaDaPratica from '@/components/CapaDaPratica.vue';
import { useRoute, useRouter } from 'vue-router';
import { recomendacao } from '@/servicos/pratica-de-hoje';
import { montarEstrutura, porqueDaPratica } from '@/dados/blocos-da-pratica';
import {
  buscarAula,
  nomeDoNivel,
  NOME_DA_MODALIDADE,
  NOME_DO_OBJETIVO,
  type Aula,
} from '@/servicos/catalogo';

const rota = useRoute();
const router = useRouter();

const aula = ref<Aula | null>(null);
const carregando = ref(true);
const erro = ref('');
const tocando = ref(false);

/** A estrutura da ficha, já com o nome e o símbolo de cada bloco. */
const estrutura = computed(() => montarEstrutura(aula.value?.estrutura));

/** A prática que o motor indicou hoje, se houve uma. */
const recomendada = computed(() => {
  const principal = recomendacao.value?.principal;
  return principal ? { id: principal.conteudo.id, explicacao: principal.explicacao } : undefined;
});

const ehARecomendada = computed(() => porque.value !== undefined);
const porque = computed(() => porqueDaPratica(aula.value?.id, recomendada.value));

/**
 * O endereço do player.
 *
 * Usamos o domínio sem cookies e desligamos os vídeos relacionados do fim:
 * ninguém termina uma prática e cai num vídeo de terceiros.
 */
const urlDoVideo = computed(() => {
  const aulaAtual = aula.value;
  if (!aulaAtual?.videoId || aulaAtual.videoProvedor !== 'youtube') return null;

  const parametros = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    autoplay: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${aulaAtual.videoId}?${parametros.toString()}`;
});

/** Só os objetivos que a aula realmente atende, do mais forte para o mais fraco. */
const objetivos = computed(() => {
  const lista = Object.entries(aula.value?.objetivos ?? {});
  return lista
    .filter(([, peso]) => peso > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([nome]) => nome);
});

onMounted(async () => {
  try {
    aula.value = await buscarAula(String(rota.params.id));
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível abrir a aula';
  } finally {
    carregando.value = false;
  }
});

function comecar() {
  tocando.value = true;
}

function voltar() {
  router.back();
}
</script>

<style scoped>
/* O fundo (luz do alto + folhas) vem da regra de `ion-content.tela` no tema:
   é uma atmosfera só, igual em todas as abas. */

.conteudo {
  box-sizing: border-box;
  min-height: 100%;
  padding: calc(18px + var(--ion-safe-area-top, 0px)) 18px
    calc(18px + var(--ion-safe-area-bottom, 0px));
}

.voltar {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 14px;
  padding: 0;
  background: none;
  border: 0;
  color: var(--life-verde);
  font-size: 0.85rem;
}

.titulo {
  margin: 0 0 2px;
  font-family: var(--life-serif);
  font-size: 1.85rem;
  line-height: 1.15;
  color: var(--life-azul-profundo);
}

.tempo {
  margin: 0 0 6px;
  font-size: 1.05rem;
  color: var(--life-texto-medio);
}

.chamada {
  margin: 0 0 18px;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--life-texto-medio);
}

.capa-area {
  position: relative;
  margin-bottom: 16px;
}

.capa {
  margin: 0;
}

.play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  padding: 0;
  background: rgba(255, 255, 255, 0.28);
  border: 2px solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  color: #fff;
  font-size: 1.5rem;
  backdrop-filter: blur(2px);
}

.player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  margin-bottom: 16px;
  background: #000;
  border-radius: 14px;
  overflow: hidden;
}

.player iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.cartao {
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--life-borda);
  border-radius: 14px;
}

.identificacao {
  margin-bottom: 20px;
}

.aula-titulo {
  margin: 0 0 2px;
  font-size: 1.1rem;
  color: var(--life-azul-profundo);
}

.professor {
  margin: 0 0 10px;
  font-size: 0.86rem;
  color: var(--life-texto-suave);
}

.marcas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
}

.marca {
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--life-verde-suave);
  font-size: 0.78rem;
  color: var(--life-verde);
}

.bloco {
  margin-bottom: 20px;
}

.bloco-titulo {
  margin: 0 0 12px;
  font-family: var(--life-serif);
  font-size: 1.15rem;
  color: var(--life-azul-profundo);
}

.partes {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.parte {
  display: flex;
  align-items: center;
  gap: 12px;
}

.simbolo {
  flex: none;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
}

/* Os desenhos da marca são traço azul-marinho; dentro do círculo colorido
   eles precisam ser brancos, e o filtro faz isso sem uma segunda cópia de
   cada arquivo. */
.simbolo img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.simbolo.rosa {
  background: #9c5f6e;
}

.simbolo.verde {
  background: var(--life-verde);
}

.simbolo.azul {
  background: var(--life-azul-claro);
}

.simbolo.dourado {
  background: #c99a4e;
}

.sobre {
  min-width: 0;
}

.sobre strong {
  display: block;
  font-size: 0.95rem;
  color: var(--life-texto);
}

.detalhe {
  font-size: 0.82rem;
  color: var(--life-texto-suave);
}

.iniciar {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 18px;
  padding: 15px;
  background: var(--life-verde);
  border: 0;
  border-radius: 999px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
}

.porque {
  display: flex;
  gap: 12px;
  margin-bottom: 22px;
  padding: 15px 16px;
  background: var(--life-apoio);
  border-radius: 14px;
}

.lampada {
  flex: none;
  margin-top: 2px;
  font-size: 1.2rem;
  color: var(--life-verde);
}

.porque-titulo {
  margin: 0 0 4px;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--life-azul-profundo);
}

.porque-texto {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--life-texto-medio);
}

.objetivos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.objetivos li {
  padding: 5px 12px;
  background: #fff;
  border: 1px solid var(--life-borda);
  border-radius: 999px;
  font-size: 0.82rem;
  color: var(--life-texto-medio);
}

.aviso {
  margin: 0 0 20px;
  padding: 12px 14px;
  background: var(--life-atencao-fundo);
  border: 1px solid var(--life-atencao-borda);
  border-radius: 12px;
  font-size: 0.85rem;
  color: var(--life-texto-medio);
}

.recado {
  padding: 40px 0;
  text-align: center;
  color: var(--life-texto-suave);
}
</style>
