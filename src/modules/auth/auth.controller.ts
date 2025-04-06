import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req, 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { ActivateDto } from './dto/activate.dto';
import { LoginUserDto } from './dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@prisma/client'; 


@ApiTags('Authentication') 
@Controller('auth') 
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK) 
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with INACTIVE status and sends a verification OTP via email.',
  })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration initiated successfully. Verification email sent.',
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email or phone number already exists.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data (e.g., date format, weak password).' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server error during registration process.' })
  async register(@Body() registerDto: RegisterUserDto): Promise<any> {
      const message = await this.authService.register(registerDto);
      return { message };
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activate user account',
    description: 'Activates an INACTIVE user account using the provided OTP.',
  })
  @ApiBody({ type: ActivateDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account activated successfully.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid or expired OTP.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User with the specified email not found.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Account status prevents activation (e.g., already active, blocked).' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server error during activation.' })
  async activate(@Body() activateDto: ActivateDto): Promise<Omit<User, 'password'>> {
    return this.authService.activate(activateDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user with email and password, returns access token and user info. Refresh token is not currently returned.',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful.',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials (email or password incorrect).' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Account access denied (e.g., inactive, blocked).' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server error during login.' })
  async login(
    @Body() loginDto: LoginUserDto,
    @Req() req: Request 
   ): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
       return this.authService.login(loginDto, req);
  }
}