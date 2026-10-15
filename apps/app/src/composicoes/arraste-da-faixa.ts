import { ref } from 'vue';

/**
 * Arrastar uma faixa que rola na horizontal, com o ponteiro.
 *
 * No celular o navegador já rola a faixa com o dedo, mas no computador não
 * existe arrastar área de rolagem: só a roda. Quem olha um carrossel tenta
 * puxar, não dá certo, e a tela parece quebrada. Aqui o ponteiro passa a
 * puxar — e no toque saímos do caminho, porque o navegador faz melhor.
 *
 * Vale para o Praticar e para o Aprender, que têm a mesma faixa.
 */

/** Quanto o ponteiro precisa andar para ser arraste, e não clique trêmulo. */
const LIMIAR = 6;

export function usarArrasteDaFaixa() {
  const faixa = ref<HTMLElement | null>(null);

  let pressionado = false;
  let arrastando = false;
  let partiuDe = 0;
  let rolagemInicial = 0;
  let andou = 0;

  function aoPressionar(evento: PointerEvent) {
    if (evento.pointerType === 'touch' || !faixa.value) return;

    pressionado = true;
    arrastando = false;
    andou = 0;
    partiuDe = evento.clientX;
    rolagemInicial = faixa.value.scrollLeft;
  }

  function aoArrastar(evento: PointerEvent) {
    if (!pressionado || !faixa.value) return;

    const distancia = evento.clientX - partiuDe;
    andou = Math.abs(distancia);

    // A captura do ponteiro só entra depois que vira arraste: capturada no
    // apertar, ela faz o clique seguinte chegar na faixa em vez do cartão, e
    // tocar num cartão deixa de abrir o que ele abria.
    if (!arrastando && andou > LIMIAR) {
      arrastando = true;
      faixa.value.setPointerCapture(evento.pointerId);
    }
    if (!arrastando) return;

    faixa.value.scrollLeft = rolagemInicial - distancia;
    evento.preventDefault();
  }

  function aoSoltar(evento: PointerEvent) {
    if (arrastando && faixa.value?.hasPointerCapture(evento.pointerId)) {
      faixa.value.releasePointerCapture(evento.pointerId);
    }
    pressionado = false;
    arrastando = false;
  }

  /** Puxar a faixa não pode abrir o cartão que estava debaixo do dedo. */
  function aoClicar(evento: MouseEvent) {
    if (andou > LIMIAR) {
      evento.preventDefault();
      evento.stopPropagation();
    }
  }

  return { faixa, aoPressionar, aoArrastar, aoSoltar, aoClicar };
}
