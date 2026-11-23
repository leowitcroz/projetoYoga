<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="conteudo">
        <button type="button" class="voltar" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
          Aprender
        </button>

        <h1 class="titulo">Todos os cursos</h1>
        <p class="subtitulo">
          {{ cursos.length }} {{ cursos.length === 1 ? 'curso' : 'cursos' }}
          <template v-if="temFiltro"> com os filtros escolhidos</template>
        </p>

        <section v-if="filtros" class="filtros">
          <div v-if="temasDisponiveis.length" class="grupo">
            <h2 class="grupo-titulo">Tema</h2>
            <ul class="fichas">
              <li v-for="tema in temasDisponiveis" :key="tema">
                <button
                  type="button"
                  class="ficha"
                  :class="{ ativa: escolha.tema === tema }"
                  @click="alternar('tema', tema)"
                >
                  {{ NOME_DO_TEMA[tema] ?? tema }}
                </button>
              </li>
            </ul>
          </div>

          <div v-if="filtros.niveis.length > 1" class="grupo">
            <h2 class="grupo-titulo">Nível</h2>
            <ul class="fichas">
              <li v-for="nivel in filtros.niveis" :key="nivel">
                <button
                  type="button"
                  class="ficha"
                  :class="{ ativa: escolha.nivel === nivel }"
                  @click="alternar('nivel', nivel)"
                >
                  {{ nomeDoNivel(nivel) }}
                </button>
              </li>
            </ul>
          </div>

          <div v-if="filtros.tipos.length > 1" class="grupo">
            <h2 class="grupo-titulo">Tipo</h2>
            <ul class="fichas">
              <li v-for="tipo in filtros.tipos" :key="tipo">
                <button
                  type="button"
                  class="ficha"
                  :class="{ ativa: escolha.tipo === tipo }"
                  @click="alternar('tipo', tipo)"
                >
                  {{ NOME_DO_TIPO[tipo] ?? tipo }}
                </button>
              </li>
            </ul>
          </div>

          <button v-if="temFiltro" type="button" class="limpar" @click="limpar">
            Limpar filtros
          </button>
        </section>

        <p v-if="carregando" class="recado">Carregando...</p>
        <p v-else-if="erro" class="recado">{{ erro }}</p>
        <p v-else-if="cursos.length === 0" class="recado">
          Nenhum curso com esses filtros. Tente outra combinação.
        </p>

        <ul v-else class="lista">
          <li v-for="curso in cursos" :key="curso.id">
            <button type="button" class="curso" @click="router.push(`/tabs/aprender/curso/${curso.id}`)">
              <capa-de-curso :url="curso.capaUrl" :tema="curso.tema" class="curso-capa" />
              <span class="curso-texto">
                <span class="curso-tema">{{ NOME_DO_TEMA[curso.tema] ?? curso.tema }}</span>
                <span class="curso-titulo">{{ curso.titulo }}</span>
                <span class="curso-detalhe">
                  {{ curso.totalAulas }} {{ curso.totalAulas === 1 ? 'aula' : 'aulas' }} ·
                  {{ nomeDoNivel(curso.nivel) }}
                  <template v-if="curso.professor"> · {{ curso.professor }}</template>
                </span>
              </span>
            </button>
          </li>
        </ul>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import CapaDeCurso from '@/components/CapaDeCurso.vue';
import {
  buscarFiltros,
  listarCursos,
  nomeDoNivel,
  NOME_DO_TEMA,
  NOME_DO_TIPO,
  type CursoResumido,
  type FiltrosDisponiveis,
} from '@/servicos/aprender';

const router = useRouter();

const cursos = ref<CursoResumido[]>([]);
const filtros = ref<FiltrosDisponiveis | null>(null);
const carregando = ref(true);
const erro = ref('');

const escolha = reactive<{ tema?: string; nivel?: number; tipo?: string }>({});
const temFiltro = computed(() => Object.values(escolha).some((valor) => valor !== undefined));

/** Só os temas que têm curso: filtro que leva a lista vazia não ajuda ninguém. */
const temasDisponiveis = computed(() =>
  Object.entries(filtros.value?.temas ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([tema]) => tema),
);

onMounted(async () => {
  try {
    filtros.value = await buscarFiltros();
    await recarregar();
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível carregar';
  } finally {
    carregando.value = false;
  }
});

async function recarregar() {
  carregando.value = true;
  erro.value = '';
  try {
    cursos.value = await listarCursos({ ...escolha });
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível carregar';
    cursos.value = [];
  } finally {
    carregando.value = false;
  }
}

/** Tocar no filtro já ativo desliga: é como a pessoa espera desfazer. */
function alternar(campo: 'tema' | 'nivel' | 'tipo', valor: string | number) {
  if (campo === 'nivel') escolha.nivel = escolha.nivel === valor ? undefined : (valor as number);
  else if (campo === 'tema') escolha.tema = escolha.tema === valor ? undefined : (valor as string);
  else escolha.tipo = escolha.tipo === valor ? undefined : (valor as string);

  void recarregar();
}

function limpar() {
  escolha.tema = undefined;
  escolha.nivel = undefined;
  escolha.tipo = undefined;
  void recarregar();
}
</script>

<style scoped>
/* O fundo (luz do alto + folhas) vem da regra de `ion-content.tela` no tema:
   é uma atmosfera só, igual em todas as abas. */

.conteudo {
  box-sizing: border-box;
  min-height: 100%;
  padding: calc(18px + var(--ion-safe-area-top, 0px)) 18px 18px;
}

.voltar {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
  padding: 0;
  background: none;
  border: 0;
  color: var(--life-verde);
  font-size: 0.85rem;
  cursor: pointer;
}

.titulo {
  margin: 0 0 2px;
  font-family: var(--life-serif);
  font-size: 1.6rem;
  color: var(--life-azul-profundo);
}

.subtitulo {
  margin: 0 0 18px;
  font-size: 0.88rem;
  color: var(--life-texto-medio);
}

.filtros {
  margin-bottom: 20px;
}

.grupo {
  margin-bottom: 14px;
}

.grupo-titulo {
  margin: 0 0 8px;
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--life-texto-suave);
}

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
  background: var(--life-ficha);
  border: 0;
  border-radius: 999px;
  color: var(--life-azul-profundo);
  font-size: 0.82rem;
  cursor: pointer;
}

.ficha.ativa {
  background: var(--life-verde);
  color: #fff;
}

.limpar {
  padding: 0;
  background: none;
  border: 0;
  color: var(--life-azul);
  font-size: 0.82rem;
  text-decoration: underline;
  cursor: pointer;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.curso {
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

.curso-capa {
  flex: none;
  width: 92px;
}

.curso-texto {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.curso-tema {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--life-texto-suave);
}

.curso-titulo {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--life-texto);
}

.curso-detalhe {
  font-size: 0.78rem;
  color: var(--life-texto-medio);
}

.recado {
  padding: 32px 0;
  text-align: center;
  color: var(--life-texto-suave);
}
</style>
