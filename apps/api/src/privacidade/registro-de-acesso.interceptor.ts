import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service.js';
import type { PedidoComUsuario } from '../auth/jwt.guard.js';

/**
 * Registro de acesso (PRIV-03).
 *
 * Anota quem chamou o quê, quando e de onde — e só isso. Nada de corpo de
 * requisição nem de resposta, o que mantém dados de saúde fora do registro
 * por construção, e não por disciplina de quem escreve o código (PRIV-02).
 *
 * As gravações não seguram a resposta: um problema no registro não pode
 * derrubar o pedido de quem está esperando na tela.
 */
@Injectable()
export class RegistroDeAcessoInterceptor implements NestInterceptor {
  private readonly log = new Logger(RegistroDeAcessoInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(contexto: ExecutionContext, proximo: CallHandler): Observable<unknown> {
    const pedido = contexto.switchToHttp().getRequest<PedidoComUsuario>();

    // O /health é chamado de minuto em minuto pelo monitoramento: registrar
    // isso só encheria a tabela.
    if (pedido.path === '/health') return proximo.handle();

    return proximo.handle().pipe(
      tap(() => {
        void this.registrar(pedido);
      }),
    );
  }

  private async registrar(pedido: PedidoComUsuario): Promise<void> {
    try {
      await this.prisma.accessLog.create({
        data: {
          userId: pedido.usuarioId ?? null,
          rota: pedido.path.slice(0, 200),
          metodo: pedido.method,
          ip: this.ipDeQuemChamou(pedido),
        },
      });
    } catch (erro) {
      this.log.warn(`Não consegui registrar o acesso: ${(erro as Error).message}`);
    }
  }

  /** Atrás de proxy (Render, Vercel), o IP real vem no cabeçalho. */
  private ipDeQuemChamou(pedido: PedidoComUsuario): string | null {
    const encaminhado = pedido.headers['x-forwarded-for'];
    const bruto = Array.isArray(encaminhado) ? encaminhado[0] : encaminhado;
    const ip = bruto?.split(',')[0]?.trim() ?? pedido.ip ?? null;
    return ip ? ip.slice(0, 60) : null;
  }
}
