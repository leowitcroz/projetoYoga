<template>
  <section class="pagina">
    <header class="topo">
      <div>
        <h1 class="titulo">{{ ehNova ? 'Nova prática' : ficha.titulo || 'Prática' }}</h1>
        <p v-if="!ehNova" class="situacao">
          Situação: <strong>{{ NOME_DO_STATUS[status] }}</strong>
          <span v-if="comentario" class="devolucao"> — {{ comentario }}</span>
        </p>
      </div>
      <router-link to="/conteudos" class="voltar">Voltar</router-link>
    </header>

    <p v-if="carregando" class="recado">Carregando...</p>

    <form v-else class="formulario" @submit.prevent="salvar">
      <!-- Identificação -->
      <fieldset class="bloco">
        <legend>A prática</legend>

        <label class="campo largo">
          <span>Título</span>
          <input v-model="ficha.titulo" type="text" required maxlength="120" />
          <small>É o nome que o aluno vê. Ex.: "Hatha suave para o fim do dia".</small>
        </label>

        <label class="campo">
          <span>Modalidade</span>
          <select v-model="ficha.modalidade">
            <option v-for="m in MODALIDADES" :key="m.valor" :value="m.valor">{{ m.nome }}</option>
          </select>
        </label>

        <label class="campo">
          <span>Área de prática</span>
          <select v-model="ficha.area">
            <option v-for="a in AREAS" :key="a.valor" :value="a.valor">{{ a.nome }}</option>
          </select>
          <small>Define qual experiência do aluno é consultada.</small>
        </label>

        <label class="campo">
          <span>Duração (minutos)</span>
          <input v-model.number="ficha.duracaoMin" type="number" min="5" max="180" required />
        </label>

        <label class="campo">
          <span>Professor</span>
          <input v-model="ficha.professor" type="text" maxlength="80" />
        </label>

        <label class="campo largo">
          <span>Vídeo no YouTube</span>
          <input v-model="ficha.videoUrl" type="text" placeholder="https://youtu.be/..." />
          <small>
            Cole o link do vídeo. Publique como <strong>não listado</strong> no YouTube: assim ele
            não aparece em buscas, mas abre para quem está no app.
          </small>
        </label>

        <label class="campo largo">
          <span>Imagem de capa (endereço)</span>
          <input v-model="ficha.capaUrl" type="url" placeholder="https://..." />
          <small>Opcional. Sem imagem, o app desenha uma capa pela modalidade.</small>
        </label>
      </fieldset>

      <!-- Exigência -->
      <fieldset class="bloco">
        <legend>O quanto exige</legend>
        <p class="explicacao">
          Duas coisas diferentes: <strong>nível técnico</strong> é o quanto a pessoa precisa saber;
          <strong>esforço físico</strong> é o quanto o corpo trabalha. Uma meditação longa pode ser
          tecnicamente avançada e fisicamente leve.
        </p>

        <label class="campo">
          <span>Nível técnico</span>
          <select v-model.number="ficha.nivelTecnico">
            <option :value="1">1 — Introdutório</option>
            <option :value="2">2 — Básico</option>
            <option :value="3">3 — Intermediário</option>
            <option :value="4">4 — Avançado</option>
            <option :value="5">5 — Especializado</option>
          </select>
        </label>

        <label class="campo">
          <span>Esforço físico</span>
          <select v-model.number="ficha.demandaFisica">
            <option :value="1">1 — Muito baixo</option>
            <option :value="2">2 — Baixo</option>
            <option :value="3">3 — Moderado</option>
            <option :value="4">4 — Alto</option>
            <option :value="5">5 — Muito alto</option>
          </select>
        </label>
      </fieldset>

      <!-- Objetivos -->
      <fieldset class="bloco">
        <legend>Para que serve</legend>
        <p class="explicacao">
          Marque de 0 a 5 o quanto esta prática ajuda em cada objetivo. Deixe em 0 o que ela não
          atende — marcar tudo alto faz a prática ser recomendada para todo mundo, e aí ela deixa de
          servir para alguém.
        </p>

        <div class="escalas">
          <label v-for="objetivo in OBJETIVOS" :key="objetivo.valor" class="escala">
            <span>{{ objetivo.nome }}</span>
            <input
              type="range"
              min="0"
              max="5"
              :value="ficha.objetivos[objetivo.valor] ?? 0"
              @input="definirObjetivo(objetivo.valor, $event)"
            />
            <output>{{ ficha.objetivos[objetivo.valor] ?? 0 }}</output>
          </label>
        </div>
      </fieldset>

      <!-- Estado do dia -->
      <fieldset class="bloco">
        <legend>O que a prática entrega</legend>
        <p class="explicacao">
          Aqui é o encontro com o check-in do aluno. Uma prática com
          <strong>relaxamento</strong> alto sobe no dia em que ele dormiu mal; uma com
          <strong>ativação</strong> alta sobe no dia em que ele está disposto.
        </p>

        <div class="escalas">
          <label v-for="dimensao in DIMENSOES" :key="dimensao.valor" class="escala">
            <span>{{ dimensao.nome }}</span>
            <input
              type="range"
              min="0"
              max="5"
              :value="ficha.caracteristicas[dimensao.valor]"
              @input="definirCaracteristica(dimensao.valor, $event)"
            />
            <output>{{ ficha.caracteristicas[dimensao.valor] }}</output>
          </label>
        </div>
      </fieldset>

      <!-- Segurança -->
      <fieldset class="bloco atencao">
        <legend>Segurança</legend>
        <p class="explicacao">
          <strong>Esta é a parte mais importante da ficha.</strong> É ela que tira a prática da
          recomendação de quem relatou dor ou tem uma condição de saúde. Na dúvida, marque o valor
          mais alto: uma prática que deixa de ser recomendada continua disponível na biblioteca, mas
          uma carga não declarada chega a quem não deveria recebê-la.
        </p>

        <div class="escalas">
          <label v-for="carga in CARGAS" :key="carga.valor" class="escala">
            <span>{{ carga.nome }}</span>
            <input
              type="range"
              min="0"
              max="3"
              :value="ficha.seguranca[carga.valor]"
              @input="definirSeguranca(carga.valor, $event)"
            />
            <output>{{ ROTULO_DA_CARGA[ficha.seguranca[carga.valor]] }}</output>
          </label>
        </div>

        <div class="marcas">
          <label class="marca">
            <input v-model="ficha.seguranca.invertida" type="checkbox" />
            <span>Tem posturas invertidas</span>
          </label>
          <label class="marca">
            <input v-model="ficha.seguranca.retencaoRespiratoria" type="checkbox" />
            <span>Tem retenção respiratória</span>
          </label>
          <label class="marca">
            <input v-model="ficha.seguranca.temVersaoAdaptada" type="checkbox" />
            <span>Existe versão adaptada aprovada</span>
          </label>
          <label class="marca">
            <input v-model="ficha.seguranca.revisadoParaGestacao" type="checkbox" />
            <span>Revisada para gestação</span>
          </label>
          <label class="marca">
            <input
              type="checkbox"
              :checked="ficha.seguranca.publicoEspecifico === 'gestacao'"
              @change="alternarPublicoGestacao"
            />
            <span>É uma aula <em>para</em> gestantes</span>
          </label>
        </div>
      </fieldset>

      <!-- Ayurveda e trilha -->
      <fieldset class="bloco">
        <legend>Ayurveda e trilha</legend>

        <div class="escalas">
          <label v-for="dosha in DOSHAS" :key="dosha" class="escala">
            <span>{{ dosha }}</span>
            <input
              type="range"
              min="0"
              max="3"
              :value="ficha.ayurveda?.[dosha.toLowerCase()] ?? 0"
              @input="definirAyurveda(dosha.toLowerCase(), $event)"
            />
            <output>{{ ficha.ayurveda?.[dosha.toLowerCase()] ?? 0 }}</output>
          </label>
        </div>

        <label class="campo largo">
          <span>Trilha</span>
          <select v-model="ficha.trilhaId">
            <option value="">Prática avulsa — fora de trilha</option>
            <option v-for="trilha in trilhas" :key="trilha.id" :value="trilha.id">
              {{ trilha.nome }}
            </option>
          </select>
          <small>
            A prática entra no fim da trilha. Para mudar a ordem, abra a trilha em
            <router-link to="/trilhas">Trilhas</router-link>.
          </small>
        </label>
      </fieldset>

      <p v-if="erro" class="erro">{{ erro }}</p>
      <p v-if="recado" class="sucesso">{{ recado }}</p>

      <div class="rodape">
        <button type="submit" class="botao" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Salvar' }}
        </button>

        <button
          v-if="!ehNova && status !== 'EM_REVISAO'"
          type="button"
          class="botao secundario"
          :disabled="salvando"
          @click="mandarParaRevisao"
        >
          Enviar para revisão
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  atualizarConteudo,
  buscarConteudo,
  criarConteudo,
  enviarParaRevisao,
  fichaEmBranco,
  NOME_DO_STATUS,
  type FichaDaPratica,
  type StatusDoConteudo,
} from '../servicos/conteudos.js';
import { listarTrilhas, type TrilhaNaLista } from '../servicos/trilhas.js';

