/**
 * De onde vem o vídeo da prática (P-03).
 *
 * Guardamos o **identificador** da mídia e o nome do provedor, nunca a URL
 * inteira. É o que torna barata a troca do YouTube pelo Mux mais tarde: muda
 * o player, não o catálogo.
 */
export interface Midia {
  provedor: 'youtube';
  id: string;
}

/**
 * Aceita as formas que um professor costuma ter na mão ao copiar um vídeo:
 * o link da barra de endereços, o de compartilhar, o de incorporar, o de
 * Shorts — ou o próprio identificador, se ele souber qual é.
 */
export function lerVideo(entrada: string): Midia | null {
  const texto = entrada.trim();
  if (!texto) return null;

  // O identificador do YouTube tem 11 caracteres.
  if (/^[\w-]{11}$/.test(texto)) return { provedor: 'youtube', id: texto };

  const padroes = [
    /youtube\.com\/watch\?[^#]*\bv=([\w-]{11})/i,
    /youtu\.be\/([\w-]{11})/i,
    /youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/i,
    /youtube\.com\/shorts\/([\w-]{11})/i,
    /youtube\.com\/live\/([\w-]{11})/i,
  ];

  for (const padrao of padroes) {
    const achado = padrao.exec(texto);
    if (achado?.[1]) return { provedor: 'youtube', id: achado[1] };
  }

  return null;
}
