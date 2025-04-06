import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: 'ibrahimovkamronbek7@gmail.com', description: 'Email address to send OTP' })
  @IsEmail()
  @IsNotEmpty()
  email: string; 
}