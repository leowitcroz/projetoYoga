// Script solto: diferente da API, aqui ninguém carrega o .env por nós.
import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaService } from './prisma/prisma.service.js';

/**
 * Cria ou promove uma conta da equipe (F3.12, ADM-10).
 *
 * O app só cria alunos; professor, master e admin são feitos aqui, de
 * propósito: quem tem acesso ao painel não se cadastra sozinho.
 *
 *   npm run conta:equipe -w @life/api -- marcos@life.com "Marcos Crozetta" MASTER
 *
 * No Windows o npm come as aspas do nome; se ele sair com acentos estranhos,
 * passe o nome entre aspas simples ou use sobrenome sem espaço e corrija
 * depois pelo painel.
 *
 * Se a conta já existir, o script só troca o papel — sem mexer na senha.
 * Para uma conta nova, ele sorteia a senha e a imprime uma única vez.
 */
async function main(): Promise<void> {
  const [email, nome, papel = 'PROFESSOR'] = process.argv.slice(2);

  if (!email || !nome) {
    throw new Error('Uso: conta:equipe <email> "<nome>" [PROFESSOR|MASTER|ADMIN]');
  }
  if (!['PROFESSOR', 'MASTER', 'ADMIN'].includes(papel)) {
    throw new Error(`Papel inválido: ${papel}. Use PROFESSOR, MASTER ou ADMIN.`);
  }

  const prisma = new PrismaService();
  try {
    const jaExiste = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (jaExiste) {
      await prisma.user.update({
        where: { id: jaExiste.id },
        data: {
          papel: papel as never,
          // Conta de equipe é criada por quem já conhece a pessoa: não faz
          // sentido mandar e-mail de confirmação para ela mesma.
          emailVerificadoEm: jaExiste.emailVerificadoEm ?? new Date(),
        },
      });
      console.log(`Conta de ${jaExiste.nome} agora é ${papel}. A senha continua a mesma.`);
      return;
    }

    // Senha sorteada: ninguém escolhe senha por outra pessoa.
    const senha = randomBytes(9).toString('base64url');
    await prisma.user.create({
      data: {
        nome,
        email: email.toLowerCase(),
        telefone: '',
        senhaHash: await argon2.hash(senha, { type: argon2.argon2id }),
        papel: papel as never,
        // Quem cria a conta é a administração, que já sabe de quem é o
        // e-mail. Sem isso, o professor não conseguiria entrar no painel.
        emailVerificadoEm: new Date(),
        consentimentos: {
          create: { tipo: 'PRIVACIDADE', aceito: true, versao: 'equipe' },
        },
      },
    });

    console.log(`Conta criada: ${nome} <${email}> como ${papel}`);
    console.log(`Senha (anote agora, não será mostrada de novo): ${senha}`);
  } finally {
    await prisma.$disconnect();
  }
}

await main();