const rota = useRoute();
const router = useRouter();

const ehNova = computed(() => rota.params.id === undefined);
const ficha = ref<FichaDaPratica>(fichaEmBranco());
const status = ref<StatusDoConteudo>('RASCUNHO');
const comentario = ref<string | null>(null);
const carregando = ref(false);
const salvando = ref(false);
const erro = ref('');
const recado = ref('');
const trilhas = ref<TrilhaNaLista[]>([]);

const MODALIDADES = [
  { valor: 'hatha', nome: 'Hatha' },
  { valor: 'vinyasa', nome: 'Vinyasa' },
  { valor: 'ashtanga', nome: 'Ashtanga' },
  { valor: 'restaurativo', nome: 'Restaurativo' },
  { valor: 'yin', nome: 'Yin Yoga' },
  { valor: 'nidra', nome: 'Yoga Nidra' },
  { valor: 'pranayama', nome: 'Pranáyama' },
  { valor: 'meditacao', nome: 'Meditação' },
  { valor: 'mobilidade', nome: 'Mobilidade' },
];

const AREAS = [
  { valor: 'asanas', nome: 'Āsanas' },
  { valor: 'pranayama', nome: 'Pranáyama' },
  { valor: 'meditacao', nome: 'Meditação' },
  { valor: 'nidra', nome: 'Yoga Nidra' },
  { valor: 'kriyas', nome: 'Kriyās' },
  { valor: 'filosofia', nome: 'Filosofia' },
  { valor: 'ayurveda', nome: 'Ayurveda' },
];

