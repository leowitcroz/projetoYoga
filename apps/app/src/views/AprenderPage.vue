<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="conteudo">
        <header class="topo">
          <h1 class="titulo">Aprenda hoje</h1>
          <p class="subtitulo">Conhecimento no seu contexto, para uma vida mais equilibrada.</p>
        </header>

        <p v-if="carregando" class="recado">Carregando...</p>
        <p v-else-if="erro" class="recado">{{ erro }}</p>

        <template v-else>
          <!-- EDU-05: a aula do dia, a mesma durante o dia inteiro. -->
          <article v-if="inicio?.aulaDoDia" class="destaque">
            <button type="button" class="capa-area" @click="abrirAula(inicio.aulaDoDia.id)">
              <capa-de-curso
                :url="inicio.aulaDoDia.curso.capaUrl"
                :tema="inicio.aulaDoDia.curso.tema"
                alta
                :sem-simbolo="inicio.aulaDoDia.temVideo"
              />
              <span v-if="inicio.aulaDoDia.temVideo" class="play">
                <ion-icon :icon="playSharp" />
              </span>
            </button>

            <div class="destaque-texto">
              <h2 class="destaque-titulo">{{ inicio.aulaDoDia.titulo }}</h2>
              <p v-if="inicio.aulaDoDia.curso.professor" class="professor">
                {{ inicio.aulaDoDia.curso.professor }}
              </p>
              <p class="marcas">
                <span class="marca">{{ NOME_DO_TEMA[inicio.aulaDoDia.curso.tema] }}</span>
                <span class="marca">Nível: {{ nomeDoNivel(inicio.aulaDoDia.curso.nivel) }}</span>
              </p>
              <button type="button" class="assistir" @click="abrirAula(inicio.aulaDoDia.id)">
                {{ inicio.aulaDoDia.tipo === 'texto' ? 'Ler agora' : 'Assistir agora' }}
                <ion-icon :icon="arrowForwardOutline" />
              </button>
            </div>
          </article>

          <!-- EDU-03 -->
          <section v-if="inicio?.continueEstudando" class="bloco">
            <h2 class="bloco-titulo">Continue estudando</h2>

            <button type="button" class="retomar" @click="abrirAula(inicio.continueEstudando.proxima.id)">
              <capa-de-curso
                :url="inicio.continueEstudando.curso.capaUrl"
                :tema="inicio.continueEstudando.curso.tema"
                class="retomar-capa"
              />
              <span class="retomar-texto">
                <strong>{{ inicio.continueEstudando.curso.titulo }}</strong>
                <span class="detalhe">
                  Aula {{ inicio.continueEstudando.proxima.ordem }} –
                  {{ inicio.continueEstudando.proxima.titulo }}
                </span>
                <span v-if="inicio.continueEstudando.curso.professor" class="detalhe">
                  {{ inicio.continueEstudando.curso.professor }}
                </span>
                <span class="progresso">
                  <span class="barra">
                    <span class="barra-feita" :style="{ width: progresso + '%' }"></span>
                  </span>
                  {{ inicio.continueEstudando.concluidas }} de
                  {{ inicio.continueEstudando.totalAulas }}
                </span>
                <span class="continuar">Continuar <ion-icon :icon="arrowForwardOutline" /></span>
              </span>
            </button>
          </section>

          <section v-if="inicio?.recomendados.cursos.length" class="bloco">
            <h2 class="bloco-titulo">Cursos para você</h2>
            <p class="bloco-nota">
              {{
                inicio.recomendados.porTema
                  ? 'Pelos temas que você escolheu no cadastro.'
                  : 'Começos curtos, para experimentar.'
              }}
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
              <li v-for="curso in inicio.recomendados.cursos" :key="curso.id">
                <button type="button" class="cartao" @click="abrirCurso(curso.id)">
                  <capa-de-curso :url="curso.capaUrl" :tema="curso.tema" class="cartao-capa" />
                  <span class="cartao-titulo">{{ curso.titulo }}</span>
                  <span class="cartao-detalhe">
                    {{ curso.totalAulas }} {{ curso.totalAulas === 1 ? 'aula' : 'aulas' }} ·
                    {{ NOME_DO_TEMA[curso.tema] }}
                  </span>
                </button>
              </li>
            </ul>
          </section>

          <!-- EDU-06 -->
          <aside class="dica">
            <ion-icon :icon="bulbOutline" class="lampada" />
            <div>
              <p class="dica-titulo">Dica rápida</p>
              <p class="dica-texto">{{ dica.texto }}</p>
              <p class="dica-fonte">{{ dica.fonte }}</p>
            </div>
          </aside>

          <button type="button" class="ver-todos" @click="router.push('/tabs/aprender/cursos')">
            Ver todos os cursos
            <ion-icon :icon="arrowForwardOutline" />
          </button>

          <p v-if="!inicio?.aulaDoDia" class="recado">
            Nenhum curso publicado ainda. Os professores cadastram pelo painel.
          </p>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { arrowForwardOutline, bulbOutline, playSharp } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import CapaDeCurso from '@/components/CapaDeCurso.vue';
