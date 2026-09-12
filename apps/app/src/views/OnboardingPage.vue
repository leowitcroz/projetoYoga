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

          <h1 class="titulo">O que você busca?</h1>
          <p class="subtitulo">Você pode escolher mais de uma opção.</p>

          <ul class="opcoes">
            <li v-for="opcao in objetivos" :key="opcao.id">
              <label class="opcao" :class="{ marcada: selecionados.includes(opcao.id) }">
                <img :src="opcao.icone" alt="" class="icone" />
                <span class="nome">{{ opcao.nome }}</span>
                <input
                  v-model="selecionados"
                  type="checkbox"
                  :value="opcao.id"
                  class="caixa-real"
                />
                <span class="caixa" aria-hidden="true">
                  <ion-icon :icon="checkmarkOutline" />
                </span>
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
import { arrowForwardOutline, checkmarkOutline, chevronBackOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import iconeAyurveda from '@/assets/icones/ayurveda.png';
import iconeDisposicao from '@/assets/icones/disposicao.png';
import iconeEstresse from '@/assets/icones/estresse.png';
import iconeFilosofia from '@/assets/icones/filosofia.png';
import iconeFlexibilidade from '@/assets/icones/flexibilidade.png';
import iconeForca from '@/assets/icones/forca.png';
import iconeFormacao from '@/assets/icones/formacao.png';
import iconeMeditacao from '@/assets/icones/meditacao.png';
import iconeMobilidade from '@/assets/icones/mobilidade.png';
import iconePratica from '@/assets/icones/pratica.png';
import iconeRespiracao from '@/assets/icones/respiracao.png';
import iconeSono from '@/assets/icones/sono.png';

// Tela do cadastro. Só aparece na primeira vez que a pessoa entra.
const router = useRouter();
const passo = 1;
const total = 14;
const rotuloPasso = computed(() => 'Passo ' + passo + ' de ' + total);

const objetivos = [
  { id: 'mobilidade', nome: 'Melhorar mobilidade', icone: iconeMobilidade },
  { id: 'flexibilidade', nome: 'Flexibilidade', icone: iconeFlexibilidade },
  { id: 'forca', nome: 'Força', icone: iconeForca },
  { id: 'estresse', nome: 'Reduzir estresse', icone: iconeEstresse },
  { id: 'sono', nome: 'Dormir melhor', icone: iconeSono },
  { id: 'respiracao', nome: 'Respirar melhor', icone: iconeRespiracao },
  { id: 'meditacao', nome: 'Meditar', icone: iconeMeditacao },
  { id: 'disposicao', nome: 'Melhorar disposição', icone: iconeDisposicao },
  { id: 'ayurveda', nome: 'Conhecer Ayurveda', icone: iconeAyurveda },
  { id: 'filosofia', nome: 'Estudar filosofia do Yoga', icone: iconeFilosofia },
  { id: 'pratica', nome: 'Aprofundar minha prática', icone: iconePratica },
  { id: 'formacao', nome: 'Formação profissional', icone: iconeFormacao },
];

// Protótipo: começa com as mesmas marcações da tela de referência.
const selecionados = ref<string[]>(['forca', 'estresse', 'sono']);

function voltar() {
  router.back();
}

// Quem não quer responder vai direto para a biblioteca escolher a própria aula.
function pular() {
  router.push('/tabs/praticar');
}

// Protótipo: só o passo 1 existe. No fim das perguntas vem a criação da conta.
function continuar() {
  router.push('/criar-conta');
}
</script>

<style scoped>
.tela {
  --background: #fff;
}

/* Fundo pronto (arte do cliente): traz a paisagem, a logo, a frase e as folhas.
   A tela desenha por cima só o que é interativo. */
.fundo {
  position: fixed;
  inset: 0;
  background: url('@/assets/fundo-perguntas.jpg') left center / cover no-repeat;
}

.layout {
  position: relative;
  display: flex;
  min-height: 100%;
}

.lateral {
  flex: none;
  width: 40%;
  max-width: 22rem;
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

.painel {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  /* Margem à direita é padding, não margin: margin somaria à largura e empurraria
     o conteúdo para fora da tela. */
  padding: calc(14px + var(--ion-safe-area-top, 0px)) 18px
    calc(16px + var(--ion-safe-area-bottom, 0px)) 14px;
}

.topo {
  display: flex;
  align-items: center;
  gap: 12px;
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
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ponto {
  width: 5px;
  height: 5px;
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
  font-size: clamp(1.35rem, 5.8vw, 2.1rem);
  font-weight: 500;
  line-height: 1.1;
  color: #14304f;
}

.subtitulo {
  margin: 6px 0 12px;
  font-family: var(--life-serif);
  font-size: 0.8rem;
  color: #46617d;
}

/* A lista cresce para ocupar a tela: em telas altas os cartões ficam um pouco
   mais altos, até um limite, em vez de abrir vãos entre eles. */
.opcoes {
  margin: 0;
  padding: 0;
  list-style: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.opcoes li {
  flex: 1 1 auto;
  max-height: 52px;
  display: flex;
}

.opcao {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(20, 48, 79, 0.07);
  cursor: pointer;
}

.opcao.marcada {
  background: rgba(255, 255, 255, 0.95);
}

.icone {
  width: 19px;
  height: 19px;
  object-fit: contain;
  flex: none;
}

.nome {
  flex: 1;
  min-width: 0;
  font-family: var(--life-serif);
  font-size: 0.74rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #14304f;
}

.caixa-real {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.caixa {
  flex: none;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #c3d2de;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.75);
  color: transparent;
  font-size: 1rem;
}

.opcao.marcada .caixa {
  background: #14304f;
  border-color: #14304f;
  color: #fff;
}

.caixa-real:focus-visible + .caixa {
  outline: 2px solid #2f7ea6;
  outline-offset: 2px;
}

.continuar {
  margin: 12px 0 0;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
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

/* Empurra o rodapé para o fim da tela, não logo abaixo do botão. */

@media (min-width: 40rem) {
  .lateral {
    padding: 40px 32px 0;
  }

  .lateral-assinatura {
    font-size: 0.72rem;
  }

  .fio {
    margin: 28px 0;
  }

  .lateral-frase {
    font-size: 1.45rem;
  }

  .painel {
    padding: 40px 48px;
  }

  .pular,
  .subtitulo {
    font-size: 1rem;
  }

  .nome {
    font-size: 0.95rem;
  }

  .passo-texto {
    font-size: 0.68rem;
  }

  .icone,
  .caixa {
    width: 24px;
    height: 24px;
  }

  .opcao {
    gap: 16px;
    padding: 12px 16px;
  }

  .continuar {
    font-size: 1.05rem;
    padding: 16px;
  }
}
</style>
