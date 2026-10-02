<template>
  <section class="pagina">
    <header class="topo">
      <div>
        <h1 class="titulo">{{ ehNova ? 'Nova trilha' : ficha.nome || 'Trilha' }}</h1>
        <p v-if="!ehNova" class="situacao">{{ id }}</p>
      </div>
      <router-link to="/trilhas" class="voltar">Voltar</router-link>
    </header>

    <p v-if="carregando" class="recado">Carregando...</p>

    <template v-else>
      <form class="formulario" @submit.prevent="salvar">
        <fieldset class="bloco">
          <legend>A trilha</legend>

          <label class="campo largo">
            <span>Nome</span>
            <input v-model="ficha.nome" type="text" required maxlength="80" />
            <small>É o nome que o aluno vê. Ex.: "Mobilidade da coluna em 8 aulas".</small>
          </label>

          <label class="campo largo">
            <span>Descrição</span>
            <textarea v-model="ficha.descricao" rows="2" maxlength="400"></textarea>
          </label>

          <label class="campo">
            <span>Número de aulas</span>
            <input v-model.number="ficha.totalAulas" type="number" min="2" max="60" required />
            <small>Quantas aulas a trilha terá quando estiver pronta.</small>
          </label>

          <label class="campo">
            <span>Pré-requisito</span>
            <select v-model="ficha.preRequisitoId">
              <option value="">Nenhum — abre sozinha</option>
              <option v-for="opcao in preRequisitos" :key="opcao.id" :value="opcao.id">
                {{ opcao.nome }}
              </option>
            </select>
            <small>Trilha que convém ter sido feita antes desta.</small>
          </label>
        </fieldset>

        <p v-if="erro" class="erro">{{ erro }}</p>
        <p v-if="recado" class="feito">{{ recado }}</p>

        <div class="acoes">
          <button type="submit" class="botao" :disabled="salvando">
            {{ salvando ? 'Salvando...' : ehNova ? 'Criar trilha' : 'Salvar' }}
          </button>
          <button v-if="!ehNova" type="button" class="botao apagar" @click="apagar">
            Apagar trilha
          </button>
        </div>
      </form>

      <!-- As aulas só existem depois que a trilha existe. -->
      <section v-if="!ehNova" class="aulas">
        <header class="cabecalho-aulas">
          <h2 class="subtitulo">Aulas, na ordem</h2>
          <span class="contagem" :class="{ completa: aulas.length >= ficha.totalAulas }">
            {{ aulas.length }} de {{ ficha.totalAulas }}
          </span>
        </header>

        <p class="explicacao">
          A ordem é esta lista, de cima para baixo. Quem já fez a aula 2 recebe a 3 com preferência
          na recomendação do dia — por isso ela não tem buraco: a numeração é refeita a cada
          mudança.
        </p>

        <p v-for="problema in problemas" :key="problema" class="pendencia">{{ problema }}</p>

        <ol v-if="aulas.length > 0" class="lista">
          <li v-for="(aula, indice) in aulas" :key="aula.id" class="aula">
            <span class="posicao">{{ indice + 1 }}</span>
            <span class="sobre">
              <strong>{{ aula.titulo }}</strong>
              <span class="detalhe">{{ aula.modalidade }} · {{ aula.duracaoMin }} min</span>
            </span>
            <span class="marca" :class="aula.status.toLowerCase()">
              {{ NOME_DO_STATUS[aula.status] }}
            </span>
            <span class="mover">
              <button type="button" :disabled="indice === 0" title="Subir" @click="subir(indice)">
                ↑
              </button>
              <button
                type="button"
                :disabled="indice === aulas.length - 1"
                title="Descer"
                @click="descer(indice)"
              >
                ↓
              </button>
              <button type="button" title="Tirar da trilha" @click="tirar(indice)">×</button>
            </span>
          </li>
        </ol>
        <p v-else class="vazio">Nenhuma aula nesta trilha ainda.</p>

        <div class="acrescentar">
          <label class="campo largo">
            <span>Acrescentar prática</span>
            <select v-model="escolhida">
              <option value="">Escolha uma prática avulsa...</option>
              <option v-for="livre in disponiveis" :key="livre.id" :value="livre.id">
                {{ livre.titulo }} ({{ livre.duracaoMin }} min)
              </option>
            </select>
            <small>
              Só aparecem práticas que não estão em nenhuma trilha. Para tirar uma de outra trilha,
              abra aquela trilha primeiro.
            </small>
          </label>
          <button type="button" class="botao" :disabled="!escolhida" @click="acrescentar">
            Acrescentar
          </button>
        </div>

        <p v-if="erroDaOrdem" class="erro">{{ erroDaOrdem }}</p>
        <p v-if="ordemMudou" class="aviso-ordem">
          A ordem mudou e ainda não foi salva.
          <button type="button" class="botao" :disabled="salvandoOrdem" @click="salvarOrdem">
            {{ salvandoOrdem ? 'Salvando...' : 'Salvar ordem' }}
          </button>
        </p>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NOME_DO_STATUS } from '../servicos/conteudos.js';
