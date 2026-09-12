<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="fundo" aria-hidden="true"></div>

      <div class="layout">
        <!-- Espaço da paisagem, sem conteúdo -->
        <div class="lateral" aria-hidden="true"></div>

        <section class="painel">
          <header class="topo">
            <button type="button" class="voltar" aria-label="Voltar" @click="voltar">
              <ion-icon :icon="chevronBackOutline" />
            </button>

            <ol class="passos" :aria-label="rotuloPasso">
              <li v-for="i in total" :key="i" class="ponto" :class="{ feito: i <= passo }"></li>
            </ol>

            <button type="button" class="pular" @click="pular">Pular</button>
          </header>

          <p class="passo-texto">Passo {{ passo }} de {{ total }}</p>

          <h1 class="titulo">Conheça seu<br />perfil ayurvédico</h1>
          <p class="subtitulo">
            Responda algumas perguntas para descobrir sua constituição (Prakṛti) e seu estado atual
            (Vikṛti).
          </p>

          <ul class="doshas">
            <li v-for="dosha in doshas" :key="dosha.id">
              <label class="dosha" :class="[dosha.id, { marcada: constituicao === dosha.id }]">
                <span class="selo"><img :src="dosha.icone" alt="" /></span>
                <span class="texto">
                  <span class="nome">{{ dosha.nome }}</span>
                  <span class="descricao">{{ dosha.descricao }}</span>
                </span>
                <input
                  v-model="constituicao"
                  type="radio"
                  name="constituicao"
                  :value="dosha.id"
                  class="marca-real"
                />
                <span class="bolinha" aria-hidden="true"></span>
              </label>
            </li>
          </ul>

          <h2 class="secao">Seu estado atual</h2>
          <p class="secao-ajuda">
            Como você está se sentindo hoje?<br />(Identifica os doshas em desequilíbrio)
          </p>

          <ul class="estados">
            <li v-for="estado in estados" :key="estado.id">
              <label class="estado" :class="{ marcada: estadoAtual === estado.id }">
                <img :src="estado.icone" alt="" class="icone" />
                <span class="texto">
                  <span class="nome">{{ estado.nome }}</span>
                  <span class="descricao">{{ estado.descricao }}</span>
                </span>
                <input
                  v-model="estadoAtual"
                  type="radio"
                  name="estado"
                  :value="estado.id"
                  class="marca-real"
                />
                <span class="bolinha" aria-hidden="true"></span>
              </label>
            </li>
          </ul>

          <button type="button" class="continuar" @click="continuar">
            Continuar
            <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
          </button>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { arrowForwardOutline, chevronBackOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import iconeEquilibrio from '@/assets/icones/ayurveda/equilibrio.png';
import iconeEvidente from '@/assets/icones/ayurveda/evidente.png';
import iconeKapha from '@/assets/icones/ayurveda/kapha.png';
import iconeLeve from '@/assets/icones/ayurveda/leve.png';
import iconePitta from '@/assets/icones/ayurveda/pitta.png';
import iconeVata from '@/assets/icones/ayurveda/vata.png';

// Passo 4 do cadastro. Só aparece na primeira vez que a pessoa entra.
const router = useRouter();
const passo = 4;
const total = 6;
const rotuloPasso = computed(() => 'Passo ' + passo + ' de ' + total);

const doshas = [
  {
    id: 'vata',
    nome: 'Vata',
    descricao: 'Movimento, leveza, criatividade. Tendência à instabilidade.',
    icone: iconeVata,
  },
  {
    id: 'pitta',
    nome: 'Pitta',
    descricao: 'Transformação, foco, determinação. Tendência à intensidade.',
    icone: iconePitta,
  },
  {
    id: 'kapha',
    nome: 'Kapha',
    descricao: 'Estabilidade, força, resistência. Tendência à inércia.',
    icone: iconeKapha,
  },
];

const estados = [
  {
    id: 'equilibrio',
    nome: 'Equilíbrio',
    descricao: 'Me sinto bem e equilibrado(a).',
    icone: iconeEquilibrio,
  },
  {
    id: 'leve',
    nome: 'Leve desequilíbrio',
    descricao: 'Percebo alguns sinais.',
    icone: iconeLeve,
  },
  {
    id: 'evidente',
    nome: 'Desequilíbrio evidente',
    descricao: 'Tenho vários sinais no momento.',
    icone: iconeEvidente,
  },
];

const constituicao = ref('');
const estadoAtual = ref('');

function voltar() {
  router.back();
}

// Quem não quer responder vai direto para a biblioteca escolher a própria aula.
function pular() {
  router.push('/tabs/praticar');
}

// Protótipo: no fim das perguntas vem a criação da conta.
function continuar() {
  router.push('/criar-conta');
}
</script>

<style scoped>
.tela {
  --background: #fff;
}

/* Fundo próprio deste passo: foto das especiarias, logo e frase. */
.fundo {
  position: fixed;
  inset: 0;
  background: url('@/assets/fundo-ayurveda.jpg') left center / cover no-repeat;
}

.layout {
  position: relative;
  display: flex;
  min-height: 100%;
}

.lateral {
  flex: none;
  width: 43%;
  max-width: 22rem;
}

.painel {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: calc(14px + var(--ion-safe-area-top, 0px)) 16px
    calc(16px + var(--ion-safe-area-bottom, 0px)) 20px;
}

.topo {
  display: flex;
  align-items: center;
  gap: 5px;
}

.voltar {
  display: flex;
  padding: 6px;
  background: none;
  border: 0;
  color: #14304f;
  font-size: 1.35rem;
  cursor: pointer;
}

.pular {
  padding: 6px;
  background: none;
  border: 0;
  color: #2f6e94;
  font-size: 0.82rem;
  cursor: pointer;
}

.passos {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ponto {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #cddbe6;
}

.ponto.feito {
  background: #14304f;
}

.passo-texto {
  margin: 12px 0 0;
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #6b8299;
}

.titulo {
  margin: 6px 0 0;
  font-family: var(--life-serif);
  font-size: clamp(1.3rem, 5.6vw, 2.1rem);
  font-weight: 600;
  line-height: 1.15;
  color: #14304f;
}

.subtitulo {
  margin: 6px 0 12px;
  font-family: var(--life-serif);
  font-size: 0.65rem;
  line-height: 1.45;
  color: #46617d;
}

/* --- Constituição: Vata, Pitta e Kapha --- */

.doshas,
.estados {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dosha,
.estado {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 9px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(20, 48, 79, 0.07);
  cursor: pointer;
}

.dosha.marcada,
.estado.marcada {
  background: rgba(255, 255, 255, 0.96);
  border-color: #14304f;
}

.selo {
  flex: none;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.selo img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

/* Cada dosha tem a sua cor de selo, como na referência. */
.dosha.vata .selo {
  background: #e7eef1;
}

.dosha.pitta .selo {
  background: #fbe8db;
}

.dosha.kapha .selo {
  background: #e4efe3;
}

.texto {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nome {
  font-family: var(--life-serif);
  font-size: 0.78rem;
  font-weight: 600;
  color: #14304f;
}

.descricao {
  font-size: 0.58rem;
  line-height: 1.35;
  color: #5c7086;
}

.marca-real {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.bolinha {
  flex: none;
  width: 17px;
  height: 17px;
  border: 1.5px solid #c3d2de;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.75);
}

.dosha.marcada .bolinha,
.estado.marcada .bolinha {
  border: 5px solid #14304f;
  background: #fff;
}

.marca-real:focus-visible ~ .bolinha {
  outline: 2px solid #2f7ea6;
  outline-offset: 2px;
}

/* --- Estado atual --- */

.secao {
  margin: 14px 0 2px;
  font-family: var(--life-serif);
  font-size: 0.88rem;
  font-weight: 600;
  color: #14304f;
}

.secao-ajuda {
  margin: 0 0 8px;
  font-size: 0.58rem;
  line-height: 1.4;
  color: #5c7086;
}

.estado .icone {
  flex: none;
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.continuar {
  /* O espaço que sobra fica antes do botão, que encosta no fim da tela. */
  margin: auto 0 0;
  flex: none;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 13px;
  font-family: var(--life-serif);
  font-size: 0.95rem;
  font-weight: 500;
  color: #fff;
  background: #14304f;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.continuar:active {
  background: #0f2540;
}

@media (min-width: 40rem) {
  .lateral {
    width: 40%;
  }

  .painel {
    padding: 40px 48px;
  }

  .pular,
  .subtitulo {
    font-size: 1rem;
  }

  .passo-texto {
    font-size: 0.68rem;
  }

  .nome {
    font-size: 1rem;
  }

  .descricao,
  .secao-ajuda {
    font-size: 0.78rem;
  }

  .secao {
    font-size: 1.15rem;
  }

  .selo {
    width: 48px;
    height: 48px;
  }

  .selo img {
    width: 28px;
    height: 28px;
  }

  .estado .icone {
    width: 26px;
    height: 26px;
  }

  .continuar {
    font-size: 1.05rem;
    padding: 16px;
  }
}
</style>
