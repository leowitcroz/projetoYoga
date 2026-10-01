import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'Informe a senha' })
  senha!: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(10)
  refreshToken!: string;
}

export class EmailDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;
}

export class TokenDto {
  @IsString()
  @MinLength(10)
  token!: string;
}

export class RedefinirSenhaDto {
  @IsString()
  @MinLength(10)
  token!: string;

  @IsString()
  @MinLength(8, { message: 'A senha precisa de pelo menos 8 caracteres' })
  senha!: string;
}
