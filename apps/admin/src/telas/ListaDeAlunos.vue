<template>
  <section>
    <h1 class="titulo">Alunos</h1>
    <p class="subtitulo">
      Quem usa o app. <strong>Nada de saúde aparece aqui</strong> — nem condições, nem dor, nem o
      check-in do dia. Esses dados são da pessoa, e nenhum perfil do painel tem acesso a eles.
    </p>

    <p v-if="carregando" class="recado">Carregando...</p>
    <p v-else-if="erro" class="recado">{{ erro }}</p>
    <p v-else-if="alunos.length === 0" class="recado">Nenhum aluno inscrito ainda.</p>

    <table v-else class="tabela">
      <thead>
        <tr>
          <th>Aluno</th>
          <th>Inscrito em</th>
          <th>E-mail</th>
          <th>Práticas</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="aluno in alunos" :key="aluno.id">
          <td>
            <strong>{{ aluno.nome }}</strong>
            <span class="detalhe">{{ aluno.email }}</span>
          </td>
          <td>{{ formatarData(aluno.criadoEm) }}</td>
          <td>
            <span class="marca" :class="aluno.emailConfirmado ? 'ok' : 'pendente'">
              {{ aluno.emailConfirmado ? 'Confirmado' : 'Por confirmar' }}
            </span>
          </td>
          <td>{{ aluno.praticas }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { chamar } from '../servicos/api.js';

interface Aluno {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
  emailConfirmado: boolean;
  praticas: number;
}

const alunos = ref<Aluno[]>([]);
const carregando = ref(true);
const erro = ref('');

onMounted(async () => {
  try {
    alunos.value = await chamar<Aluno[]>('/painel/alunos');
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível carregar';
  } finally {
    carregando.value = false;
  }
});

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
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
  max-width: 44rem;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--texto-suave);
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
  font-size: 0.78rem;
  color: var(--texto-suave);
}

.marca {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
}

.marca.ok {
  background: #e6efea;
  color: var(--verde);
}

.marca.pendente {
  background: #fdf1e0;
  color: #8a5a20;
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
