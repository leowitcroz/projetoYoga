<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="conteudo">
        <header class="topo">
          <img :src="logo" alt="LIFE" class="logo" />
          <button type="button" class="sair" @click="encerrar">Sair</button>
        </header>

        <h1 class="titulo">Olá, {{ primeiroNome }}</h1>
        <p class="subtitulo">Sua conta está criada e suas respostas ficaram salvas.</p>

        <section class="cartao">
          <h2 class="cartao-titulo">Suas respostas</h2>

          <p v-if="carregando" class="linha">Carregando...</p>
          <p v-else-if="erro" class="linha">{{ erro }}</p>
          <dl v-else class="lista">
            <div class="item">
              <dt>Objetivo principal</dt>
              <dd>{{ perfil.objetivoPrincipal || 'não respondido' }}</dd>
            </div>
            <div class="item">
              <dt>Constituição</dt>
              <dd>{{ perfil.constituicao || 'não respondida' }}</dd>
            </div>
            <div class="item">
              <dt>Horário preferido</dt>
              <dd>{{ perfil.horarioPreferido || 'não respondido' }}</dd>
            </div>
            <div class="item">
              <dt>Passos respondidos</dt>
              <dd>{{ perfil.passoConcluido ?? 0 }} de 5</dd>
            </div>
          </dl>
        </section>

        <p class="aviso">
          Esta é a área do cliente por enquanto. A prática do dia, o catálogo e o check-in chegam
          nas próximas fases.
        </p>

        <button type="button" class="botao" @click="irParaCheckin">Fazer o check-in de hoje</button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import logo from '@/assets/logo.png';
import { chamar } from '@/servicos/api';
import { sair } from '@/servicos/conta';
import { sessao } from '@/servicos/sessao';

interface Perfil {
  objetivoPrincipal?: string | null;
  constituicao?: string | null;
  horarioPreferido?: string | null;
  passoConcluido?: number;
}

const router = useRouter();
const perfil = ref<Perfil>({});
const carregando = ref(true);
const erro = ref('');

const primeiroNome = computed(() => sessao.value?.usuario.nome.split(' ')[0] ?? '');

onMounted(async () => {
  try {
    perfil.value = await chamar<Perfil>('/onboarding');
  } catch {
    erro.value = 'Não foi possível carregar suas respostas agora.';
  } finally {
    carregando.value = false;
  }
});

async function encerrar() {
  await sair();
  router.replace('/');
}

function irParaCheckin() {
  router.push('/checkin');
}
</script>

<style scoped>
.tela {
  --background: #f4f7fa;
}

.conteudo {
  box-sizing: border-box;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: calc(18px + var(--ion-safe-area-top, 0px)) 18px
    calc(18px + var(--ion-safe-area-bottom, 0px));
}

.topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  width: 54px;
  height: auto;
}

.sair {
  padding: 0;
  background: none;
  border: 0;
  color: #2f7ea6;
  font-size: 0.85rem;
}

.titulo {
  margin: 18px 0 4px;
  font-family: var(--life-serif);
  font-size: 1.5rem;
  font-weight: 500;
  color: #14304f;
}

.subtitulo {
  margin: 0 0 18px;
  font-size: 0.88rem;
  color: #4d627a;
}

.cartao {
  background: #fff;
  border: 1px solid rgba(20, 48, 79, 0.08);
  border-radius: 18px;
  padding: 16px;
}

.cartao-titulo {
  margin: 0 0 12px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7a8da0;
}

.lista {
  margin: 0;
}

.item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 0;
  border-top: 1px solid rgba(20, 48, 79, 0.07);
}

.item:first-child {
  border-top: 0;
}

dt {
  min-width: 0;
  font-size: 0.85rem;
  color: #4d627a;
}

dd {
  margin: 0;
  min-width: 0;
  font-size: 0.85rem;
  color: #14304f;
  text-align: right;
}

.linha {
  margin: 0;
  font-size: 0.85rem;
  color: #4d627a;
}

.aviso {
  margin: 16px 0 0;
  font-size: 0.78rem;
  color: #7a8da0;
}

.botao {
  margin: auto 0 0;
  width: 100%;
  padding: 14px;
  background: #14304f;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  border: 0;
  border-radius: 999px;
}
</style>
