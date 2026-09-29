<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="conteudo">
        <header class="topo">
          <h1 class="titulo">Praticar</h1>
          <p class="subtitulo">Escolha a sua aula. Aqui aparece tudo o que está disponível.</p>
        </header>

        <section class="filtros">
          <h2 class="filtro-titulo">Tempo</h2>
          <ul class="fichas">
            <li v-for="minutos in tempos" :key="minutos">
              <button
                type="button"
                class="ficha"
                :class="{ ativa: filtros.duracaoMax === minutos }"
                @click="alternarTempo(minutos)"
              >
                até {{ minutos }} min
              </button>
            </li>
          </ul>

          <h2 class="filtro-titulo">Modalidade</h2>
          <ul class="fichas">
            <li v-for="modalidade in modalidades" :key="modalidade">
              <button
                type="button"
                class="ficha"
                :class="{ ativa: filtros.modalidade === modalidade }"
                @click="alternarModalidade(modalidade)"
              >
                {{ NOME_DA_MODALIDADE[modalidade] ?? modalidade }}
              </button>
            </li>
          </ul>
        </section>

        <p v-if="carregando" class="recado">Carregando as aulas...</p>
        <p v-else-if="erro" class="recado">{{ erro }}</p>
        <p v-else-if="aulas.length === 0" class="recado">
          Nenhuma aula com esses filtros. Tente outro tempo ou outra modalidade.
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
                <span class="aula-modalidade">{{
                  NOME_DA_MODALIDADE[aula.modalidade] ?? aula.modalidade
                }}</span>
                <span class="aula-titulo">{{ aula.titulo }}</span>
                <span class="aula-detalhes">
                  {{ aula.duracaoMin }} min · {{ nomeDoNivel(aula.nivelTecnico) }} ·
                  {{ nomeDaIntensidade(aula.demandaFisica) }}
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
import { IonContent, IonPage } from '@ionic/vue';
import { onMounted, reactive, ref } from 'vue';
import CapaDaPratica from '@/components/CapaDaPratica.vue';
import { useRouter } from 'vue-router';
import {
  listarAulas,
  listarModalidades,
  nomeDaIntensidade,
  nomeDoNivel,
  NOME_DA_MODALIDADE,
  type AulaDaLista,
  type FiltrosDoCatalogo,
} from '@/servicos/catalogo';

const router = useRouter();

const tempos = [10, 20, 30, 45, 60];
const modalidades = ref<string[]>([]);
const aulas = ref<AulaDaLista[]>([]);
const filtros = reactive<FiltrosDoCatalogo>({});
const carregando = ref(true);
const erro = ref('');

onMounted(async () => {
  try {
    modalidades.value = await listarModalidades();
  } catch {
    // Sem a lista de modalidades a tela ainda funciona: só fica sem esse filtro.
  }
  await buscar();
});

async function buscar() {
  carregando.value = true;
  erro.value = '';
  try {
    aulas.value = await listarAulas(filtros);
  } catch (problema) {
    erro.value =
      problema instanceof Error ? problema.message : 'Não foi possível carregar as aulas agora';
    aulas.value = [];
  } finally {
    carregando.value = false;
  }
}

/** Tocar no filtro já marcado desliga o filtro. */
async function alternarTempo(minutos: number) {
  filtros.duracaoMax = filtros.duracaoMax === minutos ? undefined : minutos;
  await buscar();
}

async function alternarModalidade(modalidade: string) {
  filtros.modalidade = filtros.modalidade === modalidade ? undefined : modalidade;
  await buscar();
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
  padding: calc(20px + var(--ion-safe-area-top, 0px)) 18px
    calc(18px + var(--ion-safe-area-bottom, 0px));
}

.titulo {
  margin: 0 0 4px;
  font-family: var(--life-serif);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--life-texto);
}

.subtitulo {
  margin: 0 0 18px;
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--life-texto-medio);
}

.filtro-titulo {
  margin: 0 0 8px;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--life-texto-suave);
}

.fichas {
  margin: 0 0 16px;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.ficha {
  min-width: 0;
  padding: 8px 13px;
  background: #fff;
  border: 1px solid rgba(20, 48, 79, 0.1);
  border-radius: 999px;
  color: var(--life-texto-medio);
  font-size: 0.78rem;
}

.ficha.ativa {
  background: var(--life-verde);
  border-color: var(--life-verde);
  color: #fff;
}

.recado {
  margin: 24px 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--life-texto-suave);
}

.aulas {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.aula {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 13px;
  background: #fff;
  border: 1px solid var(--life-borda);
  border-radius: 14px;
  text-align: left;
}

.aula-capa {
  flex: none;
  width: 92px;
}

.aula-texto {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.aula-modalidade {
  font-size: 0.64rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--life-verde);
}

.aula-titulo {
  font-family: var(--life-serif);
  font-size: 1.02rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--life-texto);
}

.aula-detalhes {
  font-size: 0.76rem;
  color: var(--life-texto-suave);
}
</style>
