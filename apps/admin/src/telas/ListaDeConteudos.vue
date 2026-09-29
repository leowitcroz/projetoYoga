<template>
  <section>
    <header class="topo">
      <div>
        <h1 class="titulo">Práticas</h1>
        <p class="subtitulo">
          Cada prática precisa da ficha preenchida para o motor saber quando recomendá-la.
        </p>
      </div>
      <router-link to="/conteudos/nova" class="botao">Nova prática</router-link>
    </header>

    <p v-if="carregando" class="recado">Carregando...</p>
    <p v-else-if="erro" class="recado">{{ erro }}</p>
    <p v-else-if="conteudos.length === 0" class="recado">
      Nenhuma prática cadastrada ainda. Comece pela primeira.
    </p>

    <table v-else class="tabela">
      <thead>
        <tr>
          <th>Prática</th>
          <th>Duração</th>
          <th>Situação</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="conteudo in conteudos" :key="conteudo.id">
          <td>
            <strong>{{ conteudo.titulo }}</strong>
            <span class="detalhe">
              {{ conteudo.modalidade }}
              <template v-if="conteudo.autor"> · {{ conteudo.autor.nome }}</template>
            </span>
            <span v-if="conteudo.comentarioRevisao" class="devolucao">
              Devolvida: {{ conteudo.comentarioRevisao }}
            </span>
          </td>
          <td>{{ conteudo.duracaoMin }} min</td>
          <td>
            <span class="marca" :class="conteudo.status.toLowerCase()">
              {{ NOME_DO_STATUS[conteudo.status] }}
            </span>
          </td>
          <td class="acoes">
            <router-link :to="`/conteudos/${conteudo.id}`" class="link">Abrir</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { listarConteudos, NOME_DO_STATUS, type ConteudoNaLista } from '../servicos/conteudos.js';

const conteudos = ref<ConteudoNaLista[]>([]);
const carregando = ref(true);
const erro = ref('');

onMounted(async () => {
  try {
    conteudos.value = await listarConteudos();
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível carregar';
  } finally {
    carregando.value = false;
  }
});
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
  max-width: 40rem;
  font-size: 0.88rem;
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

.devolucao {
  display: block;
  margin-top: 4px;
  font-size: 0.78rem;
  color: #a35;
}

.marca {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
}

.marca.rascunho {
  background: #eef1f4;
  color: var(--texto-medio);
}

.marca.em_revisao {
  background: #fdf1e0;
  color: #8a5a20;
}

.marca.aprovado {
  background: #e6efea;
  color: var(--verde);
}

.marca.devolvido {
  background: #fbe9e9;
  color: #a33;
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
