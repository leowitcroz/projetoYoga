<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="conteudo">
        <div class="avatar">
          <ion-icon :icon="personOutline" />
        </div>

        <h1 class="titulo">{{ usuario?.nome }}</h1>
        <p class="email">{{ usuario?.email }}</p>

        <p class="aviso">
          Editar o perfil, rever as respostas do cadastro e acompanhar a sua constância chegam nas
          próximas fases.
        </p>

        <button type="button" class="sair" @click="encerrar">Sair da conta</button>

        <!-- PRIV-04: a política fica à mão, não só no cadastro. -->
        <button type="button" class="link" @click="verPolitica">Política de privacidade</button>

        <!-- AUTH-07 -->
        <button type="button" class="apagar" @click="pedirExclusao">Excluir minha conta</button>

        <div v-if="confirmando" class="confirmacao">
          <p class="confirmacao-texto">
            Isto apaga a sua conta, as suas respostas e o seu histórico. Não dá para desfazer.
          </p>
          <p v-if="erro" class="erro">{{ erro }}</p>

          <div class="confirmacao-botoes">
            <button type="button" class="cancelar" @click="confirmando = false">
              Manter minha conta
            </button>
            <button type="button" class="apagar-mesmo" :disabled="apagando" @click="confirmar">
              {{ apagando ? 'Apagando...' : 'Apagar mesmo assim' }}
            </button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { personOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { excluirConta, sair } from '@/servicos/conta';
import { sessao } from '@/servicos/sessao';

const router = useRouter();
const usuario = computed(() => sessao.value?.usuario);

const confirmando = ref(false);
const apagando = ref(false);
const erro = ref('');

async function encerrar() {
  await sair();
  router.replace('/');
}

function verPolitica() {
  router.push('/politica-de-privacidade');
}

function pedirExclusao() {
  confirmando.value = true;
  erro.value = '';
}

async function confirmar() {
  apagando.value = true;
  erro.value = '';
  try {
    await excluirConta();
    router.replace('/');
  } catch (problema) {
    erro.value =
      problema instanceof Error ? problema.message : 'Não foi possível excluir a conta agora';
  } finally {
    apagando.value = false;
  }
}
</script>

<style scoped>
/* O fundo (luz do alto + folhas) vem da regra de `ion-content.tela` no tema:
   é uma atmosfera só, igual em todas as abas. */

.conteudo {
  box-sizing: border-box;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(32px + var(--ion-safe-area-top, 0px)) 20px
    calc(20px + var(--ion-safe-area-bottom, 0px));
}

.avatar {
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  background: var(--life-azul-profundo);
  border-radius: 50%;
  color: #fff;
  font-size: 2.2rem;
}

.titulo {
  margin: 16px 0 4px;
  font-family: var(--life-serif);
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--life-texto);
  text-align: center;
}

.email {
  margin: 0;
  font-size: 0.85rem;
  color: var(--life-texto-medio);
}

.aviso {
  margin: 26px 0 0;
  max-width: 24rem;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--life-texto-suave);
  text-align: center;
}

.link {
  margin-top: 14px;
  padding: 6px;
  background: none;
  border: 0;
  color: var(--life-azul-claro);
  font-size: 0.85rem;
  text-decoration: underline;
}

.apagar {
  margin-top: 4px;
  padding: 6px;
  background: none;
  border: 0;
  color: #a3565a;
  font-size: 0.85rem;
  text-decoration: underline;
}

.confirmacao {
  width: 100%;
  max-width: 24rem;
  margin-top: 14px;
  padding: 16px;
  background: #fbf0f0;
  border: 1px solid #e0b9b9;
  border-radius: 14px;
}

.confirmacao-texto {
  margin: 0 0 12px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #6b4446;
}

.confirmacao-botoes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cancelar {
  padding: 11px;
  background: #fff;
  border: 1px solid var(--life-borda);
  border-radius: 999px;
  color: var(--life-texto);
  font-size: 0.9rem;
  font-weight: 600;
}

.apagar-mesmo {
  padding: 11px;
  background: none;
  border: 0;
  color: #a3565a;
  font-size: 0.88rem;
  text-decoration: underline;
}

.apagar-mesmo[disabled] {
  opacity: 0.6;
}

.erro {
  margin: 0 0 10px;
  font-size: 0.82rem;
  color: #a33;
}

.sair {
  margin: auto 0 14px;
  width: 100%;
  max-width: 24rem;
  padding: 14px;
  background: none;
  border: 1px solid rgba(14, 48, 80, 0.2);
  border-radius: 999px;
  color: var(--life-texto);
  font-size: 0.95rem;
}
</style>
