<template>
  <img v-if="DESENHOS[area]" :src="DESENHOS[area]" alt="" class="icone" />
</template>

<script setup lang="ts">
/**
 * Os símbolos das seis áreas da biblioteca (PRA-01).
 *
 * Os desenhos vêm do material da marca, guardados em `assets`. Cinco foram
 * entregues pelo Leonardo; o de relaxamento ainda não existia e foi desenhado
 * aqui no mesmo peso de traço dos outros (~2,5% da largura), para a fileira
 * não ter um mais fino que o resto. Quando chegar o definitivo, é só trocar o
 * arquivo.
 */
import asanas from '@/assets/asanas.png';
// O arquivo veio com o nome trocado ("pranayana"); o que vale é o que está na
// pasta, e renomear quebraria a referência sem ganhar nada.
import pranayama from '@/assets/pranayana.png';
import meditacao from '@/assets/meditacao.png';
import nidra from '@/assets/nidra.png';
import relaxamento from '@/assets/relaxamento.png';
// Extensão .jpg, conteúdo PNG com transparência — veio assim.
import kriyas from '@/assets/kriyas.jpg';

defineProps<{ area: string }>();

const DESENHOS: Record<string, string> = {
  asanas,
  pranayama,
  meditacao,
  nidra,
  relaxamento,
  kriyas,
};
</script>

<style scoped>
.icone {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
