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

/** As seis áreas da biblioteca, mais as de leitura (PRA-01). */
const AREAS = [
  'asanas',
  'pranayama',
  'meditacao',
  'nidra',
  'relaxamento',
  'kriyas',
  'filosofia',
  'ayurveda',
];

export class FiltrosDoCatalogoDto {
  @IsOptional()
  @IsIn(MODALIDADES)
  modalidade?: string;

  /** Área da biblioteca: é por aqui que entram os cartões do Praticar. */
  @IsOptional()
  @IsIn(AREAS)
  area?: string;

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
