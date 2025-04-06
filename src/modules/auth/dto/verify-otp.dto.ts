import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: 'ibrahimovkamronbek7@gmail.com', description: 'Email address associated with OTP' })
  @IsEmail()
  @IsNotEmpty()
  email: string; 

  @ApiProperty({ example: '123456', description: 'The OTP code' })
  @IsString()
  @Length(6, 6) 
  @IsNotEmpty()
  otp: string;
}