import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface PedidoComUsuario extends Request {
  usuarioId?: string;
}

/** Deixa passar só quem mandar um access token válido no cabeçalho Authorization. */
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const pedido = contexto.switchToHttp().getRequest<PedidoComUsuario>();
    const cabecalho = pedido.headers.authorization ?? '';
    const [tipo, token] = cabecalho.split(' ');

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Faça login para continuar');
    }

    try {
      const conteudo = await this.jwt.verifyAsync<{ sub: string }>(token);
      pedido.usuarioId = conteudo.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Sessão expirada');
    }
  }
}

/** Pega o id do usuário que o guard colocou no pedido. */
export const UsuarioId = createParamDecorator((_dado: unknown, contexto: ExecutionContext) => {
  const pedido = contexto.switchToHttp().getRequest<PedidoComUsuario>();
  return pedido.usuarioId as string;
});
