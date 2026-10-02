import { Injectable, type ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, type ThrottlerLimitDetail } from '@nestjs/throttler';

/**
 * F2.7 — o limite de tentativas é o mesmo; muda só o que a pessoa lê.
 *
 * O @nestjs/throttler responde `ThrottlerException: Too Many Requests`: inglês,
 * com o nome da classe dentro. Como o app mostra na tela a mensagem que a API
 * manda, essa frase chegava inteira ao aluno. Aqui ela vira português e diz
 * quanto falta para tentar de novo, que é a única coisa útil nesse momento.
 */
@Injectable()
export class LimiteDeTentativasGuard extends ThrottlerGuard {
  protected async getErrorMessage(
    _contexto: ExecutionContext,
    detalhe: ThrottlerLimitDetail,
  ): Promise<string> {
    const segundos = detalhe.isBlocked ? detalhe.timeToBlockExpire : detalhe.timeToExpire;
    return mensagemDeLimite(segundos);
  }
}

/** `segundos` é quanto falta para a contagem zerar. */
export function mensagemDeLimite(segundos: number): string {
  return `Muitas tentativas em pouco tempo. Tente de novo ${espera(segundos)}.`;
}

function espera(segundos: number): string {
  if (segundos <= 90) return 'em um minuto';

  const minutos = Math.ceil(segundos / 60);
  if (minutos < 60) return `em ${minutos} minutos`;

  const horas = Math.ceil(minutos / 60);
  return horas === 1 ? 'daqui a uma hora' : `daqui a ${horas} horas`;
}