const OBJETIVOS = [
  { valor: 'mobilidade', nome: 'Mobilidade' },
  { valor: 'flexibilidade', nome: 'Flexibilidade' },
  { valor: 'forca', nome: 'Força' },
  { valor: 'estresse', nome: 'Reduzir estresse' },
  { valor: 'sono', nome: 'Dormir melhor' },
  { valor: 'respiracao', nome: 'Respiração' },
  { valor: 'meditacao', nome: 'Meditação' },
  { valor: 'disposicao', nome: 'Disposição' },
  { valor: 'ayurveda', nome: 'Ayurveda' },
  { valor: 'filosofia', nome: 'Filosofia' },
  { valor: 'pratica', nome: 'Aprofundar a prática' },
  { valor: 'formacao', nome: 'Formação' },
];

type Dimensao = keyof FichaDaPratica['caracteristicas'];
const DIMENSOES: { valor: Dimensao; nome: string }[] = [
  { valor: 'intensidade', nome: 'Intensidade' },
  { valor: 'mobilidade', nome: 'Mobilidade' },
  { valor: 'respiracaoCalma', nome: 'Respiração calma' },
  { valor: 'yogaNidra', nome: 'Yoga Nidra' },
  { valor: 'relaxamento', nome: 'Relaxamento' },
  { valor: 'ativacao', nome: 'Ativação' },
];

