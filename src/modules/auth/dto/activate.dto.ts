import { ApiProperty } from '@nestjs/swagger'; 
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ActivateDto {
  @ApiProperty({ 
    example: 'ibrahimovkamronbek7@gmail.com',
    description: 'Email address of the user to activate',
    required: true, 
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'One-Time Password (OTP) received via email',
    required: true,
  })
  @IsNotEmpty()
  @IsString() 
  otp: string;
}