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
          <p class="modalidade">{{ NOME_DA_MODALIDADE[aula.modalidade] ?? aula.modalidade }}</p>
          <h1 class="titulo">{{ aula.titulo }}</h1>

          <dl class="ficha">
            <div class="item">
              <dt>Duração</dt>
              <dd>{{ aula.duracaoMin }} min</dd>
            </div>
            <div class="item">
              <dt>Nível</dt>
              <dd>{{ nomeDoNivel(aula.nivelTecnico) }}</dd>
            </div>
            <div class="item">
              <dt>Intensidade</dt>
              <dd>{{ nomeDaIntensidade(aula.demandaFisica) }}</dd>
            </div>
          </dl>

          <section v-if="objetivos.length" class="bloco">
            <h2 class="bloco-titulo">Ajuda com</h2>
            <ul class="marcas">
              <li v-for="objetivo in objetivos" :key="objetivo">
                {{ NOME_DO_OBJETIVO[objetivo] ?? objetivo }}
              </li>
            </ul>
          </section>

          <p class="aviso">
            O vídeo da prática entra quando o catálogo de verdade for cadastrado pelos professores.
          </p>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  buscarAula,
  nomeDaIntensidade,
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

function voltar() {
  router.back();
}
</script>

<style scoped>
.tela {
  --background: #f2f7f9;
}

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
  margin-bottom: 18px;
  padding: 0;
  background: none;
  border: 0;
  color: #3f6b52;
  font-size: 0.85rem;
}

.modalidade {
  margin: 0 0 4px;
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #3f6b52;
}

.titulo {
  margin: 0 0 18px;
  font-family: var(--life-serif);
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  color: #14304f;
}

.ficha {
  margin: 0;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid rgba(20, 48, 79, 0.08);
  border-radius: 14px;
}

.item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 0;
  border-top: 1px solid rgba(20, 48, 79, 0.07);
}

.item:first-child {
  border-top: 0;
}

dt {
  min-width: 0;
  font-size: 0.85rem;
  color: #5b7183;
}

dd {
  margin: 0;
  min-width: 0;
  font-size: 0.85rem;
  color: #14304f;
  text-align: right;
}

.bloco {
  margin-top: 20px;
}

.bloco-titulo {
  margin: 0 0 8px;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7a8da0;
}

.marcas {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.marcas li {
  padding: 7px 12px;
  background: #e8f0ea;
  border-radius: 999px;
  font-size: 0.76rem;
  color: #3f6b52;
}

.recado {
  margin: 24px 0;
  text-align: center;
  font-size: 0.85rem;
  color: #7a8da0;
}

.aviso {
  margin: 24px 0 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: #7a8da0;
}
</style>
