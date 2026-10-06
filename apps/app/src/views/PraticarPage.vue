<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="conteudo">
        <!-- Biblioteca: a porta de entrada (PRA-01) -->
        <template v-if="!temFiltro">
          <header class="topo">
            <h1 class="titulo">O que você quer praticar?</h1>
            <p class="subtitulo">Biblioteca de atividades.</p>
          </header>

          <label class="busca">
            <ion-icon :icon="searchOutline" />
            <input
              v-model="termo"
              type="search"
              placeholder="Buscar práticas..."
              enterkeyhint="search"
              @keyup.enter="buscarPorNome"
            />
          </label>

          <ul class="areas">
            <li v-for="area in AREAS_DA_BIBLIOTECA" :key="area.valor">
              <button type="button" class="area" @click="filtrarPorArea(area.valor)">
                <span class="area-simbolo"><icone-da-area :area="area.valor" /></span>
                <span class="area-nome">{{ area.nome }}</span>
              </button>
            </li>
          </ul>

          <!-- PRA-01: vem do objetivo que a pessoa declarou no cadastro. Sem
               perfil preenchido, a faixa não aparece — "para você" sem nada da
               pessoa seria só uma lista qualquer com nome bonito. -->
          <section v-if="paraVoce.length" class="bloco">
            <header class="bloco-topo">
              <h2 class="bloco-titulo">Para você</h2>
              <button type="button" class="ver-todos" @click="filtrarPorObjetivo(objetivoDoPerfil)">
                Ver todos
              </button>
            </header>
            <p class="bloco-nota">
              Pelo que você contou que busca: {{ NOME_DO_OBJETIVO[objetivoDoPerfil ?? ''] }}.
            </p>

            <ul
              ref="faixa"
              class="carrossel"
              @pointerdown="aoPressionar"
              @pointermove="aoArrastar"
              @pointerup="aoSoltar"
              @pointercancel="aoSoltar"
              @click.capture="aoClicar"
            >
              <li v-for="aula in paraVoce" :key="aula.id">
                <button type="button" class="cartao" @click="abrir(aula.id)">
                  <capa-da-pratica
                    :url="aula.capaUrl"
                    :modalidade="aula.modalidade"
                    class="cartao-capa"
                  />
                  <span class="cartao-titulo">{{ aula.titulo }}</span>
                  <span class="cartao-detalhe">
                    {{ aula.duracaoMin }} min
                    <template v-if="aula.professor"> · {{ aula.professor }}</template>
                  </span>
                </button>
              </li>
            </ul>
          </section>

          <section v-if="objetivos.length" class="bloco">
            <h2 class="bloco-titulo">Explorar por objetivo</h2>
            <ul class="fichas">
              <li v-for="objetivo in objetivos" :key="objetivo">
                <button type="button" class="ficha" @click="filtrarPorObjetivo(objetivo)">
                  {{ NOME_DO_OBJETIVO[objetivo] ?? objetivo }}
                </button>
              </li>
            </ul>
          </section>

          <p v-if="erro" class="recado">{{ erro }}</p>
        </template>

        <!-- Lista filtrada -->
        <template v-else>
          <header class="topo-lista">
            <button type="button" class="voltar" @click="limparFiltro">
              <ion-icon :icon="chevronBackOutline" />
              Biblioteca
            </button>
            <h1 class="titulo-lista">{{ tituloDoFiltro }}</h1>
            <p class="subtitulo">
              {{ aulas.length }}
              {{ aulas.length === 1 ? 'prática encontrada' : 'práticas encontradas' }}
            </p>
          </header>

          <p v-if="carregando" class="recado">Carregando as aulas...</p>
          <p v-else-if="erro" class="recado">{{ erro }}</p>
          <p v-else-if="aulas.length === 0" class="recado">
            Nada por aqui ainda. Volte à biblioteca e tente outro caminho.
          </p>

          <ul v-else class="aulas">
            <li v-for="aula in aulas" :key="aula.id">
              <button type="button" class="aula" @click="abrir(aula.id)">
                <capa-da-pratica
                  :url="aula.capaUrl"
                  :modalidade="aula.modalidade"
                  class="aula-capa"
                />

                <span class="aula-texto">
                  <span class="aula-modalidade">
                    {{ NOME_DA_MODALIDADE[aula.modalidade] ?? aula.modalidade }}
                  </span>
                  <span class="aula-titulo">{{ aula.titulo }}</span>
                  <span class="aula-detalhes">
                    {{ aula.duracaoMin }} min · {{ nomeDoNivel(aula.nivelTecnico) }} ·
                    {{ nomeDaIntensidade(aula.demandaFisica) }}
                  </span>
                  <span v-if="aula.temVideo" class="aula-video">
                    <ion-icon :icon="playCircleOutline" />
                    com vídeo
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { chevronBackOutline, playCircleOutline, searchOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import CapaDaPratica from '@/components/CapaDaPratica.vue';
import IconeDaArea from '@/components/IconeDaArea.vue';
import {
  AREAS_DA_BIBLIOTECA,
  buscarBiblioteca,
  buscarParaVoce,
  listarAulas,
  nomeDaIntensidade,
  nomeDoNivel,
  NOME_DA_MODALIDADE,
  NOME_DO_OBJETIVO,
  type AulaDaLista,
  type Biblioteca,
} from '@/servicos/catalogo';

const router = useRouter();

const biblioteca = ref<Biblioteca | null>(null);
const paraVoce = ref<AulaDaLista[]>([]);
const objetivoDoPerfil = ref<string | null>(null);
const aulas = ref<AulaDaLista[]>([]);
const termo = ref('');
const carregando = ref(false);
const erro = ref('');

/** O que está filtrando agora. Nulo nos três = a tela mostra a biblioteca. */
const filtro = ref<{ area?: string; objetivo?: string; busca?: string }>({});
const temFiltro = computed(() => Object.keys(filtro.value).length > 0);

const tituloDoFiltro = computed(() => {
  const atual = filtro.value;
  if (atual.area) {
    return AREAS_DA_BIBLIOTECA.find((area) => area.valor === atual.area)?.nome ?? atual.area;
  }
  if (atual.objetivo) return NOME_DO_OBJETIVO[atual.objetivo] ?? atual.objetivo;
  return `Busca por "${atual.busca}"`;
});

/**
 * Os objetivos que a tela oferece.
 *
 * Saem do catálogo, não de uma lista escrita à mão: atalho que leva a lista
 * vazia é pior do que atalho nenhum. Vêm ordenados pelos que mais aparecem.
 */
const objetivos = computed(() => {
  const contagem = biblioteca.value?.objetivos ?? {};
  return Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .map(([nome]) => nome)
    .slice(0, 8);
});

onMounted(async () => {
  try {
    const [dados, recomendadas] = await Promise.all([buscarBiblioteca(), buscarParaVoce()]);
    biblioteca.value = dados;
    paraVoce.value = recomendadas.aulas;
    objetivoDoPerfil.value = recomendadas.objetivo;
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível abrir a biblioteca';
  }
});

async function aplicar(novo: { area?: string; objetivo?: string; busca?: string }) {
  filtro.value = novo;
  carregando.value = true;
  erro.value = '';
  try {
    aulas.value = await listarAulas(novo);
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível carregar';
    aulas.value = [];
  } finally {
    carregando.value = false;
  }
}

function filtrarPorArea(area: string) {
  void aplicar({ area });
}

function filtrarPorObjetivo(objetivo: string | null) {
  if (objetivo) void aplicar({ objetivo });
}

function buscarPorNome() {
  const texto = termo.value.trim();
  if (texto.length >= 2) void aplicar({ busca: texto });
}

function limparFiltro() {
  filtro.value = {};
  aulas.value = [];
  termo.value = '';
}

/**
 * Arrastar a faixa com o mouse.
 *
 * No celular o navegador já rola a faixa com o dedo, mas no computador não
 * existe arrastar área de rolagem: só a roda. Quem olha um carrossel tenta
 * puxar, não dá certo, e a tela parece quebrada. Aqui o ponteiro passa a
 * puxar — e no toque saímos do caminho, porque o navegador faz melhor.
 */
const faixa = ref<HTMLElement | null>(null);
/** Quanto o ponteiro precisa andar para ser arraste, e não clique trêmulo. */
const LIMIAR = 6;

let pressionado = false;
let arrastando = false;
let partiuDe = 0;
let rolagemInicial = 0;
let andou = 0;

function aoPressionar(evento: PointerEvent) {
  if (evento.pointerType === 'touch' || !faixa.value) return;

  pressionado = true;
  arrastando = false;
  andou = 0;
  partiuDe = evento.clientX;
  rolagemInicial = faixa.value.scrollLeft;
}

function aoArrastar(evento: PointerEvent) {
  if (!pressionado || !faixa.value) return;

  const distancia = evento.clientX - partiuDe;
  andou = Math.abs(distancia);

  // A captura do ponteiro só entra depois que vira arraste: capturada no
  // apertar, ela faz o clique seguinte chegar na faixa em vez do cartão, e
  // tocar numa aula deixa de abrir a aula.
  if (!arrastando && andou > LIMIAR) {
    arrastando = true;
    faixa.value.setPointerCapture(evento.pointerId);
  }
  if (!arrastando) return;

  faixa.value.scrollLeft = rolagemInicial - distancia;
  evento.preventDefault();
}

function aoSoltar(evento: PointerEvent) {
  if (arrastando && faixa.value?.hasPointerCapture(evento.pointerId)) {
    faixa.value.releasePointerCapture(evento.pointerId);
  }
  pressionado = false;
  arrastando = false;
}

/** Puxar a faixa não pode abrir a aula que estava debaixo do dedo. */
function aoClicar(evento: MouseEvent) {
  if (andou > LIMIAR) {
    evento.preventDefault();
    evento.stopPropagation();
  }
}

function abrir(id: string) {
  router.push(`/tabs/praticar/${id}`);
}
</script>

<style scoped>
.tela {
  --background: var(--life-fundo);
}

.conteudo {
  box-sizing: border-box;
  min-height: 100%;
  padding: calc(20px + var(--ion-safe-area-top, 0px)) 18px 18px;
}

.topo {
  margin-bottom: 16px;
}

.titulo {
  margin: 0 0 2px;
  font-family: var(--life-serif);
  font-size: 1.6rem;
  line-height: 1.2;
  color: var(--life-azul-profundo);
}

.subtitulo {
  margin: 0;
  font-size: 0.92rem;
  color: var(--life-texto-medio);
}

/* Busca */

.busca {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid var(--life-borda);
  border-radius: 14px;
  color: var(--life-texto-suave);
}

.busca input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: none;
  font: inherit;
  font-size: 0.9rem;
  color: var(--life-texto);
}

