import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * Links de uso único mandados por e-mail (AUTH-02, AUTH-04).
 *
 * O que vai no link é um segredo aleatório; no banco fica só o hash. Assim um
 * vazamento do banco não deixa ninguém confirmar e-mail nem trocar senha
 * alheia — mesma ideia do refresh token.
 */
export type TipoDeToken = 'VERIFICACAO_EMAIL' | 'REDEFINICAO_SENHA';

/** Quanto tempo cada link vale, em horas. */
const VALIDADE: Record<TipoDeToken, number> = {
  VERIFICACAO_EMAIL: 24,
  REDEFINICAO_SENHA: 1,
};

@Injectable()
export class TokensService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um link novo e invalida os anteriores do mesmo tipo: pedir outro
   * e-mail não pode deixar dois links válidos ao mesmo tempo.
   */
  async criar(userId: string, tipo: TipoDeToken): Promise<string> {
    await this.prisma.authToken.updateMany({
      where: { userId, tipo, usadoEm: null },
      data: { usadoEm: new Date() },
    });

    const token = randomBytes(32).toString('base64url');
    const expiraEm = new Date(Date.now() + VALIDADE[tipo] * 60 * 60 * 1000);

    await this.prisma.authToken.create({
      data: { userId, tipo, tokenHash: this.hash(token), expiraEm },
    });

    return token;
  }

  /**
   * Gasta o token e devolve de quem ele é. `null` para token inexistente,
   * vencido ou já usado — quem chama não precisa saber qual dos três, e quem
   * tenta adivinhar também não.
   */
  async usar(token: string, tipo: TipoDeToken): Promise<string | null> {
    const guardado = await this.prisma.authToken.findUnique({
      where: { tokenHash: this.hash(token) },
    });

    if (!guardado) return null;
    if (guardado.tipo !== tipo) return null;
    if (guardado.usadoEm !== null) return null;
    if (guardado.expiraEm < new Date()) return null;

    await this.prisma.authToken.update({
      where: { id: guardado.id },
      data: { usadoEm: new Date() },
    });

    return guardado.userId;
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
