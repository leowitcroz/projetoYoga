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

          <h1 class="titulo">Saúde e bem-estar</h1>
          <p class="subtitulo">
            Para sua segurança, nos conte sobre alguma condição que devemos considerar.
          </p>

          <ul class="condicoes">
            <li v-for="condicao in condicoes" :key="condicao.id">
              <label class="condicao" :class="{ marcada: marcadas.includes(condicao.id) }">
                <img :src="condicao.icone" alt="" class="icone" />
                <span class="nome">{{ condicao.nome }}</span>
                <input v-model="marcadas" type="checkbox" :value="condicao.id" class="marca-real" />
                <span class="chave" aria-hidden="true"><span class="bolinha"></span></span>
              </label>
            </li>
          </ul>

          <p class="aviso">
            <img :src="iconeInfo" alt="" class="icone-aviso" />
            <span>
              Essas informações nos ajudam a recomendar práticas mais seguras e adequadas. Não
              substituem avaliação médica.
            </span>
          </p>

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
import iconeAnsiedade from '@/assets/icones/saude/ansiedade.png';
import iconeArticulares from '@/assets/icones/saude/articulares.png';
import iconeCardiacas from '@/assets/icones/saude/cardiacas.png';
import iconeDiabetes from '@/assets/icones/saude/diabetes.png';
import iconeGastrointestinais from '@/assets/icones/saude/gastrointestinais.png';
import iconeGestacao from '@/assets/icones/saude/gestacao.png';
import iconeGlaucoma from '@/assets/icones/saude/glaucoma.png';
import iconeHipertensao from '@/assets/icones/saude/hipertensao.png';
import iconeInfo from '@/assets/icones/saude/info.png';
import iconeOutras from '@/assets/icones/saude/outras.png';
import iconeRespiratorios from '@/assets/icones/saude/respiratorios.png';

// Passo 3 do cadastro. Só aparece na primeira vez que a pessoa entra.
const router = useRouter();
const passo = 3;
const total = 6;
const rotuloPasso = computed(() => 'Passo ' + passo + ' de ' + total);

const condicoes = [
  { id: 'cardiacas', nome: 'Condições cardíacas', icone: iconeCardiacas },
  { id: 'respiratorios', nome: 'Problemas respiratórios', icone: iconeRespiratorios },
  { id: 'diabetes', nome: 'Diabetes', icone: iconeDiabetes },
  { id: 'hipertensao', nome: 'Hipertensão', icone: iconeHipertensao },
  { id: 'articulares', nome: 'Problemas articulares', icone: iconeArticulares },
  { id: 'gastrointestinais', nome: 'Problemas gastrointestinais', icone: iconeGastrointestinais },
  { id: 'ansiedade', nome: 'Ansiedade / depressão', icone: iconeAnsiedade },
  { id: 'glaucoma', nome: 'Glaucoma', icone: iconeGlaucoma },
  { id: 'gestacao', nome: 'Gestação', icone: iconeGestacao },
  { id: 'outras', nome: 'Outras condições', icone: iconeOutras },
];

const marcadas = ref<string[]>([]);

function voltar() {
  router.back();
}

// Quem não quer responder vai direto para a biblioteca escolher a própria aula.
function pular() {
  router.push('/tabs/praticar');
}

function continuar() {
  router.push('/onboarding/ayurveda');
}
</script>

<style scoped>
.tela {
  --background: #fff;
}

/* Mesmo fundo dos outros passos: só o lado direito muda. */
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
  width: 38%;
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
  font-size: clamp(1.35rem, 5.8vw, 2.1rem);
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

/* --- Lista de condições, com chave liga/desliga --- */

.condicoes {
  margin: 0;
  padding: 0;
  list-style: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.condicoes li {
  flex: 1 1 auto;
  /* min-width: 0 impede que um nome comprido alargue o cartão além da tela. */
  min-width: 0;
  max-height: 64px;
  display: flex;
}

.condicao {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 9px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(20, 48, 79, 0.07);
  cursor: pointer;
}

.condicao.marcada {
  background: rgba(255, 255, 255, 0.95);
}

.icone {
  width: 17px;
  height: 17px;
  object-fit: contain;
  flex: none;
}

.nome {
  flex: 1;
  min-width: 0;
  font-family: var(--life-serif);
  font-size: 0.64rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #14304f;
}

.marca-real {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.chave {
  flex: none;
  width: 30px;
  height: 17px;
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 999px;
  background: #d4dfe8;
  transition: background 0.15s ease;
}

.bolinha {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(20, 48, 79, 0.3);
  transition: transform 0.15s ease;
}

.condicao.marcada .chave {
  background: #14304f;
}

.condicao.marcada .bolinha {
  transform: translateX(13px);
}

.marca-real:focus-visible ~ .chave {
  outline: 2px solid #2f7ea6;
  outline-offset: 2px;
}

.aviso {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin: 10px 0 0;
  padding: 9px 11px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 14px;
  font-size: 0.66rem;
  line-height: 1.45;
  color: #46617d;
}

.icone-aviso {
  width: 16px;
  height: 16px;
  flex: none;
  object-fit: contain;
}

.continuar {
  margin: 12px 0 0;
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
  .subtitulo,
  .nome {
    font-size: 1rem;
  }

  .passo-texto {
    font-size: 0.68rem;
  }

  .icone {
    width: 26px;
    height: 26px;
  }

  .condicao {
    gap: 16px;
    padding: 12px 16px;
  }

  .aviso {
    font-size: 0.8rem;
  }

  .continuar {
    font-size: 1.05rem;
    padding: 16px;
  }
}
</style>
