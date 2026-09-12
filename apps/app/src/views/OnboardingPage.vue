<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="layout">
        <!-- Coluna da marca: aparece em telas largas, como no material de referência -->
        <aside class="lateral" aria-hidden="true">
          <div class="lateral-fundo"></div>
          <div class="lateral-conteudo">
            <img :src="logo" alt="" class="lateral-logo" />
            <p class="lateral-assinatura">Yoga · Ayurveda · Ciência · Filosofia</p>
            <span class="fio"></span>
            <p class="lateral-frase">
              Uma vida<br />mais consciente,<br />dentro e fora<br />do tapete.
            </p>
          </div>
        </aside>

        <section class="painel">
          <header class="topo">
            <button type="button" class="voltar" aria-label="Voltar" @click="voltar">
              <ion-icon :icon="chevronBackOutline" />
            </button>

            <ol v-if="!diario" class="passos" :aria-label="rotuloPasso">
              <li v-for="i in total" :key="i" class="ponto" :class="{ feito: i <= passo }"></li>
            </ol>
            <span v-else class="espaco"></span>

            <button type="button" class="pular" @click="pular">Pular</button>
          </header>

          <p class="passo-texto">{{ diario ? 'Seu dia' : `Passo ${passo} de ${total}` }}</p>

          <h1 class="titulo">
            {{ diario ? 'O que você quer trabalhar hoje?' : 'O que você busca?' }}
          </h1>
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

          <footer class="rodape">
            <span class="linha"></span>
            <img :src="lotus" alt="" class="lotus" />
            <span class="linha"></span>
            <p class="lema">Prática · Conhecimento · Equilíbrio<br />para a vida</p>
          </footer>
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
import logo from '@/assets/logo.png';
import lotus from '@/assets/lotus.png';
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

// `diario` = a mesma tela no uso de todo dia: sem os passos do cadastro e com o
// objetivo do dia (tático), que vem pré-marcado com os objetivos do perfil.
const { diario = false } = defineProps<{ diario?: boolean }>();

const router = useRouter();
const passo = 2;
const total = 7;
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

function continuar() {
  router.push('/checkin');
}
</script>

<style scoped>
.tela {
  --background: #eef4f8;
}

.layout {
  display: flex;
  min-height: 100%;
}

/* --- Coluna da marca (telas largas) --- */

.lateral {
  display: none;
  position: relative;
  width: 38%;
  max-width: 25rem;
  overflow: hidden;
}

.lateral-fundo {
  position: absolute;
  inset: 0;
  background: url('@/assets/backgroundLogin.jpg') center / cover no-repeat;
}

.lateral-fundo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.3) 62%);
}

.lateral-conteudo {
  position: relative;
  padding: 40px 32px;
}

.lateral-logo {
  width: 132px;
  height: auto;
}

.lateral-assinatura {
  margin: 8px 0 0;
  font-size: 0.72rem;
  color: #1c4066;
}

.fio {
  display: block;
  width: 46px;
  height: 1px;
  margin: 28px 0;
  background: rgba(20, 48, 79, 0.4);
}

.lateral-frase {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.45rem;
  line-height: 1.45;
  color: #14304f;
}

/* --- Painel das perguntas --- */

.painel {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: calc(18px + var(--ion-safe-area-top, 0px)) 20px
    calc(20px + var(--ion-safe-area-bottom, 0px));
  background: linear-gradient(180deg, #f7fbfd 0%, #eaf2f8 100%);
}

.topo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.voltar,
.pular {
  padding: 6px;
  background: none;
  border: 0;
  color: #2f6e94;
  cursor: pointer;
}

.voltar {
  font-size: 1.35rem;
  display: flex;
  color: #14304f;
}

.pular {
  font-size: 0.95rem;
}

.passos {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ponto {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #cddbe6;
}

.ponto.feito {
  background: #14304f;
}

.espaco {
  flex: 1;
}

.passo-texto {
  margin: 14px 0 0;
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #6b8299;
}

.titulo {
  margin: 10px 0 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.8rem, 7vw, 2.3rem);
  font-weight: 500;
  line-height: 1.1;
  color: #14304f;
}

.subtitulo {
  margin: 8px 0 18px;
  font-size: 1rem;
  color: #4d627a;
}

.opcoes {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.opcao {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(20, 48, 79, 0.06);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(20, 48, 79, 0.05);
  cursor: pointer;
}

.opcao.marcada {
  border-color: rgba(20, 48, 79, 0.18);
}

.icone {
  width: 26px;
  height: 26px;
  object-fit: contain;
  flex: none;
}

.nome {
  flex: 1;
  min-width: 0;
  font-size: 1rem;
  color: #14304f;
}

.caixa-real {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.caixa {
  flex: none;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #c3d2de;
  border-radius: 8px;
  background: #fff;
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
  margin: 20px 0 0;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
  background: #14304f;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.continuar:active {
  background: #0f2540;
}

.rodape {
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.linha {
  height: 1px;
  background: rgba(20, 48, 79, 0.18);
}

.lotus {
  width: 26px;
  height: auto;
}

.lema {
  grid-column: 1 / -1;
  margin: 8px 0 0;
  text-align: center;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  line-height: 1.7;
  color: #4d627a;
}

@media (min-width: 56rem) {
  .lateral {
    display: block;
  }

  .painel {
    padding: 40px 48px;
  }

  .opcoes,
  .continuar,
  .rodape,
  .titulo,
  .subtitulo,
  .passo-texto {
    max-width: 34rem;
  }
}
</style>
