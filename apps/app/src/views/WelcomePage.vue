<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="fundo" aria-hidden="true"></div>
      <div class="veu-topo" aria-hidden="true"></div>
      <div class="veu-base" aria-hidden="true"></div>

      <div class="conteudo">
        <header class="marca">
          <img :src="logo" alt="LIFE" class="logo" />
          <p class="assinatura">Yoga · Ayurveda · Ciência · Filosofia</p>
          <span class="fio" aria-hidden="true"></span>
          <h1 class="chamada">Mais que um app.<br />Uma jornada de vida.</h1>
        </header>

        <div class="acoes">
          <button type="button" class="botao" @click="comecar">
            Começar
            <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
          </button>

          <p class="entrar">
            Já tem uma conta?
            <button type="button" class="link" @click="entrar">Entrar</button>
          </p>

          <footer class="rodape">
            <span class="linha"></span>
            <img :src="lotus" alt="" class="lotus" />
            <span class="linha"></span>
            <p class="lema">Prática · Conhecimento · Equilíbrio<br />para a vida</p>
          </footer>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { arrowForwardOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import logo from '@/assets/logo.png';
import lotus from '@/assets/lotus.png';

const router = useRouter();

// A tela de cadastro ainda não existe (ver docs/fluxo-bloco-1.md).
// Por enquanto "Começar" leva ao login, que tem o link "Criar conta".
function comecar() {
  router.push('/login');
}

function entrar() {
  router.push('/login');
}
</script>

<style scoped>
.tela {
  --background: #dfe9f1;
}

.fundo {
  position: fixed;
  inset: 0;
  background: url('@/assets/backgroundLogin.jpg') center / cover no-repeat;
}

.veu-topo {
  position: fixed;
  inset: 0 0 auto 0;
  height: 46%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0) 100%);
}

.veu-base {
  position: fixed;
  inset: auto 0 0 0;
  height: 46%;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0) 100%);
}

.conteudo {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  padding: calc(28px + var(--ion-safe-area-top, 0px)) 24px
    calc(26px + var(--ion-safe-area-bottom, 0px));
  text-align: center;
}

.marca {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: min(56%, 210px);
  height: auto;
}

.assinatura {
  margin: 10px 0 0;
  font-size: 0.95rem;
  color: #1c4066;
}

.fio {
  display: block;
  width: 56px;
  height: 1px;
  margin: 16px 0;
  background: rgba(20, 48, 79, 0.35);
}

.chamada {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.5rem, 6.2vw, 1.95rem);
  font-weight: 500;
  line-height: 1.32;
  color: #14304f;
}

.acoes {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.botao {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 100%;
  max-width: 22rem;
  padding: 17px 24px;
  font-size: 1.12rem;
  color: #fff;
  background: rgba(47, 110, 148, 0.72);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  box-shadow: 0 10px 30px rgba(20, 48, 79, 0.22);
  cursor: pointer;
}

.botao:active {
  background: rgba(35, 90, 125, 0.85);
}

.botao ion-icon {
  font-size: 1.1rem;
}

.entrar {
  margin: 16px 0 0;
  font-size: 0.98rem;
  color: #1c4066;
}

.link {
  padding: 0;
  background: none;
  border: 0;
  font-size: inherit;
  color: #14304f;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.rodape {
  margin-top: 26px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.linha {
  height: 1px;
  background: rgba(20, 48, 79, 0.25);
}

.lotus {
  width: 30px;
  height: auto;
}

.lema {
  grid-column: 1 / -1;
  margin: 10px 0 0;
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  line-height: 1.7;
  color: #2a4b6e;
}
</style>
