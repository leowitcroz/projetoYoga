import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

/**
 * Envio de e-mail (F2.9).
 *
 * Em desenvolvimento aponta para o Mailpit, que roda no Docker e guarda tudo
 * em http://localhost:8025 sem mandar nada para o mundo. Em produção, o
 * provedor de verdade entra pelas mesmas variáveis (Fase 7).
 *
 * Sem SMTP configurado, o serviço não quebra: registra o que teria enviado e
 * segue. É o que permite o ambiente de demonstração funcionar sem provedor.
 */
@Injectable()
export class EmailService {
  private readonly log = new Logger(EmailService.name);
  private readonly transporte: Transporter | null;
  private readonly remetente: string;
  private readonly enderecoDoApp: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    this.remetente = this.config.get<string>('EMAIL_REMETENTE') ?? 'LIFE <nao-responda@life.app>';
    this.enderecoDoApp = this.config.get<string>('APP_URL') ?? 'http://localhost:5173';

    this.transporte = host
      ? createTransport({
          host,
          port: Number(this.config.get<string>('SMTP_PORT') ?? 1025),
          secure: this.config.get<string>('SMTP_SEGURO') === '1',
          auth: this.montarAutenticacao(),
        })
      : null;

    if (!this.transporte) {
      this.log.warn('Sem SMTP configurado: os e-mails serão apenas registrados no log.');
    }
  }

  private montarAutenticacao() {
    const user = this.config.get<string>('SMTP_USUARIO');
    const pass = this.config.get<string>('SMTP_SENHA');
    return user && pass ? { user, pass } : undefined;
  }

  /** AUTH-02 — confirmação de e-mail, válida por 24 horas. */
  async enviarVerificacao(para: string, nome: string, token: string): Promise<void> {
    const link = `${this.enderecoDoApp}/verificar-email?token=${token}`;

    await this.enviar({
      para,
      assunto: 'Confirme o seu e-mail — LIFE',
      texto: [
        `Olá, ${nome.split(' ')[0]}.`,
        '',
        'Confirme o seu e-mail para começar a praticar:',
        link,
        '',
        'O link vale por 24 horas.',
        'Se não foi você que criou a conta, pode ignorar esta mensagem.',
      ].join('\n'),
    });
  }

  /** AUTH-04 — redefinição de senha, válida por 1 hora. */
  async enviarRedefinicaoDeSenha(para: string, nome: string, token: string): Promise<void> {
    const link = `${this.enderecoDoApp}/redefinir-senha?token=${token}`;

    await this.enviar({
      para,
      assunto: 'Redefinir a sua senha — LIFE',
      texto: [
        `Olá, ${nome.split(' ')[0]}.`,
        '',
        'Para escolher uma senha nova, abra o link abaixo:',
        link,
        '',
        'O link vale por 1 hora e só pode ser usado uma vez.',
        'Se não foi você que pediu, não precisa fazer nada: a sua senha continua a mesma.',
      ].join('\n'),
    });
  }

  private async enviar(mensagem: { para: string; assunto: string; texto: string }): Promise<void> {
    if (!this.transporte) {
      this.log.log(`[e-mail não enviado] ${mensagem.assunto} → ${mensagem.para}`);
      return;
    }

    try {
      await this.transporte.sendMail({
        from: this.remetente,
        to: mensagem.para,
        subject: mensagem.assunto,
        text: mensagem.texto,
      });
    } catch (erro) {
      // Um e-mail que não sai não pode derrubar o cadastro de quem está
      // esperando na tela. A pessoa pede o reenvio depois.
      this.log.error(`Falha ao enviar "${mensagem.assunto}": ${(erro as Error).message}`);
    }
  }
}
