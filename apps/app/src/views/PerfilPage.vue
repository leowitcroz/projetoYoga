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
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { personOutline } from 'ionicons/icons';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { sair } from '@/servicos/conta';
import { sessao } from '@/servicos/sessao';

const router = useRouter();
const usuario = computed(() => sessao.value?.usuario);

async function encerrar() {
  await sair();
  router.replace('/');
}
</script>

<style scoped>
.tela {
  --background: var(--life-fundo);
}

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

.sair {
  margin: auto 0 0;
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
