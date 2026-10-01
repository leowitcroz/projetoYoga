import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/** Quanto tempo o registro de acesso fica guardado (PRIV-03). */
const MESES_DE_REGISTRO = 6;

/** De quanto em quanto tempo a faxina roda. */
const INTERVALO_DA_FAXINA = 24 * 60 * 60 * 1000;

/**
 * Limpezas que a LGPD manda fazer sozinho (PRIV-03, AUTH-07).
 *
 * Guardar dado além do necessário é tão problema quanto não guardar o que a
 * lei pede. Por isso a faxina é automática: ninguém precisa lembrar.
 */
@Injectable()
export class PrivacidadeService implements OnModuleInit {
  private readonly log = new Logger(PrivacidadeService.name);
  private relogio?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    void this.apagarRegistrosVencidos();

    this.relogio = setInterval(() => {
      void this.apagarRegistrosVencidos();
    }, INTERVALO_DA_FAXINA);

    // Sem unref, o processo não encerra sozinho — e os testes ficariam presos.
    this.relogio.unref?.();
  }

  /** PRIV-03 — registro de acesso com mais de 6 meses vai embora. */
  async apagarRegistrosVencidos(agora: Date = new Date()): Promise<number> {
    const limite = new Date(agora);
    limite.setMonth(limite.getMonth() - MESES_DE_REGISTRO);

    try {
      const { count } = await this.prisma.accessLog.deleteMany({
        where: { criadoEm: { lt: limite } },
      });
      if (count > 0) this.log.log(`Faxina: ${count} registros de acesso vencidos apagados.`);
      return count;
    } catch (erro) {
      this.log.warn(`Faxina falhou: ${(erro as Error).message}`);
      return 0;
    }
  }

  /**
   * AUTH-07 — excluir a conta.
   *
   * Apaga tudo o que é da pessoa; do registro de acesso sobra só a linha sem
   * dono, que é o que a lei manda guardar. Perfil, saúde, check-ins,
   * recomendações, consentimentos e sessões vão junto, por cascade.
   *
   * Conteúdo publicado por um professor não é apagado: ele é do catálogo, e
   * some o vínculo com o autor (onDelete: SetNull).
   */
  async excluirConta(userId: string): Promise<void> {
    await this.prisma.accessLog.updateMany({ where: { userId }, data: { userId: null } });
    await this.prisma.user.delete({ where: { id: userId } });
    this.log.log('Conta excluída a pedido da pessoa (AUTH-07).');
  }
}
