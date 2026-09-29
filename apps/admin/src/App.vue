<template>
  <!-- Fora da sessão, a tela de login ocupa tudo. -->
  <router-view v-if="!sessao" />

  <div v-else class="painel">
    <aside class="menu">
      <p class="marca">LIFE · Painel</p>

      <nav>
        <router-link to="/conteudos">Práticas</router-link>
        <router-link to="/revisao">Aguardando revisão</router-link>
      </nav>

      <div class="rodape">
        <p class="quem">{{ sessao.usuario.nome }}</p>
        <button type="button" class="sair" @click="sair">Sair</button>
      </div>
    </aside>

    <main class="conteudo">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { limparSessao, sessao } from './servicos/api.js';

const router = useRouter();

async function sair() {
  limparSessao();
  await router.replace('/entrar');
}
</script>

<style scoped>
.painel {
  display: grid;
  grid-template-columns: 232px 1fr;
  min-height: 100vh;
}

.menu {
  display: flex;
  flex-direction: column;
  padding: 22px 18px;
  background: var(--azul-profundo);
  color: #fff;
}

.marca {
  margin: 0 0 24px;
  font-size: 0.95rem;
  font-weight: 600;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

nav a {
  padding: 9px 11px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.88rem;
  text-decoration: none;
}

nav a:hover {
  background: rgba(255, 255, 255, 0.08);
}

nav a.router-link-active {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.rodape {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}

.quem {
  margin: 0 0 6px;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.72);
}

.sair {
  padding: 0;
  background: none;
  border: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.82rem;
  cursor: pointer;
  text-decoration: underline;
}

.conteudo {
  padding: 28px 32px;
  background: var(--fundo);
  overflow-x: auto;
}

@media (max-width: 720px) {
  .painel {
    grid-template-columns: 1fr;
  }
}
</style>
