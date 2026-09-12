<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="fundo" aria-hidden="true"></div>

      <div class="conteudo">
        <!-- Coluna da Esquerda (Marca/Fundo) - Oculta em telas muito pequenas -->
        <div class="lateral">
          <button class="voltar" aria-label="Voltar" @click="voltar">
            <ion-icon :icon="chevronBackOutline" />
          </button>

          <div class="marca">
            <img :src="logo" alt="LIFE" class="logo" />
            <p class="assinatura">Yoga · Ayurveda · Ciência · Filosofia</p>
          </div>

          <h2 class="frase">Uma vida<br />mais consciente,<br />dentro e fora<br />do tapete.</h2>
        </div>

        <!-- Coluna da Direita (Questionário) -->
        <div class="painel-questoes">
          <header class="cabecalho-questoes">
            <!-- Em telas móveis, o botão de voltar fica aqui -->
            <button class="voltar-mobile" aria-label="Voltar" @click="voltar">
              <ion-icon :icon="chevronBackOutline" />
            </button>

            <div class="progresso">
              <span
                v-for="passo in totalPassos"
                :key="passo"
                class="bolinha"
                :class="{ ativa: passo === passoAtual }"
              ></span>
            </div>

            <button class="pular" @click="pular">Pular</button>
          </header>

          <p class="passo-texto">PASSO {{ passoAtual }} DE {{ totalPassos }}</p>

          <div v-if="passoAtual === 1" class="pergunta-container">
            <h1 class="titulo">Como foi seu sono?</h1>
            <p class="subtitulo">Avalie de 1 a 5.</p>
            <div class="opcoes">
              <button
                v-for="n in 5"
                :key="'sono-' + n"
                class="opcao-unica"
                :class="{ selecionada: respostas.sono === n }"
                @click="selecionarUnica('sono', n)"
              >
                {{ n }}
              </button>
            </div>
          </div>

          <div v-else-if="passoAtual === 2" class="pergunta-container">
            <h1 class="titulo">Como está sua energia hoje?</h1>
            <p class="subtitulo">Avalie de 1 a 5.</p>
            <div class="opcoes">
              <button
                v-for="n in 5"
                :key="'energia-' + n"
                class="opcao-unica"
                :class="{ selecionada: respostas.energia === n }"
                @click="selecionarUnica('energia', n)"
              >
                {{ n }}
              </button>
            </div>
          </div>

          <div v-else-if="passoAtual === 3" class="pergunta-container">
            <h1 class="titulo">Qual seu nível de estresse?</h1>
            <p class="subtitulo">Avalie de 1 a 5.</p>
            <div class="opcoes">
              <button
                v-for="n in 5"
                :key="'estresse-' + n"
                class="opcao-unica"
                :class="{ selecionada: respostas.estresse === n }"
                @click="selecionarUnica('estresse', n)"
              >
                {{ n }}
              </button>
            </div>
          </div>

          <div v-else-if="passoAtual === 4" class="pergunta-container">
            <h1 class="titulo">Como você sente seu corpo?</h1>
            <div class="opcoes-lista">
              <label
                v-for="op in opcoesCorpo"
                :key="op"
                class="opcao-check"
                :class="{ selecionada: respostas.corpo === op }"
              >
                <span class="texto-opcao">{{ op }}</span>
                <input
                  v-model="respostas.corpo"
                  type="radio"
                  name="corpo"
                  :value="op"
                  @change="avancarPasso"
                />
                <span class="checkbox-falso radio-falso"></span>
              </label>
            </div>
          </div>

          <div v-else-if="passoAtual === 5" class="pergunta-container">
            <h1 class="titulo">Sente alguma dor?</h1>
            <div class="opcoes-lista">
              <label class="opcao-check" :class="{ selecionada: respostas.dor === true }">
                <span class="texto-opcao">Sim</span>
                <input v-model="respostas.dor" type="radio" :value="true" @change="avancarPasso" />
                <span class="checkbox-falso radio-falso"></span>
              </label>
              <label class="opcao-check" :class="{ selecionada: respostas.dor === false }">
                <span class="texto-opcao">Não</span>
                <input v-model="respostas.dor" type="radio" :value="false" @change="avancarPasso" />
                <span class="checkbox-falso radio-falso"></span>
              </label>
            </div>
          </div>

          <div v-else-if="passoAtual === 6" class="pergunta-container">
            <h1 class="titulo">Como está sua digestão?</h1>
            <div class="opcoes-lista">
              <label
                v-for="op in opcoesDigestao"
                :key="op"
                class="opcao-check"
                :class="{ selecionada: respostas.digestao === op }"
              >
                <span class="texto-opcao">{{ op }}</span>
                <input
                  v-model="respostas.digestao"
                  type="radio"
                  name="digestao"
                  :value="op"
                  @change="avancarPasso"
                />
                <span class="checkbox-falso radio-falso"></span>
              </label>
            </div>
          </div>

          <div v-else-if="passoAtual === 7" class="pergunta-container">
            <h1 class="titulo">Quanto tempo você tem?</h1>
            <div class="opcoes-lista">
              <label
                v-for="op in opcoesTempo"
                :key="op.valor"
                class="opcao-check"
                :class="{ selecionada: respostas.tempo === op.valor }"
              >
                <span class="texto-opcao">{{ op.label }}</span>
                <input
                  v-model="respostas.tempo"
                  type="radio"
                  name="tempo"
                  :value="op.valor"
                  @change="concluirCheckin"
                />
                <span class="checkbox-falso radio-falso"></span>
              </label>
            </div>
          </div>

          <div class="rodape-questoes">
            <button v-show="podeAvancar" class="botao-continuar" @click="avancarPasso">
              Continuar <ion-icon :icon="arrowForwardOutline" class="icone-btn" />
            </button>

            <div class="lema-rodape">
              <span class="linha"></span>
              <img :src="lotus" alt="" class="lotus" />
              <span class="linha"></span>
            </div>
            <p class="texto-lema">PRÁTICA · CONHECIMENTO · EQUILÍBRIO<br />PARA A VIDA</p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { chevronBackOutline, arrowForwardOutline } from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import logo from '@/assets/logo.png';
