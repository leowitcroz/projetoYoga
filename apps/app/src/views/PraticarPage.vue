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
              <button
                type="button"
                class="area"
                :class="{ vazia: quantasNaArea(area.valor) === 0 }"
                :disabled="quantasNaArea(area.valor) === 0"
                @click="filtrarPorArea(area.valor)"
              >
                <ion-icon :icon="ICONE_DA_AREA[area.valor]" />
                <span class="area-nome">{{ area.nome }}</span>
                <span v-if="quantasNaArea(area.valor) === 0" class="area-aviso">em breve</span>
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

            <ul class="carrossel">
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
import {
  bodyOutline,
  chevronBackOutline,
  flowerOutline,
  leafOutline,
  moonOutline,
  playCircleOutline,
  searchOutline,
  sparklesOutline,
  waterOutline,
} from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import CapaDaPratica from '@/components/CapaDaPratica.vue';
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

const ICONE_DA_AREA: Record<string, string> = {
  asanas: bodyOutline,
  pranayama: waterOutline,
  meditacao: sparklesOutline,
  nidra: moonOutline,
  relaxamento: leafOutline,
  kriyas: flowerOutline,
};

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

function quantasNaArea(area: string): number {
  return biblioteca.value?.areas[area] ?? 0;
}

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
  padding: 11px 14px;
  background: #fff;
  border: 1px solid var(--life-borda);
  border-radius: 12px;
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
  gap: 6px;
  padding: 14px 6px;
  background: #fff;
  border: 1px solid var(--life-borda);
  border-radius: 12px;
  color: var(--life-azul-profundo);
  font-size: 1.35rem;
  cursor: pointer;
}

.area-nome {
  font-size: 0.78rem;
  color: var(--life-texto-medio);
  text-align: center;
}

.area.vazia {
  opacity: 0.55;
  cursor: default;
}

.area-aviso {
  font-size: 0.64rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--life-texto-suave);
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
  color: var(--life-verde);
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
  scroll-snap-type: x mandatory;
}

.carrossel::-webkit-scrollbar {
  display: none;
}

.carrossel li {
  flex: none;
  width: 156px;
  scroll-snap-align: start;
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
  padding: 9px 16px;
  background: #fff;
  border: 1px solid var(--life-borda);
  border-radius: 999px;
  color: var(--life-texto-medio);
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
  background: #fff;
  border: 1px solid var(--life-borda);
  border-radius: 12px;
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
