<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>

      <ion-tab-bar slot="bottom">
        <ion-tab-button
          v-for="tab in tabs"
          :key="tab.path"
          :tab="tab.path"
          :href="`/tabs/${tab.path}`"
        >
          <ion-icon aria-hidden="true" :icon="tab.icon" />
          <ion-label>{{ tab.label }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>

      <!--
        A assinatura da marca fica presa embaixo de tudo, abaixo da navegação,
        e não no fim do conteúdo de cada tela: antes ela só aparecia para quem
        rolasse a página até o fim, e em tela curta nunca aparecia.
      -->
      <footer slot="bottom" class="assinatura">
        <img :src="lotus" alt="" class="lotus" />
        <p class="lema">Prática · Conhecimento · Equilíbrio para a vida</p>
      </footer>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
} from '@ionic/vue';
import {
  bookOutline,
  flowerOutline,
  homeOutline,
  leafOutline,
  personOutline,
  restaurantOutline,
} from 'ionicons/icons';
import lotus from '@/assets/lotus.png';

const tabs = [
  { path: 'hoje', label: 'Hoje', icon: homeOutline },
  { path: 'praticar', label: 'Praticar', icon: flowerOutline },
  { path: 'aprender', label: 'Aprender', icon: bookOutline },
  { path: 'ayurveda', label: 'Ayurveda', icon: leafOutline },
  { path: 'cozinha', label: 'Cozinha', icon: restaurantOutline },
  { path: 'eu', label: 'Eu', icon: personOutline },
];
</script>

<style scoped>
/* A barra segue a paleta da marca: fundo claro e o item atual em verde. */
ion-tab-bar {
  --background: #fff;
  --color: var(--life-texto-suave);
  --color-selected: var(--life-verde);
  border-top: 1px solid var(--life-borda);
}

ion-tab-button {
  --padding-top: 7px;
  --padding-bottom: 5px;
  font-size: 0.7rem;
}

.assinatura {
  /* O ion-tabs é uma coluna flex e espremia a faixa até o lótus montar em
     cima do texto. Ela não encolhe: tem a altura do que carrega. */
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 9px 16px calc(9px + var(--ion-safe-area-bottom, 0px));
  background: var(--life-fundo);
  border-top: 1px solid var(--life-borda);
}

.lotus {
  width: 24px;
  opacity: 0.55;
}

.lema {
  margin: 0;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: center;
  color: var(--life-texto-suave);
}
</style>
