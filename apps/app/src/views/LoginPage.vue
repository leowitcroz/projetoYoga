<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="fundo" aria-hidden="true"></div>

      <div class="conteudo">
        <div class="painel">
          <header class="marca">
            <img :src="logo" alt="LIFE" class="logo" />
            <p class="assinatura">Yoga · Ayurveda · Ciência · Filosofia</p>
          </header>

          <h1 class="titulo">Bem-vindo de volta.</h1>
          <p class="subtitulo">Entre para continuar sua jornada.</p>

          <form class="formulario" novalidate @submit.prevent="entrar">
            <label class="campo">
              <span class="rotulo">E-mail</span>
              <input
                v-model="email"
                type="email"
                inputmode="email"
                autocomplete="email"
                placeholder="voce@email.com"
                :class="{ invalido: erros.email }"
              />
              <span v-if="erros.email" class="erro">{{ erros.email }}</span>
            </label>

            <label class="campo">
              <span class="rotulo">Senha</span>
              <span class="senha">
                <input
                  v-model="senha"
                  :type="mostrarSenha ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Sua senha"
                  :class="{ invalido: erros.senha }"
                />
                <button
                  type="button"
                  class="olho"
                  :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
                  @click="mostrarSenha = !mostrarSenha"
                >
                  <ion-icon :icon="mostrarSenha ? eyeOffOutline : eyeOutline" />
                </button>
              </span>
              <span v-if="erros.senha" class="erro">{{ erros.senha }}</span>
            </label>

            <button type="button" class="link esqueci">Esqueci minha senha</button>

            <button type="submit" class="botao">Entrar</button>
          </form>

          <p class="criar">
            Ainda não tem conta?
            <button type="button" class="link">Criar conta</button>
          </p>

          <p class="aviso">Protótipo visual. O login de verdade é ligado à API na Fase 2.</p>

          <footer class="rodape">
            <span class="linha"></span>
            <img :src="lotus" alt="" class="lotus" />
            <span class="linha"></span>
            <p class="lema">Prática · Conhecimento · Equilíbrio para a vida</p>
          </footer>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import logo from '@/assets/logo.png';
import lotus from '@/assets/lotus.png';
import { temErro, validarLogin, type ErrosLogin } from '@/utils/validacao';

const router = useRouter();
const email = ref('');
const senha = ref('');
const mostrarSenha = ref(false);
const erros = ref<ErrosLogin>({});

function entrar() {
  erros.value = validarLogin(email.value, senha.value);
  if (temErro(erros.value)) return;

  // Protótipo: a autenticação de verdade (AUTH-03) entra na Fase 2.
  router.push('/tabs/hoje');
}
</script>

<style scoped>
.tela {
  --background: #eef3f7;
}

.fundo {
  position: fixed;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(238, 243, 247, 0.35) 0%, rgba(238, 243, 247, 0.9) 70%),
    url('@/assets/backgroundLogin.jpg') center / cover no-repeat;
}

.conteudo {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px calc(24px + var(--ion-safe-area-bottom, 0px));
}

.painel {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: min(26rem, 100%);
  overflow-wrap: anywhere;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(20, 48, 79, 0.08);
  border-radius: 28px;
  padding: 28px 24px 20px;
  box-shadow: 0 18px 50px rgba(20, 48, 79, 0.16);
}

.marca {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.logo {
  width: 104px;
  height: auto;
}

.assinatura {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: #4d627a;
}

.titulo {
  margin: 22px 0 4px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.7rem;
  font-weight: 500;
  line-height: 1.15;
  color: #14304f;
  text-align: center;
}

.subtitulo {
  margin: 0 0 22px;
  font-size: 0.95rem;
  color: #4d627a;
  text-align: center;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rotulo {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #4d627a;
}

input {
  width: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  color: #14304f;
  background: #fff;
  border: 1px solid #d8e1ea;
  border-radius: 14px;
  padding: 13px 15px;
}

input::placeholder {
  color: #9aabbd;
}

input:focus {
  outline: 2px solid #2f7ea6;
  outline-offset: 1px;
  border-color: transparent;
}

input.invalido {
  border-color: #b3261e;
}

.senha {
  position: relative;
  display: block;
}

.senha input {
  padding-right: 46px;
}

.olho {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  display: flex;
  padding: 8px;
  background: none;
  border: 0;
  color: #4d627a;
  font-size: 1.15rem;
  cursor: pointer;
}

.erro {
  font-size: 0.82rem;
  color: #b3261e;
}

.link {
  padding: 0;
  background: none;
  border: 0;
  color: #2f7ea6;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.esqueci {
  align-self: flex-end;
  margin-top: -4px;
}

.botao {
  margin-top: 6px;
  width: 100%;
  padding: 15px;
  background: #14304f;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.botao:active {
  background: #0f2540;
}

.criar {
  margin: 18px 0 0;
  text-align: center;
  font-size: 0.9rem;
  color: #4d627a;
}

.aviso {
  margin: 10px 0 0;
  text-align: center;
  font-size: 0.75rem;
  color: #7a8da0;
}

.rodape {
  margin-top: 20px;
  min-width: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
}

.linha {
  height: 1px;
  background: rgba(20, 48, 79, 0.18);
}

.lotus {
  width: 34px;
  height: auto;
}

.lema {
  grid-column: 1 / -1;
  margin: 8px 0 0;
  text-align: center;
  font-size: 0.66rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #4d627a;
}
</style>
