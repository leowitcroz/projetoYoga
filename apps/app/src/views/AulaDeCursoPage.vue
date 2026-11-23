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

        <template v-else-if="aula">
          <!-- O vídeo só é carregado quando a pessoa toca: antes disso, o
               YouTube não precisa ser contatado por quem só abriu a ficha. -->
          <div v-if="tocando && urlDoVideo" class="player">
            <iframe
              :src="urlDoVideo"
              :title="aula.titulo"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowfullscreen
              referrerpolicy="strict-origin-when-cross-origin"
            ></iframe>
          </div>

          <div v-else-if="aula.tipo !== 'texto'" class="capa-area">
            <capa-de-curso :tema="aula.curso.tema" alta class="capa" :sem-simbolo="urlDoVideo !== null" />
            <button
              v-if="urlDoVideo"
              type="button"
              class="play"
              :aria-label="`Assistir ${aula.titulo}`"
              @click="tocando = true"
            >
              <ion-icon :icon="playSharp" />
            </button>
          </div>

          <button type="button" class="curso-link" @click="router.push(`/tabs/aprender/curso/${aula.curso.id}`)">
            {{ aula.curso.titulo }}
          </button>
          <h1 class="titulo">Aula {{ aula.ordem }} – {{ aula.titulo }}</h1>
          <p class="marcas">
            <span class="marca">{{ NOME_DO_TIPO[aula.tipo] ?? aula.tipo }}</span>
            <span class="marca">{{ aula.duracaoMin }} min</span>
            <span v-if="aula.curso.professor" class="marca">{{ aula.curso.professor }}</span>
          </p>

          <p v-if="aula.descricao" class="descricao">{{ aula.descricao }}</p>

          <!-- EDU-02: aula de leitura mostra o texto aqui mesmo. -->
          <article v-if="aula.tipo === 'texto' && aula.texto" class="leitura">
            <p v-for="(paragrafo, indice) in paragrafos" :key="indice">{{ paragrafo }}</p>
          </article>

          <p v-else-if="!urlDoVideo" class="aviso">
            Esta aula ainda não tem mídia publicada. O professor envia pelo painel.
          </p>

          <!-- EDU-02: marcar como concluída -->
          <button
            type="button"
            class="concluir"
            :class="{ feita: aula.concluida }"
            :disabled="salvando || aula.concluida"
            @click="marcarConcluida"
          >
            <ion-icon :icon="aula.concluida ? checkmarkCircle : checkmarkCircleOutline" />
            {{ aula.concluida ? 'Aula concluída' : salvando ? 'Salvando...' : 'Marcar como concluída' }}
          </button>

          <p v-if="erroAoSalvar" class="erro">{{ erroAoSalvar }}</p>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  checkmarkCircle,
  checkmarkCircleOutline,
  chevronBackOutline,
  playSharp,
} from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CapaDeCurso from '@/components/CapaDeCurso.vue';
import { buscarAula, concluirAula, NOME_DO_TIPO, type AulaCompleta } from '@/servicos/aprender';

const rota = useRoute();
const router = useRouter();

const aula = ref<AulaCompleta | null>(null);
const carregando = ref(true);
const erro = ref('');
const erroAoSalvar = ref('');
const salvando = ref(false);
const tocando = ref(false);

const urlDoVideo = computed(() => {
  const atual = aula.value;
  if (!atual?.videoId || atual.videoProvedor !== 'youtube') return null;

  const parametros = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    autoplay: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${atual.videoId}?${parametros.toString()}`;
});

const paragrafos = computed(() =>
  (aula.value?.texto ?? '')
    .split('\n')
    .map((linha) => linha.trim())
    .filter((linha) => linha !== ''),
);

onMounted(async () => {
  try {
    aula.value = await buscarAula(String(rota.params.id));
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível abrir a aula';
  } finally {
    carregando.value = false;
  }
});

async function marcarConcluida() {
  if (!aula.value) return;

  salvando.value = true;
  erroAoSalvar.value = '';
  try {
    await concluirAula(aula.value.id);
    aula.value = { ...aula.value, concluida: true };
  } catch (problema) {
    erroAoSalvar.value =
      problema instanceof Error ? problema.message : 'Não foi possível marcar agora';
  } finally {
    salvando.value = false;
  }
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
  margin-bottom: 14px;
  padding: 0;
  background: none;
  border: 0;
  color: var(--life-verde);
  font-size: 0.85rem;
  cursor: pointer;
}

.capa-area {
  position: relative;
  margin-bottom: 16px;
}

.capa {
  border-radius: 14px;
}

.play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  padding: 0;
  background: rgba(255, 255, 255, 0.26);
  border: 2px solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  color: #fff;
  font-size: 1.45rem;
  cursor: pointer;
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

.curso-link {
  padding: 0;
  background: none;
  border: 0;
  color: var(--life-azul);
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
}

.titulo {
  margin: 4px 0 8px;
  font-family: var(--life-serif);
  font-size: 1.45rem;
  line-height: 1.2;
  color: var(--life-azul-profundo);
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

.descricao {
  margin: 0 0 16px;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--life-texto-medio);
}

.leitura {
  margin-bottom: 18px;
  padding: 16px;
  background: #fff;
  border-radius: 14px;
}

.leitura p {
  margin: 0 0 12px;
  font-size: 0.94rem;
  line-height: 1.7;
  color: var(--life-texto);
}

.leitura p:last-child {
  margin-bottom: 0;
}

.aviso {
  margin: 0 0 18px;
  padding: 12px 14px;
  background: var(--life-atencao-fundo);
  border: 1px solid var(--life-atencao-borda);
  border-radius: 12px;
  font-size: 0.85rem;
  color: var(--life-texto-medio);
}

.concluir {
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

.concluir.feita {
  background: var(--life-verde-suave);
  color: var(--life-verde);
}

.concluir[disabled] {
  cursor: default;
}

.erro {
  margin: 10px 0 0;
  font-size: 0.85rem;
  text-align: center;
  color: #a33;
}

.recado {
  padding: 40px 0;
  text-align: center;
  color: var(--life-texto-suave);
}
</style>