type Carga =
  | 'cargaCervical'
  | 'cargaJoelho'
  | 'cargaLombar'
  | 'cargaOmbros'
  | 'cargaPunhos'
  | 'cargaQuadril'
  | 'riscoQueda'
  | 'demandaCardiovascular'
  | 'mudancaRapidaPosicao';

const CARGAS: { valor: Carga; nome: string }[] = [
  { valor: 'cargaCervical', nome: 'Carga no pescoço' },
  { valor: 'cargaJoelho', nome: 'Carga nos joelhos' },
  { valor: 'cargaLombar', nome: 'Carga na lombar' },
  { valor: 'cargaOmbros', nome: 'Carga nos ombros' },
  { valor: 'cargaPunhos', nome: 'Carga nos punhos' },
  { valor: 'cargaQuadril', nome: 'Carga no quadril' },
  { valor: 'riscoQueda', nome: 'Risco de queda' },
  { valor: 'demandaCardiovascular', nome: 'Demanda cardiovascular' },
  { valor: 'mudancaRapidaPosicao', nome: 'Mudanças rápidas de posição' },
];

const ROTULO_DA_CARGA = ['Nenhuma', 'Leve', 'Moderada', 'Elevada'];
const DOSHAS = ['Vata', 'Pitta', 'Kapha'];

function valorDoEvento(evento: Event): number {
  return Number((evento.target as HTMLInputElement).value);
}

function definirObjetivo(nome: string, evento: Event) {
  ficha.value.objetivos = { ...ficha.value.objetivos, [nome]: valorDoEvento(evento) };
}

function definirCaracteristica(nome: Dimensao, evento: Event) {
  ficha.value.caracteristicas[nome] = valorDoEvento(evento);
}

function definirSeguranca(nome: Carga, evento: Event) {
  ficha.value.seguranca[nome] = valorDoEvento(evento);
}

function definirAyurveda(nome: string, evento: Event) {
  ficha.value.ayurveda = { ...ficha.value.ayurveda, [nome]: valorDoEvento(evento) };
}

function alternarPublicoGestacao(evento: Event) {
  const marcado = (evento.target as HTMLInputElement).checked;
  ficha.value.seguranca.publicoEspecifico = marcado ? 'gestacao' : undefined;
  // Uma aula para gestantes é, por definição, revisada para gestação.
  if (marcado) ficha.value.seguranca.revisadoParaGestacao = true;
}

onMounted(async () => {
  trilhas.value = await listarTrilhas();
  if (ehNova.value) return;

  carregando.value = true;
  try {
    const dados = await buscarConteudo(String(rota.params.id));
    status.value = dados.status as StatusDoConteudo;
    comentario.value = (dados.comentarioRevisao as string) ?? null;

    const branco = fichaEmBranco();
    ficha.value = {
      ...branco,
      titulo: dados.titulo as string,
      modalidade: dados.modalidade as string,
      area: dados.area as string,
      duracaoMin: dados.duracaoMin as number,
      nivelTecnico: dados.nivelTecnico as number,
      demandaFisica: dados.demandaFisica as number,
      professor: (dados.professor as string) ?? '',
      capaUrl: (dados.capaUrl as string) ?? '',
      // O banco guarda provedor + id; a tela mostra o link que o professor cola.
      videoUrl: dados.videoId ? `https://youtu.be/${String(dados.videoId)}` : '',
      objetivos: (dados.objetivos as Record<string, number>) ?? {},
      caracteristicas: { ...branco.caracteristicas, ...(dados.caracteristicas as object) },
      seguranca: { ...branco.seguranca, ...(dados.seguranca as object) },
      ayurveda: (dados.ayurveda as Record<string, number>) ?? {},
      trilhaId: (dados.trilhaId as string) ?? '',
    };
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível abrir a prática';
  } finally {
    carregando.value = false;
  }
});