import {
  atualizarTrilha,
  buscarTrilha,
  criarTrilha,
  definirOrdem,
  fichaDeTrilhaEmBranco,
  listarPreRequisitos,
  removerTrilha,
  type AulaDaTrilha,
  type FichaDaTrilha,
  type TrilhaResumida,
} from '../servicos/trilhas.js';

const rota = useRoute();
const router = useRouter();

const ehNova = computed(() => rota.path.endsWith('/nova'));
const id = computed(() => String(rota.params.id ?? ''));

const ficha = ref<FichaDaTrilha>(fichaDeTrilhaEmBranco());
const aulas = ref<AulaDaTrilha[]>([]);
const disponiveis = ref<AulaDaTrilha[]>([]);
const preRequisitos = ref<TrilhaResumida[]>([]);
const problemas = ref<string[]>([]);

const carregando = ref(false);
const salvando = ref(false);
const salvandoOrdem = ref(false);
const erro = ref('');
const erroDaOrdem = ref('');
const recado = ref('');
const escolhida = ref('');

/** A ordem salva no servidor, para saber se a tela se afastou dela. */
const ordemSalva = ref<string[]>([]);
const ordemMudou = computed(
  () => aulas.value.map((aula) => aula.id).join(',') !== ordemSalva.value.join(','),
);

onMounted(async () => {
  preRequisitos.value = await listarPreRequisitos(ehNova.value ? undefined : id.value);
  if (ehNova.value) return;

  carregando.value = true;
  try {
    aplicar(await buscarTrilha(id.value));
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível abrir a trilha';
  } finally {
    carregando.value = false;
  }
});

function aplicar(trilha: Awaited<ReturnType<typeof buscarTrilha>>) {
  ficha.value = {
    nome: trilha.nome,
    descricao: trilha.descricao ?? '',
    totalAulas: trilha.totalAulas,
    preRequisitoId: trilha.preRequisitoId ?? '',
  };
  aulas.value = trilha.aulas;
  disponiveis.value = trilha.disponiveis;
  problemas.value = trilha.problemas;
  ordemSalva.value = trilha.aulas.map((aula) => aula.id);
}

function paraEnvio(): FichaDaTrilha {
  const copia: FichaDaTrilha = { ...ficha.value };
  if (!copia.descricao) delete copia.descricao;
  if (!copia.preRequisitoId) delete copia.preRequisitoId;
  return copia;
}

async function salvar() {
  salvando.value = true;
  erro.value = '';
  recado.value = '';
  try {
    if (ehNova.value) {
      const criada = await criarTrilha(paraEnvio());
      await router.replace(`/trilhas/${criada.id}`);
      aplicar(await buscarTrilha(criada.id));
      recado.value = 'Trilha criada. Agora acrescente as aulas.';
    } else {
      await atualizarTrilha(id.value, paraEnvio());
      recado.value = 'Alterações salvas.';
    }
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível salvar';
  } finally {
    salvando.value = false;
  }
}

async function apagar() {
  const certeza = window.confirm(
    'Apagar a trilha? As práticas continuam no catálogo, apenas deixam de fazer parte dela.',
  );
  if (!certeza) return;

  try {
    await removerTrilha(id.value);
    await router.replace('/trilhas');
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível apagar';
  }
}

function mover(de: number, para: number) {
  const lista = [...aulas.value];
  const [aula] = lista.splice(de, 1);
  if (!aula) return;

  lista.splice(para, 0, aula);
  aulas.value = lista;
}

function subir(indice: number) {
  mover(indice, indice - 1);
}

function descer(indice: number) {
  mover(indice, indice + 1);
}

function tirar(indice: number) {
  const [saiu] = aulas.value.splice(indice, 1);
  if (saiu) disponiveis.value = [...disponiveis.value, saiu];
}

function acrescentar() {
  const aula = disponiveis.value.find((item) => item.id === escolhida.value);
  if (!aula) return;

  aulas.value = [...aulas.value, aula];
  disponiveis.value = disponiveis.value.filter((item) => item.id !== aula.id);
  escolhida.value = '';
}

