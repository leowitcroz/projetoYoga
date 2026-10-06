import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

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

/**
 * As áreas da biblioteca (PRA-01).
 *
 * `relaxamento` estava faltando desde o começo: o PRA-01 lista as seis áreas
 * e essa é uma delas, mas sem ela na lista nenhuma prática podia ser
 * cadastrada como relaxamento, e a biblioteca teria uma porta sem nada atrás.
 */
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

/** Os blocos que uma prática pode ter, na linguagem da biblioteca (PRA-01). */
const BLOCOS = [
  'preparacao',
  'asanas',
  'pranayama',
  'meditacao',
  'nidra',
  'relaxamento',
  'kriyas',
];

/**
 * O quanto a prática entrega de cada coisa (0 a 5).
 *
 * É o que o motor cruza com o check-in do dia: uma prática com relaxamento 5
 * sobe num dia de cansaço, uma com ativação 5 sobe num dia de energia alta.
 */
export class CaracteristicasDto {
  @IsInt() @Min(0) @Max(5) intensidade!: number;
  @IsInt() @Min(0) @Max(5) mobilidade!: number;
  @IsInt() @Min(0) @Max(5) respiracaoCalma!: number;
  @IsInt() @Min(0) @Max(5) yogaNidra!: number;
  @IsInt() @Min(0) @Max(5) relaxamento!: number;
  @IsInt() @Min(0) @Max(5) ativacao!: number;
}

/**
 * Marcações de segurança (ADM-03).
 *
 * São elas que tiram a prática da recomendação de quem tem dor ou condição de
 * saúde. Preencher errado aqui é o erro mais caro do catálogo: por isso as
 * cargas vão de 0 (nenhuma) a 3 (elevada), e não em "sim/não".
 */
export class SegurancaDto {
  @IsInt() @Min(0) @Max(3) cargaCervical!: number;
  @IsInt() @Min(0) @Max(3) cargaJoelho!: number;
  @IsInt() @Min(0) @Max(3) cargaLombar!: number;
  @IsInt() @Min(0) @Max(3) cargaOmbros!: number;
  @IsInt() @Min(0) @Max(3) cargaPunhos!: number;
  @IsInt() @Min(0) @Max(3) cargaQuadril!: number;
  @IsInt() @Min(0) @Max(3) riscoQueda!: number;
  @IsInt() @Min(0) @Max(3) demandaCardiovascular!: number;
  @IsInt() @Min(0) @Max(3) mudancaRapidaPosicao!: number;

  @IsBoolean() invertida!: boolean;
  @IsBoolean() retencaoRespiratoria!: boolean;

  /** Conteúdo revisado para gestação (SEG-008). */
  @IsOptional() @IsBoolean() revisadoParaGestacao?: boolean;
  /** Existe versão adaptada aprovada para usar no lugar (SEG-002). */
  @IsOptional() @IsBoolean() temVersaoAdaptada?: boolean;
  /** Aula feita para um público específico; quem está fora dele não recebe. */
  @IsOptional() @IsIn(['gestacao']) publicoEspecifico?: string;
}

/**
 * Os blocos que compõem a prática (PRA-07).
 *
 * A lista é a ordem: o primeiro bloco é o primeiro que a pessoa faz. Os tipos
 * são os da biblioteca (PRA-01), mais a preparação, que não é um conteúdo em
 * si mas ocupa minutos de verdade na aula.
 */
export class BlocoDaPraticaDto {
  @IsIn(BLOCOS)
  tipo!: string;

  @IsInt()
  @Min(1)
  @Max(180)
  minutos!: number;
}

export class ConteudoDto {
  @IsString()
  @Length(3, 120)
  titulo!: string;

  @IsIn(MODALIDADES)
  modalidade!: string;

  @IsIn(AREAS)
  area!: string;

  @IsInt()
  @Min(5)
  @Max(180)
  duracaoMin!: number;

  /** 1 introdutório → 5 especializado. Não é o mesmo que esforço físico. */
  @IsInt()
  @Min(1)
  @Max(5)
  nivelTecnico!: number;

  /** 1 muito baixa → 5 muito alta. O quanto exige do corpo. */
  @IsInt()
  @Min(1)
  @Max(5)
  demandaFisica!: number;

  @IsOptional()
  @IsString()
  @Length(2, 80)
  professor?: string;

  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'A capa precisa ser um endereço de imagem válido' })
  capaUrl?: string;

  /**
   * Link do vídeo no YouTube, em qualquer formato (watch, youtu.be, embed,
   * Shorts) — ou o identificador puro. Vazio = prática sem vídeo ainda.
   */
  @IsOptional()
  @IsString()
  @Length(0, 200)
  videoUrl?: string;

  /** Objetivos que a prática atende, com peso de 0 a 5. */
  @IsObject()
  objetivos!: Record<string, number>;

  @ValidateNested()
  @Type(() => CaracteristicasDto)
  caracteristicas!: CaracteristicasDto;

  @ValidateNested()
  @Type(() => SegurancaDto)
  seguranca!: SegurancaDto;

  /** Tags ayurvédicas (0 a 3), opcionais. */
  @IsOptional()
  @IsObject()
  ayurveda?: Record<string, number>;

  /**
   * A prática em blocos, na ordem (PRA-07).
   *
   * Vazio é permitido — o professor pode ainda não ter descrito — e nesse caso
   * a tela do aluno simplesmente não mostra a seção, em vez de inventar uma
   * divisão que ninguém conferiu.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => BlocoDaPraticaDto)
  estrutura?: BlocoDaPraticaDto[];

  /**
   * Trilha a que a prática pertence (ADM-05). Vazio = prática avulsa.
   *
   * A posição dentro da trilha não vem daqui: quem a define é a tela da
   * trilha, que manda a lista inteira na ordem. Uma prática que entra por
   * esta ficha vai para o fim da fila.
   */
  @IsOptional()
  @IsString()
  @Length(1, 60)
  trilhaId?: string;
}

export class DevolverDto {
  @IsString()
  @Length(5, 500, { message: 'Explique o que precisa mudar, para o professor poder corrigir' })
  comentario!: string;
}
