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

          <h1 class="titulo">Qual sua relação<br />com o Yoga?</h1>
          <p class="subtitulo">Você pode escolher mais de uma opção.</p>

          <ul class="opcoes">
            <li v-for="nivel in niveis" :key="nivel.id">
              <label class="opcao" :class="{ marcada: experiencia === nivel.id }">
                <img :src="nivel.icone" alt="" class="icone" />
                <span class="nome">{{ nivel.nome }}</span>
                <input
                  v-model="experiencia"
                  type="radio"
                  name="experiencia"
                  :value="nivel.id"
                  class="marca-real"
                />
                <span class="bolinha" aria-hidden="true"></span>
              </label>
            </li>
          </ul>

          <h2 class="subtitulo-secao">Quais práticas você conhece?</h2>

          <ul class="grade">
            <li v-for="pratica in praticas" :key="pratica.id">
              <label class="cartao" :class="{ marcada: conhecidas.includes(pratica.id) }">
                <img :src="pratica.icone" alt="" class="icone-grande" />
                <span class="nome-pratica">{{ pratica.nome }}</span>
                <input
                  v-model="conhecidas"
                  type="checkbox"
                  :value="pratica.id"
                  class="marca-real"
                />
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
import iconeAnos from '@/assets/icones/relacao/anos.png';
import iconeComecando from '@/assets/icones/relacao/comecando.png';
import iconeNunca from '@/assets/icones/relacao/nunca.png';
import iconeProfessor from '@/assets/icones/relacao/professor.png';
import iconeRegular from '@/assets/icones/relacao/regular.png';
import iconeAsanas from '@/assets/icones/praticas/asanas.png';
import iconeKriyas from '@/assets/icones/praticas/kriyas.png';
import iconeMeditacaoPratica from '@/assets/icones/praticas/meditacao.png';
import iconeNidra from '@/assets/icones/praticas/nidra.png';
import iconeOutras from '@/assets/icones/praticas/outras.png';
import iconePranayama from '@/assets/icones/praticas/pranayama.png';

// Passo 2 do cadastro. Só aparece na primeira vez que a pessoa entra.
const router = useRouter();
const passo = 2;
const total = 14;
const rotuloPasso = computed(() => 'Passo ' + passo + ' de ' + total);

const niveis = [
  { id: 'nunca', nome: 'Nunca pratiquei', icone: iconeNunca },
  { id: 'comecando', nome: 'Estou começando', icone: iconeComecando },
  { id: 'regular', nome: 'Pratico regularmente', icone: iconeRegular },
  { id: 'anos', nome: 'Pratico há vários anos', icone: iconeAnos },
  { id: 'professor', nome: 'Sou professor(a)', icone: iconeProfessor },
];

const praticas = [
  { id: 'asanas', nome: 'Asanas', icone: iconeAsanas },
  { id: 'pranayama', nome: 'Pranáyama', icone: iconePranayama },
  { id: 'meditacao', nome: 'Meditação', icone: iconeMeditacaoPratica },
  { id: 'nidra', nome: 'Yoga Nidra', icone: iconeNidra },
  { id: 'kriyas', nome: 'Kriyás', icone: iconeKriyas },
  { id: 'outras', nome: 'Outras', icone: iconeOutras },
];

// Protótipo: começa com a mesma marcação da tela de referência.
const experiencia = ref('comecando');
const conhecidas = ref<string[]>([]);

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

/* Mesmo fundo da tela de objetivos: só o lado direito muda. */
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

.painel {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: calc(14px + var(--ion-safe-area-top, 0px)) 18px
    calc(16px + var(--ion-safe-area-bottom, 0px)) 14px;
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
  font-weight: 600;
  line-height: 1.15;
  color: #14304f;
}

.subtitulo {
  margin: 6px 0 12px;
  font-family: var(--life-serif);
  font-size: 0.8rem;
  color: #46617d;
}

/* --- Lista de experiência (escolha única) --- */

.opcoes {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.opcao {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
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
  width: 21px;
  height: 21px;
  object-fit: contain;
  flex: none;
}

.nome {
  flex: 1;
  min-width: 0;
  font-family: var(--life-serif);
  font-size: 0.78rem;
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

.bolinha {
  flex: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid #c3d2de;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.75);
}

.opcao.marcada .bolinha {
  border: 5px solid #14304f;
  background: #fff;
}

.marca-real:focus-visible ~ .bolinha,
.marca-real:focus-visible ~ .nome-pratica {
  outline: 2px solid #2f7ea6;
  outline-offset: 2px;
}

/* --- Grade de práticas conhecidas (várias) --- */

.subtitulo-secao {
  margin: 16px 0 8px;
  font-family: var(--life-serif);
  font-size: 0.92rem;
  font-weight: 600;
  color: #14304f;
}

.grade {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
}

.cartao {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px 4px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(20, 48, 79, 0.07);
  cursor: pointer;
}

.cartao.marcada {
  background: rgba(255, 255, 255, 0.98);
  border-color: #14304f;
}

.icone-grande {
  width: 27px;
  height: 27px;
  object-fit: contain;
}

.nome-pratica {
  font-family: var(--life-serif);
  font-size: 0.68rem;
  text-align: center;
  color: #14304f;
}

.continuar {
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

  .nome {
    font-size: 0.95rem;
  }

  .passo-texto {
    font-size: 0.68rem;
  }

  .icone {
    width: 26px;
    height: 26px;
  }

  .icone-grande {
    width: 34px;
    height: 34px;
  }

  .nome-pratica {
    font-size: 0.85rem;
  }

  .subtitulo-secao {
    font-size: 1.15rem;
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
