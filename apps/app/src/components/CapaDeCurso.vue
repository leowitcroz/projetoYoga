<template>
  <div class="capa" :class="[`tom-${tom}`, { alta }]">
    <img v-if="url" :src="url" alt="" class="foto" />

    <!-- Sem imagem escolhida, a capa é desenhada a partir do tema. O símbolo
         sai quando há um play por cima: os dois no centro viram um borrão. -->
    <ion-icon v-else-if="!semSimbolo" :icon="icone" class="simbolo" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import {
  bookOutline,
  leafOutline,
  libraryOutline,
  pulseOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { computed } from 'vue';

const props = defineProps<{
  /** Imagem escolhida pelo professor. Vazia = capa desenhada. */
  url?: string | null;
  tema: string;
  /** Capa grande, para a aula do dia. */
  alta?: boolean;
  /** Esconde o símbolo do tema, para quando algo for desenhado por cima. */
  semSimbolo?: boolean;
}>();

/** Cada tema tem seu símbolo e sua cor, para a lista não virar um borrão. */
const DESENHO: Record<string, { icone: string; tom: string }> = {
  fisiologia: { icone: pulseOutline, tom: 'ciano' },
  filosofia: { icone: sparklesOutline, tom: 'roxo' },
  yoga: { icone: bookOutline, tom: 'verde' },
  ayurveda: { icone: leafOutline, tom: 'verde' },
  classicos: { icone: libraryOutline, tom: 'azul' },
};

const desenho = computed(() => DESENHO[props.tema] ?? { icone: bookOutline, tom: 'azul' });
const icone = computed(() => desenho.value.icone);
const tom = computed(() => desenho.value.tom);
</script>

<style scoped>
.capa {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
}

.capa.alta {
  aspect-ratio: 16 / 10;
  border-radius: 0;
}

.foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.simbolo {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.92);
}

.capa.alta .simbolo {
  font-size: 2.8rem;
}

/* Mesmos tons das capas de prática: o app continua parecendo um só. */

.tom-verde {
  background: linear-gradient(135deg, var(--life-azul), var(--life-verde-claro));
}

.tom-azul {
  background: linear-gradient(135deg, var(--life-azul-profundo), var(--life-azul-claro));
}

.tom-roxo {
  background: linear-gradient(135deg, var(--life-azul-profundo), #6f6ba8);
}

.tom-ciano {
  background: linear-gradient(135deg, var(--life-azul), #56a8a8);
}
</style>
