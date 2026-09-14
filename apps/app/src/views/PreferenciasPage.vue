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

          <h1 class="titulo">O que você prefere?</h1>
          <p class="subtitulo">Isso nos ajuda a criar uma experiência mais alinhada com você.</p>

          <h2 class="secao">Estilos de prática</h2>
          <ul class="fichas">
            <li v-for="estilo in estilos" :key="estilo">
              <label class="ficha" :class="{ marcada: estilosEscolhidos.includes(estilo) }">
                <input
                  v-model="estilosEscolhidos"
                  type="checkbox"
                  :value="estilo"
                  class="marca-real"
                />
                <span class="marca" aria-hidden="true">
                  <ion-icon :icon="checkmarkOutline" />
                </span>
                <span class="rotulo">{{ estilo }}</span>
              </label>
            </li>
          </ul>

          <h2 class="secao">Temas de interesse</h2>
          <ul class="fichas">
            <li v-for="tema in temas" :key="tema">
              <label class="ficha" :class="{ marcada: temasEscolhidos.includes(tema) }">
                <input v-model="temasEscolhidos" type="checkbox" :value="tema" class="marca-real" />
                <span class="marca" aria-hidden="true">
                  <ion-icon :icon="checkmarkOutline" />
                </span>
                <span class="rotulo">{{ tema }}</span>
              </label>
            </li>
          </ul>

          <h2 class="secao">Horário preferido</h2>
          <ul class="horarios">
            <li v-for="hora in horarios" :key="hora.id">
              <label class="horario" :class="{ marcada: horarioEscolhido === hora.id }">
                <input
                  v-model="horarioEscolhido"
                  type="radio"
                  name="horario"
                  :value="hora.id"
                  class="marca-real"
                />
                <span class="selo-marca" aria-hidden="true">
                  <ion-icon :icon="checkmarkOutline" />
                </span>
                <img :src="hora.icone" alt="" class="icone" />
                <span class="rotulo">{{ hora.nome }}</span>
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
import iconeManha from '@/assets/icones/horario/manha.png';
import iconeNoite from '@/assets/icones/horario/noite.png';
import iconeTarde from '@/assets/icones/horario/tarde.png';

// Passo 5 do cadastro. Só aparece na primeira vez que a pessoa entra.
const router = useRouter();
const passo = 5;
const total = 6;
const rotuloPasso = computed(() => 'Passo ' + passo + ' de ' + total);

const estilos = [
  'Hatha',
  'Ashtanga',
  'Vinyasa',
  'Restaurativo',
  'Yin Yoga',
  'Práticas suaves',
  'Práticas vigorosas',
];

const temas = [
  'Pranáyama',
  'Meditação',
  'Yoga Nidra',
  'Filosofia',
  'Fisiologia',
  'Alimentação saudável',
];

const horarios = [
  { id: 'manha', nome: 'Manhã', icone: iconeManha },
  { id: 'tarde', nome: 'Tarde', icone: iconeTarde },
  { id: 'noite', nome: 'Noite', icone: iconeNoite },
];

// Protótipo: começa com as mesmas marcações da tela de referência.
const estilosEscolhidos = ref<string[]>(['Hatha']);
const temasEscolhidos = ref<string[]>(['Pranáyama', 'Meditação', 'Alimentação saudável']);
const horarioEscolhido = ref('manha');

function voltar() {
  router.back();
}

// Quem não quer responder vai direto para a biblioteca escolher a própria aula.
// Quem pula as perguntas ainda precisa criar a conta (AUTH-01).
function pular() {
  router.push('/criar-conta');
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

/* Mesmo fundo dos passos 1 a 3. */
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
  font-size: clamp(1.3rem, 5.6vw, 2.1rem);
  font-weight: 600;
  line-height: 1.15;
  color: #14304f;
}

.subtitulo {
  margin: 6px 0 0;
  font-family: var(--life-serif);
  font-size: 0.65rem;
  line-height: 1.45;
  color: #46617d;
}

.secao {
  margin: clamp(12px, 2.2vh, 22px) 0 6px;
  font-family: var(--life-serif);
  font-size: 0.8rem;
  font-weight: 600;
  color: #14304f;
}

/* --- Fichas de escolha múltipla --- */

.fichas {
  margin: 0;
  padding: 0;
  list-style: none;
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* as fichas crescem um pouco em telas altas, sem virar cápsulas enormes */
  grid-auto-rows: minmax(32px, 44px);
  column-gap: 6px;
  row-gap: clamp(6px, 1.6vh, 14px);
}

.fichas li,
.horarios li {
  min-width: 0;
  display: flex;
}

.ficha {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 9px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 999px;
  box-shadow: 0 3px 12px rgba(20, 48, 79, 0.07);
  cursor: pointer;
}

.ficha.marcada {
  background: #4a7458;
  border-color: #4a7458;
}

.marca {
  flex: none;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #c3d2de;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  color: transparent;
  font-size: 0.7rem;
}

.ficha.marcada .marca {
  border-color: rgba(255, 255, 255, 0.9);
  background: transparent;
  color: #fff;
}

.rotulo {
  flex: 1;
  min-width: 0;
  font-family: var(--life-serif);
  font-size: 0.62rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #14304f;
}

.ficha.marcada .rotulo {
  color: #fff;
}

.marca-real {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.marca-real:focus-visible ~ .marca {
  outline: 2px solid #2f7ea6;
  outline-offset: 2px;
}

/* --- Horário preferido --- */

.horarios {
  margin: 0;
  padding: 0;
  list-style: none;
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(58px, 80px);
  gap: 7px;
}

.horario {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 9px 4px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 14px;
  box-shadow: 0 3px 12px rgba(20, 48, 79, 0.07);
  cursor: pointer;
}

.horario.marcada {
  background: #4a7458;
  border-color: #4a7458;
}

.horario .icone {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.horario.marcada .icone {
  /* o ícone é azul-marinho: no cartão verde ele precisa ficar branco */
  filter: brightness(0) invert(1);
}

.horario .rotulo {
  flex: none;
  font-size: 0.62rem;
  text-align: center;
}

.horario.marcada .rotulo {
  color: #fff;
}

.selo-marca {
  position: absolute;
  top: 5px;
  right: 6px;
  display: none;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  color: #4a7458;
  font-size: 0.6rem;
}

.horario.marcada .selo-marca {
  display: flex;
}

.continuar {
  /* o espaço que sobra na tela fica antes do botão */
  margin-top: 7px !important;
  margin: auto 0 0;
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

  .secao {
    font-size: 1.1rem;
  }

  .rotulo {
    font-size: 0.88rem;
  }

  .horario .icone {
    width: 28px;
    height: 28px;
  }

  .continuar {
    font-size: 1.05rem;
    padding: 16px;
  }
}
</style>
