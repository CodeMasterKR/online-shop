import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ibrahimovkamronbek7@gmail.com', description: 'Email address for password reset' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}