async function salvarOrdem() {
  salvandoOrdem.value = true;
  erroDaOrdem.value = '';
  try {
    aplicar(await definirOrdem(id.value, aulas.value.map((aula) => aula.id)));
    recado.value = 'Ordem salva.';
  } catch (problema) {
    erroDaOrdem.value =
      problema instanceof Error ? problema.message : 'Não foi possível salvar a ordem';
  } finally {
    salvandoOrdem.value = false;
  }
}
</script>

<style scoped>
.pagina {
  max-width: 54rem;
}

.topo {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.titulo {
  margin: 0 0 4px;
  font-size: 1.5rem;
  color: var(--azul-profundo);
}

.situacao {
  margin: 0;
  font-size: 0.82rem;
  color: var(--texto-suave);
}

.voltar {
  flex: none;
  color: var(--azul);
  font-size: 0.88rem;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.bloco {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 18px;
  padding: 18px 20px 22px;
  background: #fff;
  border: 1px solid var(--borda);
  border-radius: 12px;
}

legend {
  padding: 0 6px;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--texto-suave);
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.85rem;
  color: var(--texto-medio);
}

.campo.largo {
  grid-column: 1 / -1;
}

.campo input,
.campo select,
.campo textarea {
  padding: 9px 11px;
  border: 1px solid var(--borda-forte);
  border-radius: 8px;
  font: inherit;
  color: var(--texto);
  background: #fff;
}

.campo small {
  font-size: 0.76rem;
  line-height: 1.45;
  color: var(--texto-suave);
}

.acoes {
  display: flex;
  gap: 10px;
}

.botao {
  padding: 10px 16px;
  background: var(--azul);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}

.botao[disabled] {
  opacity: 0.55;
  cursor: default;
}

.botao.apagar {
  background: none;
  color: #a33;
  font-weight: 500;
}

.erro {
  margin: 0;
  font-size: 0.85rem;
  color: #a33;
}

.feito {
  margin: 0;
  font-size: 0.85rem;
  color: var(--verde);
}

.aulas {
  margin-top: 28px;
  padding: 18px 20px 22px;
  background: #fff;
  border: 1px solid var(--borda);
  border-radius: 12px;
}

.cabecalho-aulas {
  display: flex;
  align-items: center;
  gap: 12px;
}

.subtitulo {
  margin: 0;
  font-size: 1.05rem;
  color: var(--azul-profundo);
}

.contagem {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  background: #fdf1e0;
  color: #8a5a20;
}

.contagem.completa {
  background: #e6efea;
  color: var(--verde);
}

.explicacao {
  margin: 8px 0 14px;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--texto-suave);
}

.pendencia {
  margin: 0 0 8px;
  font-size: 0.82rem;
  color: #8a5a20;
}

.lista {
  margin: 0 0 16px;
  padding: 0;
  list-style: none;
}

.aula {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--borda);
}

.aula:last-child {
  border-bottom: 0;
}

.posicao {
  flex: none;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--azul-profundo);
  color: #fff;
  font-size: 0.78rem;
}

.sobre {
  flex: 1;
  min-width: 0;
}

.sobre strong {
  display: block;
  font-size: 0.9rem;
  color: var(--texto);
}

.detalhe {
  font-size: 0.78rem;
  color: var(--texto-suave);
}

.marca {
  flex: none;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.74rem;
}

.marca.rascunho {
  background: #eef1f4;
  color: var(--texto-medio);
}

.marca.em_revisao {
  background: #fdf1e0;
  color: #8a5a20;
}

.marca.aprovado {
  background: #e6efea;
  color: var(--verde);
}

.marca.devolvido {
  background: #fbe9e9;
  color: #a33;
}

.mover {
  flex: none;
  display: flex;
  gap: 4px;
}

.mover button {
  width: 28px;
  height: 28px;
  background: #f7fafb;
  border: 1px solid var(--borda-forte);
  border-radius: 6px;
  color: var(--texto-medio);
  cursor: pointer;
}

.mover button[disabled] {
  opacity: 0.35;
  cursor: default;
}

.vazio {
  margin: 0 0 16px;
  font-size: 0.85rem;
  color: var(--texto-suave);
}

.acrescentar {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--borda);
}

.acrescentar .campo {
  flex: 1;
}

.acrescentar .botao {
  margin-top: 22px;
}

.aviso-ordem {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 0 0;
  padding: 12px 14px;
  background: #fdf1e0;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #8a5a20;
}

@media (max-width: 720px) {
  .bloco {
    grid-template-columns: 1fr;
  }
}
</style>
