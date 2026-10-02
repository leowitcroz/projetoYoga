<template>
  <section>
    <header class="topo">
      <div>
        <h1 class="titulo">Trilhas</h1>
        <p class="subtitulo">
          Uma trilha é um conjunto de práticas feitas para serem seguidas em ordem. Quem já começou
          uma recebe a aula seguinte com preferência na recomendação do dia.
        </p>
      </div>
      <router-link to="/trilhas/nova" class="botao">Nova trilha</router-link>
    </header>

    <p v-if="carregando" class="recado">Carregando...</p>
    <p v-else-if="erro" class="recado">{{ erro }}</p>
    <p v-else-if="trilhas.length === 0" class="recado">
      Nenhuma trilha ainda. Crie a primeira e vá encaixando as práticas nela.
    </p>

    <table v-else class="tabela">
      <thead>
        <tr>
          <th>Trilha</th>
          <th>Aulas</th>
          <th>Pré-requisito</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="trilha in trilhas" :key="trilha.id">
          <td>
            <strong>{{ trilha.nome }}</strong>
            <span class="detalhe">
              {{ trilha.id }}
              <template v-if="trilha.autor"> · {{ trilha.autor.nome }}</template>
            </span>
            <span v-for="problema in trilha.problemas" :key="problema" class="pendencia">
              {{ problema }}
            </span>
          </td>
          <td>
            <span class="contagem" :class="{ completa: estaCompleta(trilha) }">
              {{ trilha.aulasCadastradas }} de {{ trilha.totalAulas }}
            </span>
          </td>
          <td>
            <span v-if="trilha.preRequisito">{{ trilha.preRequisito.nome }}</span>
            <span v-else class="detalhe">Abre sozinha</span>
          </td>
          <td class="acoes">
            <router-link :to="`/trilhas/${trilha.id}`" class="link">Abrir</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { listarTrilhas, type TrilhaNaLista } from '../servicos/trilhas.js';

const trilhas = ref<TrilhaNaLista[]>([]);
const carregando = ref(true);
const erro = ref('');

onMounted(async () => {
  try {
    trilhas.value = await listarTrilhas();
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível carregar';
  } finally {
    carregando.value = false;
  }
});

function estaCompleta(trilha: TrilhaNaLista): boolean {
  return trilha.aulasCadastradas >= trilha.totalAulas;
}
</script>

<style scoped>
.topo {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.titulo {
  margin: 0 0 4px;
  font-size: 1.5rem;
  color: var(--azul-profundo);
}

.subtitulo {
  margin: 0;
  max-width: 42rem;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--texto-suave);
}

.botao {
  flex: none;
  padding: 10px 16px;
  background: var(--azul);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
}

.tabela {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid var(--borda);
  border-radius: 12px;
  overflow: hidden;
}

th,
td {
  padding: 12px 14px;
  text-align: left;
  font-size: 0.88rem;
  border-bottom: 1px solid var(--borda);
}

th {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--texto-suave);
  background: #f7fafb;
}

tbody tr:last-child td {
  border-bottom: 0;
}

td strong {
  display: block;
  color: var(--texto);
}

.detalhe {
  display: block;
  margin-top: 2px;
  font-size: 0.78rem;
  color: var(--texto-suave);
}

.pendencia {
  display: block;
  margin-top: 4px;
  font-size: 0.78rem;
  color: #8a5a20;
}

.contagem {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  background: #fdf1e0;
  color: #8a5a20;
}

.contagem.completa {
  background: #e6efea;
  color: var(--verde);
}

.acoes {
  text-align: right;
}

.link {
  color: var(--azul);
  font-size: 0.85rem;
}

.recado {
  padding: 32px;
  text-align: center;
  color: var(--texto-suave);
  background: #fff;
  border: 1px solid var(--borda);
  border-radius: 12px;
}
</style>
