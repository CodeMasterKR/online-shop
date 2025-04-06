import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'ibrahimovkamronbek7@gmail.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Kamronbek2003*', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}