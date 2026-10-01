import { describe, expect, it } from 'vitest';
import { lerVideo } from './video.js';

/**
 * O professor cola o que tem na mão. Todas estas formas aparecem no dia a
 * dia de quem publica no YouTube.
 */
describe('lerVideo', () => {
  const id = 'dQw4w9WgXcQ';

  it('lê o link da barra de endereços', () => {
    expect(lerVideo(`https://www.youtube.com/watch?v=${id}`)).toEqual({
      provedor: 'youtube',
      id,
    });
  });

  it('lê o link de compartilhar', () => {
    expect(lerVideo(`https://youtu.be/${id}`)?.id).toBe(id);
    expect(lerVideo(`https://youtu.be/${id}?t=42`)?.id).toBe(id);
  });

  it('lê o link de incorporar, com ou sem cookies', () => {
    expect(lerVideo(`https://www.youtube.com/embed/${id}`)?.id).toBe(id);
    expect(lerVideo(`https://www.youtube-nocookie.com/embed/${id}`)?.id).toBe(id);
  });

  it('lê Shorts e transmissões', () => {
    expect(lerVideo(`https://www.youtube.com/shorts/${id}`)?.id).toBe(id);
    expect(lerVideo(`https://www.youtube.com/live/${id}`)?.id).toBe(id);
  });

  it('lê o identificador puro, para quem já sabe qual é', () => {
    expect(lerVideo(id)?.id).toBe(id);
  });

  it('aguenta parâmetros extras e espaços sobrando', () => {
    expect(lerVideo(`  https://www.youtube.com/watch?list=PL123&v=${id}&index=2  `)?.id).toBe(id);
  });

  it('devolve nulo para o que não dá para ler', () => {
    expect(lerVideo('')).toBeNull();
    expect(lerVideo('https://vimeo.com/123456')).toBeNull();
    expect(lerVideo('https://www.youtube.com/watch?v=curto')).toBeNull();
    expect(lerVideo('só um texto qualquer')).toBeNull();
  });
});
