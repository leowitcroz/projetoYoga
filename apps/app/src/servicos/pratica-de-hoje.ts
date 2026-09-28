import { ref } from 'vue';
import { chamar } from './api.js';
import { checkin } from './checkin-do-dia.js';

/**
 * A prática que o motor recomendou para hoje.
 *
 * O app manda o check-in para a API e pergunta `GET /hoje`; quem decide é o
 * motor, no servidor. Aqui só guardamos o resultado para a tela mostrar.
 */

export interface PraticaRecomendada {
  conteudo: {
    id: string;
    titulo: string;
    modalidade: string;
    duracaoMin: number;
    demandaFisica: number;
  };
  scoreFinal: number;
  explicacao: string;
}

export interface RecomendacaoDoDia {
  principal?: PraticaRecomendada;
  alternativa?: PraticaRecomendada;
  estadoFuncional: string;
  aviso?: string;
}

export const recomendacao = ref<RecomendacaoDoDia | null>(null);
export const buscando = ref(false);
export const erroDaRecomendacao = ref('');

/** Envia o check-in do dia e traz a recomendação (CHK-01 + MOT-08). */
export async function pedirRecomendacao(): Promise<void> {
  buscando.value = true;
  erroDaRecomendacao.value = '';

  try {
    await chamar('/checkin', {
      metodo: 'PUT',
      corpo: {
        dia: checkin.dia,
        ...checkin.respostas,
        regiaoDaDor: checkin.localDaDor,
        tempo: checkin.tempo,
      },
    });

    recomendacao.value = await chamar<RecomendacaoDoDia>(
      `/hoje?dia=${encodeURIComponent(checkin.dia)}`,
    );
  } catch (erro) {
    erroDaRecomendacao.value =
      erro instanceof Error ? erro.message : 'Não foi possível montar sua prática agora';
    recomendacao.value = null;
  } finally {
    buscando.value = false;
  }
}

/** Quando a pessoa muda uma resposta, a recomendação anterior não vale mais. */
export function esquecerRecomendacao(): void {
  recomendacao.value = null;
  erroDaRecomendacao.value = '';
}
