<template>
  <main class="tela">
    <form class="cartao" @submit.prevent="acessar">
      <h1 class="titulo">LIFE · Painel</h1>
      <p class="subtitulo">Área dos professores.</p>

      <label class="campo">
        <span>E-mail</span>
        <input v-model="email" type="email" autocomplete="email" required />
      </label>

      <label class="campo">
        <span>Senha</span>
        <input v-model="senha" type="password" autocomplete="current-password" required />
      </label>

      <p v-if="erro" class="erro">{{ erro }}</p>

      <button type="submit" class="botao" :disabled="entrando">
        {{ entrando ? 'Entrando...' : 'Entrar' }}
      </button>

      <p class="aviso">
        As contas do painel são criadas pela administração. Alunos entram pelo aplicativo.
      </p>
    </form>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { entrar, ErroDaApi } from '../servicos/api.js';

const router = useRouter();
const email = ref('');
const senha = ref('');
const entrando = ref(false);
const erro = ref('');

async function acessar() {
  entrando.value = true;
  erro.value = '';
  try {
    await entrar(email.value, senha.value);
    await router.replace('/conteudos');
  } catch (problema) {
    erro.value = problema instanceof ErroDaApi ? problema.message : 'Não foi possível entrar agora';
  } finally {
    entrando.value = false;
  }
}
</script>

<style scoped>
.tela {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--fundo);
}

.cartao {
  width: 100%;
  max-width: 24rem;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 28px;
  background: #fff;
  border: 1px solid var(--borda);
  border-radius: 16px;
}

.titulo {
  margin: 0;
  font-size: 1.4rem;
  color: var(--azul-profundo);
}

.subtitulo {
  margin: -8px 0 6px;
  font-size: 0.9rem;
  color: var(--texto-suave);
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.85rem;
  color: var(--texto-medio);
}

.campo input {
  padding: 10px 12px;
  border: 1px solid var(--borda-forte);
  border-radius: 8px;
  font: inherit;
  color: var(--texto);
}

.botao {
  margin-top: 4px;
  padding: 12px;
  background: var(--azul);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}

.botao[disabled] {
  opacity: 0.6;
}

.erro {
  margin: 0;
  font-size: 0.85rem;
  color: #a33;
}

.aviso {
  margin: 6px 0 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--texto-suave);
}
</style>