/** Campos vazios não devem virar texto vazio no banco. */
function paraEnvio(): FichaDaPratica {
  const copia: FichaDaPratica = JSON.parse(JSON.stringify(ficha.value));
  if (!copia.professor) delete copia.professor;
  if (!copia.capaUrl) delete copia.capaUrl;
  if (!copia.videoUrl) delete copia.videoUrl;
  if (!copia.trilhaId) delete copia.trilhaId;
  return copia;
}

async function salvar() {
  salvando.value = true;
  erro.value = '';
  recado.value = '';
  try {
    if (ehNova.value) {
      const criado = await criarConteudo(paraEnvio());
      await router.replace(`/conteudos/${criado.id}`);
      recado.value = 'Prática criada como rascunho.';
    } else {
      await atualizarConteudo(String(rota.params.id), paraEnvio());
      recado.value = 'Alterações salvas.';
    }
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível salvar';
  } finally {
    salvando.value = false;
  }
}

async function mandarParaRevisao() {
  salvando.value = true;
  erro.value = '';
  try {
    await atualizarConteudo(String(rota.params.id), paraEnvio());
    await enviarParaRevisao(String(rota.params.id));
    status.value = 'EM_REVISAO';
    comentario.value = null;
    recado.value = 'Enviada para revisão do professor master.';
  } catch (problema) {
    erro.value = problema instanceof Error ? problema.message : 'Não foi possível enviar';
  } finally {
    salvando.value = false;
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
  margin-bottom: 20px;
}

.titulo {
  margin: 0 0 4px;
  font-size: 1.5rem;
  color: var(--azul-profundo);
}

.situacao {
  margin: 0;
  font-size: 0.85rem;
  color: var(--texto-suave);
}

.devolucao {
  color: #a35;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 18px 20px 22px;
  background: #fff;
  border: 1px solid var(--borda);
  border-radius: 12px;
}

.bloco.atencao {
  border-color: #e0c9a8;
  background: #fffdf9;
}

legend {
  grid-column: 1 / -1;
  padding: 0 6px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--texto-suave);
}

.explicacao {
  grid-column: 1 / -1;
  margin: 0 0 4px;
  font-size: 0.85rem;
  line-height: 1.55;
  color: var(--texto-medio);
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  font-size: 0.85rem;
  color: var(--texto-medio);
}

.campo.largo {
  grid-column: 1 / -1;
}

.campo input,
.campo select {
  padding: 9px 11px;
  border: 1px solid var(--borda-forte);
  border-radius: 8px;
  font: inherit;
  color: var(--texto);
  background: #fff;
}

.campo small {
  font-size: 0.76rem;
  color: var(--texto-suave);
}

.escalas {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 22px;
}

.escala {
  display: grid;
  grid-template-columns: 1fr 120px 68px;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: var(--texto-medio);
}

.escala output {
  font-size: 0.8rem;
  color: var(--texto-suave);
}

.marcas {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 22px;
  margin-top: 6px;
}

.marca {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--texto-medio);
}

.rodape {
  display: flex;
  gap: 10px;
}

.botao {
  padding: 11px 20px;
  background: var(--azul);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}

.botao.secundario {
  background: #fff;
  color: var(--azul);
  border: 1px solid var(--azul);
}

.botao[disabled] {
  opacity: 0.6;
}

.erro {
  margin: 0;
  font-size: 0.88rem;
  color: #a33;
}

.sucesso {
  margin: 0;
  font-size: 0.88rem;
  color: var(--verde);
}

.recado {
  padding: 32px;
  text-align: center;
  color: var(--texto-suave);
}

@media (max-width: 720px) {
  .bloco,
  .escalas,
  .marcas {
    grid-template-columns: 1fr;
  }
}
</style>
