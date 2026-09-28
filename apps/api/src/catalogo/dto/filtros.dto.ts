import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

const MODALIDADES = [
  'hatha',
  'vinyasa',
  'ashtanga',
  'restaurativo',
  'yin',
  'nidra',
  'pranayama',
  'meditacao',
  'mobilidade',
];

export class FiltrosDoCatalogoDto {
  @IsOptional()
  @IsIn(MODALIDADES)
  modalidade?: string;

  /** Duração máxima em minutos: quem tem 20 não quer ver aula de 60. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(180)
  duracaoMax?: number;

  @IsOptional()
  @IsString()
  @Length(1, 40)
  objetivo?: string;

  @IsOptional()
  @IsString()
  @Length(1, 60)
  busca?: string;
}