/* As seis áreas */

.areas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 0 0 22px;
  padding: 0;
  list-style: none;
}

.area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 6px 12px;
  background: var(--life-cartao);
  border: 0;
  border-radius: 14px;
  cursor: pointer;
}

.area-simbolo {
  width: 42px;
  height: 36px;
}

.area-nome {
  font-size: 0.8rem;
  color: var(--life-azul-profundo);
  text-align: center;
}

/* Blocos */

.bloco {
  margin-bottom: 22px;
}

.bloco-topo {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.bloco-titulo {
  margin: 0 0 4px;
  font-family: var(--life-serif);
  font-size: 1.15rem;
  color: var(--life-azul-profundo);
}

.ver-todos {
  padding: 0;
  background: none;
  border: 0;
  color: var(--life-azul);
  font-size: 0.82rem;
  cursor: pointer;
}

.bloco-nota {
  margin: 0 0 10px;
  font-size: 0.78rem;
  color: var(--life-texto-suave);
}

/* Carrossel do "Para você" */

.carrossel {
  display: flex;
  gap: 12px;
  margin: 0;
  padding: 0 18px 4px 0;
  list-style: none;
  overflow-x: auto;
  scrollbar-width: none;
  /* Sem encaixe: com `scroll-snap`, a faixa puxava sozinha para a borda do
     cartão mais próximo e o movimento virava troca de slide em vez de
     rolagem. Aqui ela para onde a pessoa soltou. */
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  cursor: grab;
}

.carrossel:active {
  cursor: grabbing;
}

.carrossel::-webkit-scrollbar {
  display: none;
}

.carrossel li {
  flex: none;
  width: 156px;
}

.cartao {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0;
  background: none;
  border: 0;
  text-align: left;
  cursor: pointer;
}

.cartao-capa {
  width: 100%;
  margin-bottom: 4px;
}

.cartao-titulo {
  font-size: 0.86rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--life-texto);
}

