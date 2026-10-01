import { IsBoolean, IsIn, IsOptional, Matches } from 'class-validator';

/** F2.18 — o que a pessoa fez com a prática. */
export class EventoDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Dia deve ser AAAA-MM-DD' })
  dia!: string;

  @IsIn(['INICIADA', 'CONCLUIDA', 'TROCADA'])
  tipo!: string;
}

/** Feedback de depois da prática. */
export class FeedbackDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Dia deve ser AAAA-MM-DD' })
  dia!: string;

  @IsBoolean()
  gostou!: boolean;

  /** Como o corpo sentiu, nas palavras de quem praticou. */
  @IsOptional()
  @IsIn(['leve-demais', 'na-medida', 'pesada-demais'])
  intensidadePercebida?: string;
}
