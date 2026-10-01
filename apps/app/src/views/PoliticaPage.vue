<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tela">
      <div class="conteudo">
        <button type="button" class="voltar" @click="voltar">
          <ion-icon :icon="chevronBackOutline" />
          Voltar
        </button>

        <h1 class="titulo">Política de privacidade</h1>
        <p class="aviso">
          Este é o resumo em linguagem simples. O texto completo está em revisão jurídica e será
          publicado aqui antes do lançamento.
        </p>

        <section class="bloco">
          <h2>O que fazemos com os seus dados</h2>
          <ul>
            <li>
              Usamos as suas respostas para montar a prática do dia e acompanhar a sua jornada.
            </li>
            <li><strong>Não vendemos</strong> os seus dados.</li>
            <li>
              O LIFE <strong>não substitui avaliação médica</strong>. As recomendações são
              automáticas, feitas por regras revisadas por professores.
            </li>
          </ul>
        </section>

        <section class="bloco destaque">
          <h2>Dados de saúde</h2>
          <ul>
            <li>
              Dor, condições de saúde, gestação e sono são <strong>dados de saúde</strong>. Só os
              usamos com o seu consentimento específico, pedido à parte desta política.
            </li>
            <li>
              Você pode pular as perguntas de saúde. Nesse caso o app recomenda de forma mais
              conservadora, e algumas personalizações ficam limitadas.
            </li>
            <li>
              <strong>Os professores não veem os seus dados de saúde.</strong> Eles veem apenas
              estatísticas agregadas e anônimas sobre os próprios conteúdos.
            </li>
            <li>Esses dados não vão para publicidade, plano de saúde, empregador ou seguradora.</li>
          </ul>
        </section>

        <section class="bloco">
          <h2>Os seus direitos</h2>
          <p>Pela LGPD, a qualquer momento você pode:</p>
          <ul>
            <li>saber quais dados temos sobre você e pedir uma cópia;</li>
            <li>corrigir o que estiver errado;</li>
            <li>retirar o consentimento de saúde e apagar esses dados;</li>
            <li>excluir a sua conta, aqui mesmo no app;</li>
            <li>pedir a revisão de uma recomendação automática;</li>
            <li>reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</li>
          </ul>
        </section>

        <section class="bloco">
          <h2>Por quanto tempo guardamos</h2>
          <p>
            Enquanto a sua conta existir. Ao excluí-la, apagamos os seus dados; fica apenas o
            registro de acesso exigido por lei, sem ligação com você, por até 6 meses.
          </p>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();

function voltar() {
  router.back();
}
</script>

<style scoped>
.tela {
  --background: var(--life-fundo);
}

.conteudo {
  box-sizing: border-box;
  min-height: 100%;
  max-width: 40rem;
  margin: 0 auto;
  padding: calc(18px + var(--ion-safe-area-top, 0px)) 20px
    calc(24px + var(--ion-safe-area-bottom, 0px));
}

.voltar {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
  padding: 0;
  background: none;
  border: 0;
  color: var(--life-azul);
  font-size: 0.88rem;
}

.titulo {
  margin: 0 0 8px;
  font-family: var(--life-serif);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--life-texto);
}

.aviso {
  margin: 0 0 20px;
  padding: 11px 13px;
  background: var(--life-atencao-fundo);
  border: 1px solid var(--life-atencao-borda);
  border-radius: 12px;
  font-size: 0.82rem;
  line-height: 1.5;
  color: #6b5a42;
}

.bloco {
  margin-bottom: 18px;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--life-borda);
  border-radius: 14px;
}

.bloco.destaque {
  background: var(--life-verde-suave);
  border-color: rgba(53, 112, 95, 0.22);
}

h2 {
  margin: 0 0 10px;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--life-texto-suave);
}

p {
  margin: 0 0 8px;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--life-texto-medio);
}

ul {
  margin: 0;
  padding-left: 18px;
}

li {
  margin-bottom: 7px;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--life-texto-medio);
}

li:last-child {
  margin-bottom: 0;
}
</style>
