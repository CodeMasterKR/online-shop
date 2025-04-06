import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString, IsString, Length, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Parolni tiklamoqchi bo\'lgan foydalanuvchi elektron pochtasi', example: 'ibrahimovkamronbek7@gmail.com' })
  @IsEmail({}, { message: 'Yaroqli elektron pochta manzilini kiriting.' })
  @IsNotEmpty({ message: 'Elektron pochta kiritilishi shart.' })
  email: string; 

  @ApiProperty({ description: 'Elektron pochta orqali yuborilgan OTP kodi', example: '123456' })
  @IsNumberString({}, { message: 'OTP faqat raqamlardan iborat bo\'lishi kerak.' })
  @Length(6, 6, { message: 'OTP kodi 6 ta raqamdan iborat bo\'lishi kerak.' })
  @IsNotEmpty({ message: 'OTP kodi kiritilishi shart.' })
  otp: string;

  @ApiProperty({ example: 'Kamronbek2003**', description: 'Foydalanuvchi uchun yangi parol' })
  @IsString()
  @MinLength(8, { message: 'Parol kamida 8 belgidan iborat bo\'lishi kerak.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Parol juda oddiy. Unda katta va kichik harflar, raqamlar va maxsus belgilar bo\'lishi kerak.',
  })
  @IsNotEmpty({ message: 'Yangi parol kiritilishi shart.' })
  newPassword: string;
}