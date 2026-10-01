<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="conteudo">
        <img :src="logo" alt="LIFE" class="logo" />

        <!-- Com token na URL: a pessoa veio do e-mail e escolhe a senha nova. -->
        <template v-if="token">
          <h1 class="titulo">Escolha uma senha nova</h1>

          <template v-if="!pronto">
            <label class="campo">
              <span class="rotulo">Nova senha</span>
              <input
                v-model="senha"
                type="password"
                autocomplete="new-password"
                placeholder="Pelo menos 8 caracteres"
              />
            </label>

            <p v-if="erro" class="erro">{{ erro }}</p>

            <button type="button" class="botao" :disabled="enviando" @click="salvarSenha">
              {{ enviando ? 'Salvando...' : 'Salvar senha' }}
            </button>
          </template>

          <template v-else>
            <p class="texto">
              Senha trocada. Por segurança, as sessões abertas em outros aparelhos foram encerradas.
            </p>
            <button type="button" class="botao" @click="irParaLogin">Entrar</button>
          </template>
        </template>

        <!-- Sem token: a pessoa está pedindo o link. -->
        <template v-else>
          <h1 class="titulo">Esqueceu a senha?</h1>
          <p class="texto">Diga o seu e-mail que enviamos um link para você escolher outra.</p>

          <template v-if="!pedido">
            <label class="campo">
              <span class="rotulo">Seu e-mail</span>
              <input
                v-model="email"
                type="email"
                inputmode="email"
                autocomplete="email"
                placeholder="voce@email.com"
              />
            </label>

            <p v-if="erro" class="erro">{{ erro }}</p>

            <button type="button" class="botao" :disabled="enviando" @click="pedirLink">
              {{ enviando ? 'Enviando...' : 'Enviar link' }}
            </button>
          </template>

          <p v-else class="texto">
            Se houver uma conta com esse e-mail, o link está a caminho. Ele vale por 1 hora.
          </p>

          <button type="button" class="link" @click="irParaLogin">Voltar para o login</button>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import logo from '@/assets/logo.png';
import { ErroDaApi } from '@/servicos/api';
import { pedirRedefinicaoDeSenha, redefinirSenha } from '@/servicos/conta';

const rota = useRoute();
const router = useRouter();

const token = String(rota.query.token ?? '');
const email = ref('');
const senha = ref('');
const enviando = ref(false);
const pedido = ref(false);
const pronto = ref(false);
const erro = ref('');

async function pedirLink() {
  if (!email.value) {
    erro.value = 'Escreva o seu e-mail.';
    return;
  }

  enviando.value = true;
  erro.value = '';
  try {
    await pedirRedefinicaoDeSenha(email.value);
    // A resposta é a mesma para e-mail que existe e que não existe: quem
    // tenta adivinhar não descobre quem tem conta aqui.
    pedido.value = true;
  } catch (problema) {
    erro.value = problema instanceof ErroDaApi ? problema.message : 'Não foi possível enviar agora';
  } finally {
    enviando.value = false;
  }
}

async function salvarSenha() {
  if (senha.value.length < 8) {
    erro.value = 'A senha precisa de pelo menos 8 caracteres.';
    return;
  }

  enviando.value = true;
  erro.value = '';
  try {
    await redefinirSenha(token, senha.value);
    pronto.value = true;
  } catch (problema) {
    erro.value = problema instanceof ErroDaApi ? problema.message : 'Não foi possível trocar agora';
  } finally {
    enviando.value = false;
  }
}

function irParaLogin() {
  router.replace('/login');
}
</script>

<style scoped>
.tela {
  --background: var(--life-fundo);
}

.conteudo {
  box-sizing: border-box;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: calc(24px + var(--ion-safe-area-top, 0px)) 22px
    calc(24px + var(--ion-safe-area-bottom, 0px));
  text-align: center;
}

.logo {
  width: 76px;
  height: auto;
  margin-bottom: 6px;
}

.titulo {
  margin: 0;
  font-family: var(--life-serif);
  font-size: 1.45rem;
  font-weight: 600;
  color: var(--life-texto);
}

.texto {
  margin: 0;
  max-width: 24rem;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--life-texto-medio);
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  max-width: 22rem;
  text-align: left;
}

.rotulo {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--life-texto-suave);
}

.campo input {
  padding: 11px 13px;
  font-size: 0.9rem;
  color: var(--life-texto);
  background: #fff;
  border: 1px solid #d8e1ea;
  border-radius: 13px;
}

.botao {
  width: 100%;
  max-width: 22rem;
  margin-top: 6px;
  padding: 13px;
  background: var(--life-azul);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  border: 0;
  border-radius: 999px;
}

.botao[disabled] {
  opacity: 0.6;
}

.erro {
  margin: 0;
  font-size: 0.82rem;
  color: #a33;
}

.link {
  padding: 6px;
  background: none;
  border: 0;
  color: var(--life-azul-claro);
  font-size: 0.85rem;
  text-decoration: underline;
}
</style>
