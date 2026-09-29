import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service.js';
import type { PedidoComUsuario } from './jwt.guard.js';

/**
 * Controle de acesso por papel (ADM-01, ADM-10).
 *
 * Usado junto com o JwtGuard, sempre depois dele: primeiro descobrimos quem é,
 * depois se essa pessoa pode. O papel é lido do banco a cada pedido, e não do
 * token, para que tirar o acesso de alguém tenha efeito na hora.
 */
export type Papel = 'ALUNO' | 'PROFESSOR' | 'MASTER' | 'ADMIN';

export const PAPEIS = 'papeis';
export const Papeis = (...papeis: Papel[]) => SetMetadata(PAPEIS, papeis);

export interface PedidoComPapel extends PedidoComUsuario {
  papel?: Papel;
}

@Injectable()
export class PapeisGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const permitidos = this.reflector.getAllAndOverride<Papel[]>(PAPEIS, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (!permitidos || permitidos.length === 0) return true;

    const pedido = contexto.switchToHttp().getRequest<PedidoComPapel>();
    if (!pedido.usuarioId) throw new UnauthorizedException('Faça login para continuar');

    const usuario = await this.prisma.user.findUnique({
      where: { id: pedido.usuarioId },
      select: { papel: true },
    });
    if (!usuario) throw new UnauthorizedException('Conta não encontrada');

    pedido.papel = usuario.papel as Papel;
    if (!permitidos.includes(pedido.papel)) {
      throw new ForbiddenException('Seu perfil não tem acesso a esta área');
    }

    return true;
  }
}

/** O papel de quem fez o pedido, colocado no pedido pelo guard. */
export const PapelDoUsuario = createParamDecorator((_dado: unknown, contexto: ExecutionContext) => {
  return contexto.switchToHttp().getRequest<PedidoComPapel>().papel as Papel;
});
