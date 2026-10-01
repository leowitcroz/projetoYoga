<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="conteudo">
        <img :src="logo" alt="LIFE" class="logo" />

        <template v-if="estado === 'verificando'">
          <h1 class="titulo">Confirmando o seu e-mail...</h1>
        </template>

        <template v-else-if="estado === 'pronto'">
          <h1 class="titulo">E-mail confirmado!</h1>
          <p class="texto">Agora é só entrar e começar a praticar.</p>
          <button type="button" class="botao" @click="irParaLogin">Entrar</button>
        </template>

        <template v-else-if="estado === 'falhou'">
          <h1 class="titulo">Este link não vale mais</h1>
          <p class="texto">{{ erro }}</p>
          <p class="texto">Informe o seu e-mail que mandamos um link novo.</p>

          <label class="campo">
            <span class="rotulo">Seu e-mail</span>
            <input v-model="email" type="email" inputmode="email" placeholder="voce@email.com" />
          </label>

          <button type="button" class="botao" :disabled="enviando" @click="reenviar">
            {{ enviando ? 'Enviando...' : 'Enviar novo link' }}
          </button>
          <p v-if="reenviado" class="aviso">{{ reenviado }}</p>
        </template>

        <!-- Sem token na URL: a pessoa acabou de criar a conta. -->
        <template v-else>
          <h1 class="titulo">Confirme o seu e-mail</h1>
          <p class="texto">
            Enviamos uma mensagem para <strong>{{ email || 'o seu e-mail' }}</strong
            >. Abra o link de lá para confirmar a conta — ele vale por 24 horas.
          </p>
          <p class="texto discreto">Não chegou? Veja a caixa de spam, ou peça outro abaixo.</p>

          <button type="button" class="botao secundario" :disabled="enviando" @click="reenviar">
            {{ enviando ? 'Enviando...' : 'Enviar de novo' }}
          </button>
          <p v-if="reenviado" class="aviso">{{ reenviado }}</p>

          <button type="button" class="link" @click="irParaLogin">
            Já confirmei, quero entrar
          </button>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import logo from '@/assets/logo.png';
import { ErroDaApi } from '@/servicos/api';
import { reenviarVerificacao, verificarEmail } from '@/servicos/conta';

const rota = useRoute();
const router = useRouter();

type Estado = 'aguardando' | 'verificando' | 'pronto' | 'falhou';
const estado = ref<Estado>('aguardando');
const email = ref(String(rota.query.email ?? ''));
const erro = ref('');
const enviando = ref(false);
const reenviado = ref('');

onMounted(async () => {
  const token = rota.query.token;
  if (typeof token !== 'string' || !token) return;

  estado.value = 'verificando';
  try {
    await verificarEmail(token);
    estado.value = 'pronto';
  } catch (problema) {
    erro.value =
      problema instanceof ErroDaApi ? problema.message : 'Não foi possível confirmar agora';
    estado.value = 'falhou';
  }
});

async function reenviar() {
  if (!email.value) {
    reenviado.value = 'Escreva o seu e-mail para receber o link.';
    return;
  }

  enviando.value = true;
  reenviado.value = '';
  try {
    await reenviarVerificacao(email.value);
    // A resposta é a mesma para e-mail que existe e que não existe.
    reenviado.value = 'Se houver uma conta com esse e-mail, o link está a caminho.';
  } catch {
    reenviado.value = 'Não foi possível enviar agora. Tente de novo em instantes.';
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

.texto.discreto {
  font-size: 0.84rem;
  color: var(--life-texto-suave);
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

.botao.secundario {
  background: #fff;
  color: var(--life-azul);
  border: 1px solid var(--life-azul);
}

.botao[disabled] {
  opacity: 0.6;
}

.aviso {
  margin: 0;
  max-width: 22rem;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--life-texto-medio);
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
