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
  padding-bottom: var(--ion-safe-area-bottom, 0px);
}

ion-tab-button {
  --padding-top: 7px;
  --padding-bottom: 5px;
  font-size: 0.7rem;
}
</style>
