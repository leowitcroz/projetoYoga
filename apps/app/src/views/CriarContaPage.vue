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

          <h1 class="titulo">Seu perfil está pronto!</h1>
          <p class="subtitulo">Crie sua conta para guardar suas respostas e começar a praticar.</p>

          <form class="formulario" novalidate @submit.prevent="criar">
            <label class="campo">
              <span class="rotulo">Nome completo</span>
              <input
                v-model="nome"
                type="text"
                autocomplete="name"
                placeholder="Como você se chama"
                :class="{ invalido: erros.nome }"
              />
              <span v-if="erros.nome" class="erro">{{ erros.nome }}</span>
            </label>

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
              <span class="rotulo">Telefone</span>
              <input
                :value="telefone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                placeholder="(11) 91234-5678"
                :class="{ invalido: erros.telefone }"
                @input="digitarTelefone"
              />
              <span v-if="erros.telefone" class="erro">{{ erros.telefone }}</span>
            </label>

            <label class="campo">
              <span class="rotulo">Senha</span>
              <span class="senha">
                <input
                  v-model="senha"
                  :type="mostrarSenha ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Pelo menos 8 caracteres"
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

            <label class="aceite">
              <input v-model="aceite" type="checkbox" class="caixa-real" />
              <span class="caixa" aria-hidden="true">
                <ion-icon :icon="checkmarkOutline" />
              </span>
              <span class="aceite-texto">
                Li e aceito a
                <a href="#" @click.prevent>política de privacidade</a>.
              </span>
            </label>
            <span v-if="erros.aceite" class="erro erro-aceite">{{ erros.aceite }}</span>

            <button type="submit" class="botao">Criar conta</button>
          </form>

          <p class="entrar">
            Já tem uma conta?
            <button type="button" class="link" @click="irParaLogin">Entrar</button>
          </p>

          <p class="aviso">Protótipo visual. A conta de verdade é criada na Fase 2.</p>

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
import { checkmarkOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import logo from '@/assets/logo.png';
import lotus from '@/assets/lotus.png';
import { formatarTelefone, temErro, validarCadastro, type ErrosCadastro } from '@/utils/validacao';

const router = useRouter();
const nome = ref('');
const email = ref('');
const telefone = ref('');
const senha = ref('');
const aceite = ref(false);
const mostrarSenha = ref(false);
const erros = ref<ErrosCadastro>({});

function digitarTelefone(evento: Event) {
  telefone.value = formatarTelefone((evento.target as HTMLInputElement).value);
}

function criar() {
  erros.value = validarCadastro(nome.value, email.value, telefone.value, senha.value, aceite.value);
  if (temErro(erros.value)) return;

  // Protótipo: a criação de conta de verdade (AUTH-01) entra na Fase 2.
  router.push('/checkin');
}

function irParaLogin() {
  router.push('/login');
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
  padding: calc(14px + var(--ion-safe-area-top, 0px)) 14px
    calc(14px + var(--ion-safe-area-bottom, 0px));
}

.painel {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: min(23.5rem, 100%);
  overflow-wrap: anywhere;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(20, 48, 79, 0.08);
  border-radius: 26px;
  padding: 20px 20px 16px;
  box-shadow: 0 18px 50px rgba(20, 48, 79, 0.16);
}

.marca {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.logo {
  width: 72px;
  height: auto;
}

.assinatura {
  margin: 0;
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  color: #4d627a;
}

.titulo {
  margin: 12px 0 3px;
  font-family: var(--life-serif);
  font-size: 1.35rem;
  font-weight: 500;
  line-height: 1.15;
  color: #14304f;
  text-align: center;
}

.subtitulo {
  margin: 0 0 14px;
  font-size: 0.78rem;
  color: #4d627a;
  text-align: center;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rotulo {
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #4d627a;
}

input[type='text'],
input[type='email'],
input[type='tel'],
input[type='password'] {
  width: 100%;
  box-sizing: border-box;
  font-size: 0.9rem;
  color: #14304f;
  background: #fff;
  border: 1px solid #d8e1ea;
  border-radius: 13px;
  padding: 11px 13px;
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

.erro-aceite {
  margin-top: -6px;
}

.aceite {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 4px;
  cursor: pointer;
}

.caixa-real {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.caixa {
  flex: none;
  width: 19px;
  height: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #c3d2de;
  border-radius: 6px;
  background: #fff;
  color: transparent;
  font-size: 0.9rem;
}

.aceite:has(.caixa-real:checked) .caixa {
  background: #14304f;
  border-color: #14304f;
  color: #fff;
}

.caixa-real:focus-visible + .caixa {
  outline: 2px solid #2f7ea6;
  outline-offset: 2px;
}

.aceite-texto {
  font-size: 0.75rem;
  line-height: 1.4;
  color: #4d627a;
}

.aceite-texto a {
  color: #2f7ea6;
  font-weight: 600;
}

.botao {
  margin-top: 6px;
  width: 100%;
  padding: 13px;
  background: #14304f;
  color: #fff;
  font-size: 0.98rem;
  font-weight: 600;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.botao:active {
  background: #0f2540;
}

.entrar {
  margin: 12px 0 0;
  text-align: center;
  font-size: 0.82rem;
  color: #4d627a;
}

.link {
  padding: 0;
  background: none;
  border: 0;
  color: #2f7ea6;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.aviso {
  margin: 7px 0 0;
  text-align: center;
  font-size: 0.62rem;
  color: #7a8da0;
}

.rodape {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.linha {
  height: 1px;
  background: rgba(20, 48, 79, 0.18);
}

.lotus {
  width: 22px;
  height: auto;
}

.lema {
  grid-column: 1 / -1;
  margin: 6px 0 0;
  text-align: center;
  font-size: 0.54rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #4d627a;
}
</style>