.cartao-detalhe {
  font-size: 0.76rem;
  color: var(--life-texto-suave);
}

/* Fichas de objetivo */

.fichas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ficha {
  padding: 10px 18px;
  background: var(--life-ficha);
  border: 0;
  border-radius: 999px;
  color: var(--life-azul-profundo);
  font-size: 0.84rem;
  cursor: pointer;
}

/* Lista filtrada */

.topo-lista {
  margin-bottom: 16px;
}

.voltar {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
  padding: 0;
  background: none;
  border: 0;
  color: var(--life-verde);
  font-size: 0.85rem;
  cursor: pointer;
}

.titulo-lista {
  margin: 0 0 2px;
  font-family: var(--life-serif);
  font-size: 1.5rem;
  color: var(--life-azul-profundo);
}

.aulas {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.aula {
  width: 100%;
  display: flex;
  gap: 12px;
  padding: 10px;
  background: var(--life-cartao);
  border: 0;
  border-radius: 14px;
  text-align: left;
  cursor: pointer;
}

.aula-capa {
  flex: none;
  width: 84px;
}

.aula-texto {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.aula-modalidade {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--life-texto-suave);
}

.aula-titulo {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--life-texto);
}

.aula-detalhes {
  font-size: 0.78rem;
  color: var(--life-texto-medio);
}

.aula-video {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: 0.76rem;
  color: var(--life-verde);
}

.recado {
  padding: 32px 0;
  text-align: center;
  color: var(--life-texto-suave);
}
</style>
