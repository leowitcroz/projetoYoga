import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

/** Criar ou editar uma trilha (ADM-05). */
export class TrilhaDto {
  @IsString()
  @Length(3, 80)
  nome!: string;

  @IsOptional()
  @IsString()
  @Length(0, 400)
  descricao?: string;

  /**
   * Quantas aulas a trilha terá quando estiver pronta.
   *
   * É um alvo, não um limite: a trilha pode ser salva com menos (ainda está
   * sendo montada) e o painel mostra o que falta. Barrar aqui obrigaria o
   * professor a cadastrar as oito aulas antes de poder salvar a primeira.
   */
  @IsInt()
  @Min(2, { message: 'Uma trilha tem pelo menos 2 aulas; com uma só, é uma prática avulsa' })
  @Max(60)
  totalAulas!: number;

  /** Trilha que convém ter feito antes desta. Vazio = a trilha abre sozinha. */
  @IsOptional()
  @IsString()
  @Length(0, 60)
  preRequisitoId?: string;
}

/**
 * A ordem das aulas da trilha.
 *
 * O painel manda a lista inteira na ordem desejada e a API numera de 1 em
 * diante. Enquanto o professor digitava o número da posição, dava para ter
 * duas aulas na posição 3 e nenhuma na 4 — e o motor, que procura a aula
 * seguinte somando 1 (PER-008), parava de achar a continuação sem avisar.
 */
export class OrdemDaTrilhaDto {
  @IsArray()
  @ArrayMaxSize(60)
  @IsString({ each: true })
  aulas!: string[];
}