import lotus from '@/assets/lotus.png';

const router = useRouter();

const passoAtual = ref(1);
const totalPassos = 7;

interface RespostasCheckin {
  sono: number | null;
  energia: number | null;
  estresse: number | null;
  corpo: string | null;
  dor: boolean | null;
  digestao: string | null;
  tempo: number | null;
}

const respostas = ref<RespostasCheckin>({
  sono: null,
  energia: null,
  estresse: null,
  corpo: null,
  dor: null,
  digestao: null,
  tempo: null,
});

const opcoesCorpo = ['Leve', 'Bem', 'Cansado', 'Rígido', 'Muito cansado'];
const opcoesDigestao = ['Boa', 'Normal', 'Pesada', 'Desconfortável', 'Azia/queimação'];
const opcoesTempo = [
  { label: '10 min', valor: 10 },
  { label: '20 min', valor: 20 },
  { label: '30 min', valor: 30 },
  { label: '45 min', valor: 45 },
  { label: '60+ min', valor: 60 },
];

const podeAvancar = computed(() => {
  if (passoAtual.value === 1) return respostas.value.sono !== null;
  if (passoAtual.value === 2) return respostas.value.energia !== null;
  if (passoAtual.value === 3) return respostas.value.estresse !== null;
  if (passoAtual.value === 4) return respostas.value.corpo !== null;
  if (passoAtual.value === 5) return respostas.value.dor !== null;
  if (passoAtual.value === 6) return respostas.value.digestao !== null;
  if (passoAtual.value === 7) return respostas.value.tempo !== null;
  return false;
});

function selecionarUnica(campo: 'sono' | 'energia' | 'estresse', valor: number) {
  respostas.value[campo] = valor;
  setTimeout(() => {
    avancarPasso();
  }, 300);
}

function avancarPasso() {
  if (passoAtual.value < totalPassos) {
    passoAtual.value++;
  } else {
    concluirCheckin();
  }
}

function voltar() {
  if (passoAtual.value > 1) {
    passoAtual.value--;
  } else {
    router.back();
  }
}

function pular() {
  router.push('/tabs/praticar');
}

