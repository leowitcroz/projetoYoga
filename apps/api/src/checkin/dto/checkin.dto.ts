import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

/** Check-in diário (CHK-01). As opções são as mesmas da tela. */
export class CheckinDto {
  /** Data no fuso do aparelho (CHK-02): o dia de quem responde, não o do servidor. */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Dia deve ser AAAA-MM-DD' })
  dia!: string;

  @IsIn(['ruim', 'razoavel', 'bom'])
  sono!: string;

  @IsIn(['baixa', 'media', 'alta'])
  energia!: string;

  @IsIn(['cansado', 'normal', 'disposto'])
  corpo!: string;

  @IsIn(['nenhuma', 'leve', 'forte'])
  dor!: string;

  @IsOptional()
  @IsString()
  @IsIn(['lombar', 'cervical', 'ombros', 'joelhos', 'quadril', 'punhos', 'cabeca', 'outra'])
  regiaoDaDor?: string;

  @IsIn(['tranquilo', 'um-pouco-alto', 'alto'])
  estresse!: string;

  @IsIn(['pesada', 'normal', 'leve'])
  digestao!: string;

  @IsIn(['abatido', 'oscilando', 'equilibrado'])
  humor!: string;

  @IsInt()
  @Min(5)
  @Max(180)
  tempo!: number;
}
