<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="conteudo">
        <button type="button" class="voltar" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
          Voltar
        </button>

        <p v-if="carregando" class="recado">Carregando...</p>
        <p v-else-if="erro" class="recado">{{ erro }}</p>

        <template v-else-if="curso">
          <capa-de-curso :url="curso.capaUrl" :tema="curso.tema" alta class="capa" />

          <p class="tema">{{ NOME_DO_TEMA[curso.tema] ?? curso.tema }}</p>
          <h1 class="titulo">{{ curso.titulo }}</h1>
          <p v-if="curso.professor" class="professor">{{ curso.professor }}</p>
          <p v-if="curso.descricao" class="descricao">{{ curso.descricao }}</p>

          <p class="marcas">
            <span class="marca">{{ curso.totalAulas }} aulas</span>
            <span class="marca">Nível: {{ nomeDoNivel(curso.nivel) }}</span>
            <span class="marca">{{ minutosTotais }} min no total</span>
          </p>

          <div v-if="curso.concluidas > 0" class="progresso">
            <span class="barra">
              <span class="barra-feita" :style="{ width: progresso + '%' }"></span>
            </span>
            {{ curso.concluidas }} de {{ curso.totalAulas }} concluídas
          </div>

          <ul class="aulas">
            <li v-for="aula in curso.aulas" :key="aula.id">
              <button type="button" class="aula" @click="router.push(`/tabs/aprender/aula/${aula.id}`)">
                <span class="posicao" :class="{ feita: aula.concluida }">
                  <ion-icon v-if="aula.concluida" :icon="checkmarkOutline" />
                  <template v-else>{{ aula.ordem }}</template>
                </span>
                <span class="aula-texto">
                  <strong>{{ aula.titulo }}</strong>
                  <span class="detalhe">
                    {{ NOME_DO_TIPO[aula.tipo] ?? aula.tipo }} · {{ aula.duracaoMin }} min
                  </span>
                </span>
                <ion-icon :icon="chevronForwardOutline" class="seta" />
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
import { checkmarkOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CapaDeCurso from '@/components/CapaDeCurso.vue';
import {
  buscarCurso,
  nomeDoNivel,
  NOME_DO_TEMA,
  NOME_DO_TIPO,
  type CursoCompleto,
} from '@/servicos/aprender';

const rota = useRoute();
const router = useRouter();

const curso = ref<CursoCompleto | null>(null);
const carregando = ref(true);
const erro = ref('');

const minutosTotais = computed(() =>
  (curso.value?.aulas ?? []).reduce((total, aula) => total + aula.duracaoMin, 0),
);

const progresso = computed(() => {
  const atual = curso.value;
  if (!atual || atual.totalAulas === 0) return 0;
  return Math.round((atual.concluidas / atual.totalAulas) * 100);
});

onMounted(async () => {
  try {
    curso.value = await buscarCurso(String(rota.params.id));
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível abrir o curso';
  } finally {
    carregando.value = false;
  }
});
</script>

<style scoped>
.tela {
  --background: var(--life-fundo);
}

.conteudo {
  box-sizing: border-box;
  min-height: 100%;
  padding: calc(18px + var(--ion-safe-area-top, 0px)) 18px 18px;
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
  cursor: pointer;
}

.capa {
  margin-bottom: 14px;
  border-radius: 14px;
}

.tema {
  margin: 0 0 2px;
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--life-texto-suave);
}

.titulo {
  margin: 0 0 2px;
  font-family: var(--life-serif);
  font-size: 1.5rem;
  line-height: 1.2;
  color: var(--life-azul-profundo);
}

.professor {
  margin: 0 0 10px;
  font-size: 0.86rem;
  color: var(--life-texto-suave);
}

.descricao {
  margin: 0 0 14px;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--life-texto-medio);
}

.marcas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 16px;
}

.marca {
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--life-ficha);
  font-size: 0.78rem;
  color: var(--life-azul-profundo);
}

.progresso {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  font-size: 0.78rem;
  color: var(--life-texto-suave);
}

.barra {
  flex: 1;
  height: 5px;
  background: var(--life-cartao);
  border-radius: 999px;
  overflow: hidden;
}

.barra-feita {
  display: block;
  height: 100%;
  background: var(--life-verde);
}

.aulas {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.aula {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--life-cartao);
  border: 0;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
}

.posicao {
  flex: none;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #fff;
  color: var(--life-texto-medio);
  font-size: 0.8rem;
}

.posicao.feita {
  background: var(--life-verde);
  color: #fff;
}

.aula-texto {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.aula-texto strong {
  font-size: 0.92rem;
  color: var(--life-texto);
}

.detalhe {
  font-size: 0.78rem;
  color: var(--life-texto-suave);
}

.seta {
  flex: none;
  color: var(--life-texto-suave);
}

.recado {
  padding: 40px 0;
  text-align: center;
  color: var(--life-texto-suave);
}
</style>
