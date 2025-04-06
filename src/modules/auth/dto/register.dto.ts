import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches, MinLength } from 'class-validator';
import { gender, userRole, userStatus } from '@prisma/client'; 

export class RegisterUserDto {
  @ApiProperty({ example: 'Kamron', description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Ibrohimov', description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'ibrahimovkamronbek7@gmail.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+998945895766', description: 'User phone number' })
  @IsPhoneNumber('UZ')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Kamronbek2003*', description: 'User password' })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak. It must contain uppercase, lowercase letters, numbers, and special characters.',
  }) 
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '2003-09-10', description: 'User date of birth (YYYY-MM-DD)' })
  @IsString() 
  @IsNotEmpty()
  datebirth: string;

  @ApiProperty({ enum: gender, example: gender.MALE, description: 'User gender' })
  @IsEnum(gender)
  @IsNotEmpty()
  gender: gender;

  @ApiProperty({ example: 'http://example.com/image.jpg', description: 'User profile image URL', required: false })
  @IsString()
  @IsOptional() 
  image?: string;
}