<template>
  <ion-page>
    <!--
      O `ion-tabs` do Ionic é `position: absolute` com `height: 100%`, e por
      isso cobria a tela inteira, assinatura incluída. Em vez de disputar essa
      regra na folha de estilo, ele ganha uma moldura: o absoluto dele passa a
      medir contra ela, e a moldura divide a altura com a assinatura.
    -->
    <div class="moldura">
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
    </div>

    <!--
      A assinatura fica presa embaixo de tudo, abaixo da navegação, e não no
      fim do conteúdo de cada tela: antes ela só aparecia para quem rolasse a
      página até o fim, e em tela curta nunca aparecia.

      Ela é irmã do `ion-tabs`, não filha: dentro dele, o conteúdo da tela
      passava por cima do texto, porque o `ion-router-outlet` cobre o `ion-tabs`
      inteiro.
    -->
    <footer class="assinatura">
      <img :src="lotus" alt="" class="lotus" />
      <p class="lema">Prática · Conhecimento · Equilíbrio para a vida</p>
    </footer>
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
/* A moldura é quem ocupa o espaço; o `ion-tabs` se estica dentro dela. */
.moldura {
  position: relative;
  flex: 1;
  min-height: 0;
}

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
  /* Não encolhe: tem a altura do que carrega. */
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
