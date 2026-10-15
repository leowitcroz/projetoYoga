import { IsString, Matches } from 'class-validator';

export class DiaDto {
  /**
   * Dia no fuso do aparelho (AAAA-MM-DD).
   *
   * Vem do app, e não do relógio do servidor, porque é o dia da pessoa que
   * decide qual é a aula de hoje (EDU-05).
   */
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Dia deve estar no formato AAAA-MM-DD' })
  dia!: string;
}