function concluirCheckin() {
  // Salvar checkin
  router.push('/tabs/hoje');
}
</script>

<style scoped>
.tela {
  --background: #fff;
}

.fundo {
  position: fixed;
  inset: 0;
  background: #fff;
  z-index: 0;
}

.conteudo {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.lateral {
  display: none;
}

.painel-questoes {
  flex: 1;
  padding: calc(24px + var(--ion-safe-area-top, 0px)) 24px
    calc(24px + var(--ion-safe-area-bottom, 0px));
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%),
    url('@/assets/backgroundLogin.jpg') bottom left / cover no-repeat;
}

@media (min-width: 768px) {
  .lateral {
    display: flex;
    flex-direction: column;
    width: 40%;
    padding: calc(32px + var(--ion-safe-area-top, 0px)) 32px;
    background:
      linear-gradient(to right, rgba(255, 255, 255, 0.5), transparent),
      url('@/assets/backgroundLogin.jpg') center / cover no-repeat;
  }
  .painel-questoes {
    width: 60%;
    flex: none;
    background: #f8fbfd;
    padding: calc(48px + var(--ion-safe-area-top, 0px)) 48px;
    border-radius: 40px 0 0 40px;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
  }
  .voltar-mobile {
    display: none !important;
  }
}

.voltar,
.voltar-mobile {
  background: none;
  border: 0;
  padding: 8px 0;
  font-size: 1.5rem;
  color: #14304f;
  cursor: pointer;
  align-self: flex-start;
}

.marca {
  margin-top: 30px;
}
.logo {
  width: 100px;
}
.assinatura {
  font-size: 0.7rem;
  color: #14304f;
  margin-top: 5px;
}

.frase {
  margin-top: 80px;
  font-family: Georgia, serif;
  color: #14304f;
  font-size: 2rem;
  line-height: 1.2;
}

.cabecalho-questoes {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progresso {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.bolinha {
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background: #d8e1ea;
  transition: all 0.3s ease;
}

.bolinha.ativa {
  background: #14304f;
  width: 10px;
}

.pular {
  background: none;
  border: 0;
  color: #4d627a;
  font-size: 0.9rem;
}

.passo-texto {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #7a8da0;
  text-align: center;
  margin-top: 20px;
}

.titulo {
  font-family: Georgia, serif;
  font-size: 2rem;
  color: #14304f;
  text-align: center;
  margin: 10px 0 20px;
}

.subtitulo {
  text-align: center;
  color: #4d627a;
  margin-bottom: 20px;
}

.pergunta-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.opcoes {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}
.opcao-unica {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  border: 1px solid #d8e1ea;
  background: #fff;
  font-size: 1.2rem;
  color: #14304f;
  cursor: pointer;
  transition: 0.2s;
}
.opcao-unica.selecionada {
  background: #14304f;
  color: #fff;
  border-color: #14304f;
}

.opcoes-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}
.opcao-check {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: 0.2s;
}
.opcao-check:hover {
  border-color: #cbd5e1;
}
.opcao-check.selecionada {
  border-color: #14304f;
  background: #f8fafc;
}
.texto-opcao {
  color: #14304f;
  font-size: 1rem;
}
.opcao-check input {
  display: none;
}
.checkbox-falso {
  width: 24px;
  height: 24px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.radio-falso {
  border-radius: 12px;
}
.opcao-check.selecionada .checkbox-falso {
  background: #14304f;
  border-color: #14304f;
}
.opcao-check.selecionada .checkbox-falso::after {
  content: '';
  width: 10px;
  height: 10px;
  background: #fff;
  border-radius: 5px;
}

.rodape-questoes {
  margin-top: auto;
  padding-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.botao-continuar {
  background: #14304f;
  color: #fff;
  width: 100%;
  max-width: 300px;
  padding: 16px;
  border-radius: 30px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  margin-bottom: 30px;
}

.lema-rodape {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 15px;
  width: 100%;
  max-width: 250px;
}
.lema-rodape .linha {
  height: 1px;
  background: #d8e1ea;
}
.lotus {
  width: 30px;
}
.texto-lema {
  text-align: center;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  color: #7a8da0;
  margin-top: 10px;
  line-height: 1.4;
}
</style>
