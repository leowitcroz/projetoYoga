import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { carregarRespostasSalvas } from './servicos/respostas';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Tema escuro do Ionic: desligado de propósito.
 *
 * As telas do LIFE usam as cores da marca direto (`--life-*`), e não existe
 * versão escura delas. Com o `dark.system.css` ligado, um celular no modo
 * escuro escurecia só a barra de abas — o resto continuava claro, e a barra
 * destoava da tela inteira. Quando houver um tema escuro de verdade, ele
 * volta junto com as telas.
 */

/* Theme variables */
import './theme/variables.css';

const app = createApp(App).use(IonicVue).use(router);

// As respostas do cadastro ficam no aparelho até a conta existir (ONB-08).
carregarRespostasSalvas()
  .then(() => router.isReady())
  .then(() => {
    app.mount('#app');
  });
