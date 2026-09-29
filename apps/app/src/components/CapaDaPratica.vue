<template>
  <div class="capa" :class="[`tom-${tom}`, { alta }]">
    <img v-if="url" :src="url" alt="" class="foto" />

    <!-- Sem imagem escolhida, a capa é desenhada a partir da modalidade. -->
    <ion-icon v-else :icon="icone" class="simbolo" aria-hidden="true" />

    <span v-if="duracaoMin" class="duracao">{{ duracaoMin }} min</span>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import {
  bodyOutline,
  flameOutline,
  flowerOutline,
  leafOutline,
  moonOutline,
  pulseOutline,
  sparklesOutline,
  sunnyOutline,
} from 'ionicons/icons';
import { computed } from 'vue';

const props = defineProps<{
  /** Imagem escolhida pelo professor. Vazia = capa desenhada. */
  url?: string | null;
  modalidade: string;
  duracaoMin?: number;
  /** Capa grande, para a prática de hoje. */
  alta?: boolean;
}>();

/** Cada modalidade tem seu símbolo e sua cor, para a lista não virar um borrão. */
const DESENHO: Record<string, { icone: string; tom: string }> = {
  hatha: { icone: bodyOutline, tom: 'verde' },
  vinyasa: { icone: flameOutline, tom: 'laranja' },
  ashtanga: { icone: flameOutline, tom: 'laranja' },
  restaurativo: { icone: moonOutline, tom: 'azul' },
  yin: { icone: moonOutline, tom: 'azul' },
  nidra: { icone: sparklesOutline, tom: 'roxo' },
  pranayama: { icone: pulseOutline, tom: 'ciano' },
  meditacao: { icone: flowerOutline, tom: 'roxo' },
  mobilidade: { icone: sunnyOutline, tom: 'verde' },
};

const desenho = computed(() => DESENHO[props.modalidade] ?? { icone: leafOutline, tom: 'verde' });
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
  border-radius: 14px;
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

.duracao {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 3px 9px;
  background: rgba(10, 26, 42, 0.62);
  border-radius: 999px;
  color: #fff;
  font-size: 0.68rem;
}

/*
 * Tons das capas desenhadas.
 *
 * Todas partem do azul da marca e caminham para a cor da modalidade: a lista
 * fica variada sem deixar de parecer o mesmo app.
 */

.tom-verde {
  background: linear-gradient(135deg, var(--life-azul), var(--life-verde-claro));
}

.tom-azul {
  background: linear-gradient(135deg, var(--life-azul-profundo), var(--life-azul-claro));
}

.tom-roxo {
  background: linear-gradient(135deg, var(--life-azul-profundo), #6f6ba8);
}

.tom-laranja {
  background: linear-gradient(135deg, var(--life-azul), #c08a5e);
}

.tom-ciano {
  background: linear-gradient(135deg, var(--life-azul), #56a8a8);
}
</style>
