import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

/** Respostas dos passos 1, 2, 4 e 5 (ONB-01, ONB-02, ONB-05, ONB-06). */
export class RespostasOnboardingDto {
  @IsOptional()
  @IsString()
  @Length(1, 60)
  objetivoPrincipal?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @IsString({ each: true })
  objetivosSecundarios?: string[];

  /** Área do Yoga => nível (Nunca, Básico, Regular, Experiente). */
  @IsOptional()
  @IsObject()
  experiencia?: Record<string, string>;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  constituicao?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  estadoAtual?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  estilos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  temas?: string[];

  @IsOptional()
  @IsString()
  @Length(1, 30)
  horarioPreferido?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  passoConcluido?: number;
}

/** Passo 3 — saúde (ONB-04). Só é gravado com consentimento de saúde. */
export class RespostasSaudeDto {
  @IsArray()
  @IsString({ each: true })
  condicoes!: string[];

  @IsOptional()
  @IsString()
  @Length(0, 500)
  observacoes?: string;
}

export class RegistroDto {
  @IsString()
  @Length(3, 120)
  nome!: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;

  @Matches(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/, { message: 'Telefone inválido' })
  telefone!: string;

  @IsString()
  @MinLength(8, { message: 'A senha precisa de pelo menos 8 caracteres' })
  senha!: string;

  /** Aceite da política de privacidade (PRIV-01). Sem ele não há cadastro. */
  @IsBoolean()
  @IsIn([true], { message: 'É preciso aceitar a política de privacidade' })
  aceitePrivacidade!: boolean;

  /** Consentimento separado para dados de saúde (ONB-03). */
  @IsOptional()
  @IsBoolean()
  aceiteSaude?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => RespostasOnboardingDto)
  onboarding?: RespostasOnboardingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RespostasSaudeDto)
  saude?: RespostasSaudeDto;
}
