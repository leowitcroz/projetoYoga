import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

/** Os temas do Aprender (EDU-01). */
export const TEMAS = ['fisiologia', 'filosofia', 'yoga', 'ayurveda', 'classicos'];

/** Como a aula é entregue (EDU-02). */
export const TIPOS_DE_AULA = ['video', 'audio', 'texto'];

export class FiltrosDeCursosDto {
  @IsOptional()
  @IsIn(TEMAS)
  tema?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  nivel?: number;

  @IsOptional()
  @IsIn(TIPOS_DE_AULA)
  tipo?: string;

  @IsOptional()
  @IsString()
  @Length(1, 60)
  busca?: string;
}