import { dicaDoDia } from '@/dados/dicas';
import {
  buscarInicio,
  nomeDoNivel,
  NOME_DO_TEMA,
  type InicioDoAprender,
} from '@/servicos/aprender';
import { usarArrasteDaFaixa } from '@/composicoes/arraste-da-faixa';

const router = useRouter();

const inicio = ref<InicioDoAprender | null>(null);
const carregando = ref(true);
const erro = ref('');
const dica = dicaDoDia();

const { faixa, aoPressionar, aoArrastar, aoSoltar, aoClicar } = usarArrasteDaFaixa();

const progresso = computed(() => {
  const atual = inicio.value?.continueEstudando;
  if (!atual || atual.totalAulas === 0) return 0;
  return Math.round((atual.concluidas / atual.totalAulas) * 100);
});

onMounted(async () => {
  try {
    inicio.value = await buscarInicio();
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível abrir o Aprender';
  } finally {
    carregando.value = false;
  }
});

function abrirAula(id: string) {
  router.push(`/tabs/aprender/aula/${id}`);
}

function abrirCurso(id: string) {
  router.push(`/tabs/aprender/curso/${id}`);
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
  margin: 0 0 4px;
  font-family: var(--life-serif);
  font-size: 1.7rem;
  line-height: 1.15;
  color: var(--life-azul-profundo);
}

.subtitulo {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.45;
  color: var(--life-texto-medio);
}

/* Aula do dia */

.destaque {
  margin-bottom: 22px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.capa-area {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.26);
  border: 2px solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  color: #fff;
  font-size: 1.4rem;
}

.destaque-texto {
  padding: 14px 16px 16px;
}

.destaque-titulo {
  margin: 0 0 2px;
  font-size: 1.08rem;
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
  margin: 0 0 14px;
}

.marca {
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--life-ficha);
  font-size: 0.78rem;
  color: var(--life-azul-profundo);
}

.assistir {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px;
  background: var(--life-verde);
  border: 0;
  border-radius: 999px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

/* Blocos */

.bloco {
  margin-bottom: 22px;
}

.bloco-titulo {
  margin: 0 0 4px;
  font-family: var(--life-serif);
  font-size: 1.15rem;
  color: var(--life-azul-profundo);
}

.bloco-nota {
  margin: 0 0 10px;
  font-size: 0.78rem;
  color: var(--life-texto-suave);
}

/* Continue estudando */

.retomar {
  width: 100%;
  display: flex;
  gap: 12px;
  margin-top: 8px;
  padding: 12px;
  background: var(--life-cartao);
  border: 0;
  border-radius: 14px;
  text-align: left;
  cursor: pointer;
}

.retomar-capa {
  flex: none;
  width: 92px;
}

.retomar-texto {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.retomar-texto strong {
  font-size: 0.95rem;
  color: var(--life-texto);
}

.detalhe {
  font-size: 0.8rem;
  color: var(--life-texto-suave);
}

.progresso {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.74rem;
  color: var(--life-texto-suave);
}

.barra {
  flex: 1;
  height: 4px;
  min-width: 40px;
  background: #fff;
  border-radius: 999px;
  overflow: hidden;
}

.barra-feita {
  display: block;
  height: 100%;
  background: var(--life-verde);
}

.continuar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  padding: 9px 14px;
  background: var(--life-verde);
  border-radius: 999px;
  color: #fff;
  font-size: 0.84rem;
  font-weight: 600;
}

/* Carrossel */

.carrossel {
  display: flex;
  gap: 12px;
  margin: 0;
  padding: 0 18px 4px 0;
  list-style: none;
  overflow-x: auto;
  scrollbar-width: none;
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
  width: 162px;
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

/* Dica do dia */

.dica {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  padding: 14px 16px;
  background: var(--life-atencao-fundo);
  border: 1px solid var(--life-atencao-borda);
  border-radius: 14px;
}

.lampada {
  flex: none;
  margin-top: 2px;
  font-size: 1.2rem;
  color: #a9792f;
}

.dica-titulo {
  margin: 0 0 4px;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--life-azul-profundo);
}

.dica-texto {
  margin: 0 0 4px;
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--life-texto-medio);
}

.dica-fonte {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--life-texto-suave);
}

.ver-todos {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px;
  background: var(--life-cartao);
  border: 0;
  border-radius: 999px;
  color: var(--life-azul-profundo);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
}

.recado {
  padding: 28px 0;
  text-align: center;
  color: var(--life-texto-suave);
}
</style>
