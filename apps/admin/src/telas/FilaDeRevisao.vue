<template>
  <section>
    <h1 class="titulo">Aguardando revisão</h1>
    <p class="subtitulo">
      Práticas que os professores enviaram. Aprovar coloca a prática no ar para os alunos; devolver
      manda de volta com o que precisa mudar.
    </p>

    <p v-if="carregando" class="recado">Carregando...</p>
    <p v-else-if="erro" class="recado">{{ erro }}</p>
    <p v-else-if="fila.length === 0" class="recado">Nada esperando revisão no momento.</p>

    <ul v-else class="lista">
      <li v-for="item in fila" :key="item.id" class="item">
        <div class="texto">
          <strong>{{ item.titulo }}</strong>
          <span class="detalhe">
            {{ item.modalidade }} · {{ item.duracaoMin }} min
            <template v-if="item.autor"> · {{ item.autor.nome }}</template>
          </span>
        </div>

        <div class="acoes">
          <router-link :to="`/conteudos/${item.id}`" class="link">Ver ficha</router-link>
          <button type="button" class="botao" @click="aprovarItem(item.id)">Aprovar</button>
          <button type="button" class="botao secundario" @click="devolverItem(item.id)">
            Devolver
          </button>
        </div>
      </li>
    </ul>

    <p v-if="recado" class="sucesso">{{ recado }}</p>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { aprovar, devolver, listarFila, type ConteudoNaLista } from '../servicos/conteudos.js';

const fila = ref<ConteudoNaLista[]>([]);
const carregando = ref(true);
const erro = ref('');
const recado = ref('');

async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    fila.value = await listarFila();
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível carregar a fila';
  } finally {
    carregando.value = false;
  }
}

onMounted(carregar);

async function aprovarItem(id: string) {
  try {
    await aprovar(id);
    recado.value = 'Prática aprovada. Já pode ser recomendada aos alunos.';
    await carregar();
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível aprovar';
  }
}

async function devolverItem(id: string) {
  const comentario = window.prompt('O que precisa mudar nesta prática?');
  if (!comentario) return;

  try {
    await devolver(id, comentario);
    recado.value = 'Prática devolvida ao professor, com o seu comentário.';
    await carregar();
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível devolver';
  }
}
</script>

<style scoped>
.titulo {
  margin: 0 0 4px;
  font-size: 1.5rem;
  color: var(--azul-profundo);
}

.subtitulo {
  margin: 0 0 20px;
  max-width: 40rem;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--texto-suave);
}

.lista {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--borda);
  border-radius: 12px;
}

.texto strong {
  display: block;
  color: var(--texto);
}

.detalhe {
  font-size: 0.8rem;
  color: var(--texto-suave);
}

.acoes {
  display: flex;
  align-items: center;
  gap: 10px;
}

.link {
  color: var(--azul);
  font-size: 0.85rem;
}

.botao {
  padding: 8px 14px;
  background: var(--azul);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}

.botao.secundario {
  background: #fff;
  color: var(--texto-medio);
  border: 1px solid var(--borda-forte);
}

.recado {
  padding: 32px;
  text-align: center;
  color: var(--texto-suave);
  background: #fff;
  border: 1px solid var(--borda);
  border-radius: 12px;
}

.sucesso {
  margin-top: 14px;
  font-size: 0.88rem;
  color: var(--verde);
}
</style>
