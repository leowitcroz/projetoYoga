<template>
  <section>
    <h1 class="titulo">Olá, {{ primeiroNome }}</h1>
    <p class="subtitulo">O que está acontecendo no LIFE hoje.</p>

    <p v-if="carregando" class="recado">Carregando...</p>
    <p v-else-if="erro" class="recado">{{ erro }}</p>

    <template v-else-if="resumo">
      <!-- O que precisa da mão do master vem primeiro. -->
      <div v-if="precisaDeAtencao" class="pendencias">
        <h2 class="secao">Precisa de você</h2>

        <router-link v-if="resumo.emRevisao > 0" to="/revisao" class="pendencia">
          <strong>{{ resumo.emRevisao }}</strong>
          <span
            >{{ resumo.emRevisao === 1 ? 'prática esperando' : 'práticas esperando' }} revisão</span
          >
        </router-link>

        <router-link v-if="resumo.semVideo > 0" to="/conteudos" class="pendencia">
          <strong>{{ resumo.semVideo }}</strong>
          <span>
            {{ resumo.semVideo === 1 ? 'prática aprovada sem' : 'práticas aprovadas sem' }} vídeo
          </span>
        </router-link>

        <router-link v-if="resumo.devolvidas > 0" to="/conteudos" class="pendencia">
          <strong>{{ resumo.devolvidas }}</strong>
          <span>
            {{ resumo.devolvidas === 1 ? 'prática devolvida' : 'práticas devolvidas' }} ao professor
          </span>
        </router-link>
      </div>

      <p v-else class="tudo-certo">Nada esperando revisão. O catálogo está em dia.</p>

      <h2 class="secao">Catálogo</h2>
      <div class="numeros">
        <article class="numero">
          <strong>{{ resumo.aprovadas }}</strong>
          <span>no ar para os alunos</span>
        </article>
        <article class="numero">
          <strong>{{ resumo.rascunhos }}</strong>
          <span>em rascunho</span>
        </article>
        <article class="numero">
          <strong>{{ resumo.alunos }}</strong>
          <span>{{ resumo.alunos === 1 ? 'aluno inscrito' : 'alunos inscritos' }}</span>
        </article>
      </div>

      <div class="atalhos">
        <router-link to="/conteudos/nova" class="botao">Nova prática</router-link>
        <router-link to="/alunos" class="botao secundario">Ver alunos</router-link>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { chamar, sessao } from '../servicos/api.js';

interface Resumo {
  alunos: number;
  rascunhos: number;
  emRevisao: number;
  aprovadas: number;
  devolvidas: number;
  semVideo: number;
}

const resumo = ref<Resumo | null>(null);
const carregando = ref(true);
const erro = ref('');

const primeiroNome = computed(() => sessao.value?.usuario.nome.split(' ')[0] ?? '');
const precisaDeAtencao = computed(
  () =>
    (resumo.value?.emRevisao ?? 0) +
      (resumo.value?.semVideo ?? 0) +
      (resumo.value?.devolvidas ?? 0) >
    0,
);

onMounted(async () => {
  try {
    resumo.value = await chamar<Resumo>('/painel/resumo');
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível carregar';
  } finally {
    carregando.value = false;
  }
});
</script>

<style scoped>
.titulo {
  margin: 0 0 4px;
  font-size: 1.5rem;
  color: var(--azul-profundo);
}

.subtitulo {
  margin: 0 0 24px;
  font-size: 0.9rem;
  color: var(--texto-suave);
}

.secao {
  margin: 0 0 10px;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--texto-suave);
}

.pendencias {
  margin-bottom: 26px;
}

.pendencia {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
  padding: 14px 16px;
  background: #fffaf2;
  border: 1px solid #e8d4b4;
  border-radius: 12px;
  color: var(--texto);
  text-decoration: none;
}

.pendencia strong {
  font-size: 1.3rem;
  color: #8a5a20;
}

.pendencia span {
  font-size: 0.9rem;
}

.tudo-certo {
  margin: 0 0 26px;
  padding: 14px 16px;
  background: #e6efea;
  border-radius: 12px;
  font-size: 0.9rem;
  color: var(--verde);
}

.numeros {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 26px;
}

.numero {
  padding: 18px 16px;
  background: #fff;
  border: 1px solid var(--borda);
  border-radius: 12px;
}

.numero strong {
  display: block;
  font-size: 1.7rem;
  color: var(--azul-profundo);
}

.numero span {
  font-size: 0.82rem;
  color: var(--texto-suave);
}

.atalhos {
  display: flex;
  gap: 10px;
}

.botao {
  padding: 11px 18px;
  background: var(--azul);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
}

.botao.secundario {
  background: #fff;
  color: var(--azul);
  border: 1px solid var(--azul);
}

.recado {
  padding: 32px;
  text-align: center;
  color: var(--texto-suave);
}

@media (max-width: 720px) {
  .numeros {
    grid-template-columns: 1fr;
  }
}
</style>
