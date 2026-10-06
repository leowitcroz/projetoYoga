<template>
  <svg
    class="icone"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    stroke-width="1.4"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-for="(traco, indice) in DESENHOS[area] ?? []" :key="indice">
      <circle v-if="'r' in traco" :cx="traco.cx" :cy="traco.cy" :r="traco.r" />
      <path v-else :d="traco.d" />
    </template>
  </svg>
</template>

<script setup lang="ts">
/**
 * Os símbolos das seis áreas da biblioteca (PRA-01).
 *
 * São desenhados aqui, e não tirados do pacote de ícones do Ionic: ali não
 * existe nada parecido com um prāṇāyāma ou um kriyā, e o que mais chegava
 * perto eram símbolos genéricos que não diziam nada a quem pratica.
 *
 * Todos cabem numa grade de 32, com o mesmo peso de traço, para não haver um
 * mais gordo que o outro na mesma fileira. A cor vem de fora (`currentColor`),
 * então o mesmo desenho serve no cartão claro e sobre fundo escuro.
 *
 * As formas são declaradas como dados em vez de um bloco de SVG colado com
 * `v-html`: assim o Vue as desenha uma a uma e não há caminho nenhum entre
 * texto e marcação.
 */
defineProps<{ area: string }>();

type Traco = { d: string } | { cx: number; cy: number; r: number };

const DESENHOS: Record<string, Traco[]> = {
  // Postura de guerreiro: braços abertos e base larga. É a única em pé, para
  // não virar o terceiro boneco sentado da fileira.
  asanas: [
    { cx: 16, cy: 5.8, r: 2.7 },
    { d: 'M16 8.5v8.1' },
    { d: 'M5.4 12.6h21.2' },
    { d: 'M16 16.6 10.6 21.2 9.2 26.6' },
    { d: 'M16 16.6 23.2 26.6' },
  ],

  // O sopro que se irradia a partir do centro.
  pranayama: [
    { cx: 16, cy: 16, r: 3.2 },
    { d: 'M16 3.6v5.1' },
    { d: 'M16 23.3v5.1' },
    { d: 'M3.6 16h5.1' },
    { d: 'M23.3 16h5.1' },
    { d: 'm7.2 7.2 3.6 3.6' },
    { d: 'm21.2 21.2 3.6 3.6' },
    { d: 'm24.8 7.2-3.6 3.6' },
    { d: 'm10.8 21.2-3.6 3.6' },
  ],

  // Sentado, mãos nos joelhos.
  meditacao: [
    { cx: 16, cy: 6.4, r: 2.8 },
    { d: 'M16 9.2v5.6' },
    { d: 'M16 13.4c-3 .4-5.4 2.1-6.6 4.6' },
    { d: 'M16 13.4c3 .4 5.4 2.1 6.6 4.6' },
    { cx: 8.6, cy: 19.4, r: 1.5 },
    { cx: 23.4, cy: 19.4, r: 1.5 },
    { d: 'M7.6 25.4c1.4-2.4 4.7-4 8.4-4s7 1.6 8.4 4' },
    { d: 'M12 25.6c1.4-1.5 6.6-1.5 8 0' },
  ],

  // Deitado, com a lua: é a prática de dormir acordado.
  nidra: [
    { d: 'M3.4 24.6h25.2' },
    { cx: 8.6, cy: 20.4, r: 2.5 },
    { d: 'M11.1 21.6c3.2 1.4 9 1.9 14.3.7' },
    { d: 'M25.4 22.3c1.3-.3 2.3-.8 2.9-1.5' },
    { d: 'M23.6 5.4a5 5 0 1 0 5.2 6.4 5.9 5.9 0 0 1-5.2-6.4z' },
    { cx: 8.8, cy: 7.6, r: 0.9 },
    { cx: 14.4, cy: 4.8, r: 0.7 },
    { cx: 13, cy: 11, r: 0.7 },
  ],

  // Também deitado, mas acordado: as ondas acima são o soltar, e separam este
  // desenho do Yoga Nidra, que é a mesma posição com a lua.
  relaxamento: [
    { d: 'M11 9.4c1.3-1.5 3.1-1.5 4.4 0s3.1 1.5 4.4 0' },
    { d: 'M12.6 14.2c1.1-1.2 2.6-1.2 3.6 0s2.5 1.2 3.6 0' },
    { d: 'M3.2 25.4h25.6' },
    { cx: 8.2, cy: 20.6, r: 2.8 },
    { d: 'M11 21.9h11.2' },
    { d: 'M22.2 21.9 27 19' },
    { d: 'M22.2 21.9 27 24.4' },
    { d: 'M13 22.6c1.5 1.8 3.7 2.8 6.2 2.8' },
  ],

  // A espiral da limpeza, de dentro para fora.
  kriyas: [{ d: 'M16 16a2 2 0 0 1 4 0 4 4 0 0 1-8 0 6 6 0 0 1 12 0 8 8 0 0 1-16 0 10 10 0 0 1 10-10' }],
};
</script>

<style scoped>
.icone {
  width: 1em;
  height: 1em;
}
</style>
