import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // <-- Import ConfigService
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service'; // <-- PrismaService yo'lini tekshiring
import { MailService } from '../../services/mail/mail.service'; // <-- MailService yo'lini tekshiring
import { RegisterUserDto } from './dto/register.dto'; // <-- DTO yo'lini tekshiring
import { ActivateDto } from './dto/activate.dto';   // <-- DTO yo'lini tekshiring
import { LoginUserDto } from './dto/login.dto';      // <-- DTO yo'lini tekshiring
import { User, userRole, userStatus, Session } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { totp } from 'otplib';
import { Request } from 'express';

interface AccessTokenPayload {
  id: string; 
  role: userRole;
  status: userStatus;
}

interface RefreshTokenPayload {
  userId: string; 
  sessionId: string; 
}


@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService, 
  ) {}

  private async genAccessToken(payload: AccessTokenPayload): Promise<string> {
    try {
      const secret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
      const expiresIn = this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRATION');

      return await this.jwtService.signAsync(payload, { secret, expiresIn });
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new InternalServerErrorException('Could not generate access token.');
    }
  }

  private async genRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    try {
      const secret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
      const expiresIn = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRATION');

      return await this.jwtService.signAsync(payload, { secret, expiresIn });
    } catch (error) {
      console.error('Error generating refresh token:', error);
      throw new InternalServerErrorException('Could not generate refresh token.');
    }
  }

  async register(registerDto: RegisterUserDto): Promise<string> {
    const { email, phone, password, datebirth, ...rest } = registerDto;

    const existingUserByEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      throw new ConflictException(`User with email ${email} already exists.`);
    }

    const existingUserByPhone = await this.prisma.user.findUnique({ where: { phone } });
    if (existingUserByPhone) {
      throw new ConflictException(`User with phone number ${phone} already exists.`);
    }

    let dateOfBirthObject: Date;
    try {
      dateOfBirthObject = new Date(datebirth);
      if (isNaN(dateOfBirthObject.getTime())) {
        throw new Error('Invalid date format. Please use YYYY-MM-DD.');
      }
      if (dateOfBirthObject > new Date()) {
        throw new Error('Date of birth cannot be in the future.');
      }
    } catch (error) {
      throw new BadRequestException(`Invalid date of birth: ${error.message}`);
    }

    let hashedPassword: string;
    try {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Password hashing failed:', error);
      throw new InternalServerErrorException('Could not process registration (hashing failed).');
    }

    try {
      await this.prisma.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          datebirth: String(dateOfBirthObject), 
          ...rest,
          userStatus: userStatus.INACTIVE,
          role: userRole.USER,
        },
      });
    } catch (error) {
      console.error('Database user creation failed:', error);
      throw new InternalServerErrorException('Could not save user data.');
    }

    let otp: string;
    const otpKeySecret = this.configService.getOrThrow<string>('OTP_KEY'); 
    try {
      totp.options = { step: 300, digits: 6 }; 
      otp = totp.generate(otpKeySecret + email);
    } catch (error) {
      console.error('OTP generation failed:', error);
      throw new InternalServerErrorException('Could not generate verification code.');
    }

    try {
      await this.mailService.sendMail(
        email,
        'Verify Your Email Address',
        `Hello ${rest.firstName},\n\nYour verification code is: ${otp}\n\nPlease use this code within 5 minutes to activate your account.\n\nIf you did not request this, please ignore this email.`
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new InternalServerErrorException('User registered, but failed to send verification email.');
    }

    return `Great! We've sent a verification code to your email. Please use it to activate your account.`;
  }

  async activate(activateDto: ActivateDto): Promise<Omit<User, 'password'>> {
    const { email, otp } = activateDto;
    const otpKeySecret = this.configService.getOrThrow<string>('OTP_KEY'); 

    try {
      const isCorrect = totp.check(otp, otpKeySecret + email);
      if (!isCorrect) {
        throw new BadRequestException('Invalid or expired OTP.');
      }

      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found.`);
      }

      if (user.userStatus === userStatus.ACTIVE) {
        console.log(`User ${email} is already active.`);
        const { password, ...result } = user;
        return result; 
      }
      if (user.userStatus !== userStatus.INACTIVE) {
           throw new ForbiddenException(`Account status (${user.userStatus}) does not allow activation.`);
      }


      const updatedUser = await this.prisma.user.update({
        where: { email },
        data: { userStatus: userStatus.ACTIVE },
      });

      const { password, ...result } = updatedUser;
      return result;

    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error(`Account activation failed for ${email}:`, error);
      throw new InternalServerErrorException('Failed to activate account.');
    }
  }

  async login(loginDto: LoginUserDto, req: Request): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const { email, password } = loginDto;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Invalid credentials.');
      }

      if (user.userStatus == userStatus.INACTIVE) {
        throw new ForbiddenException('Account is not active. Please verify your email.');
      }

      if (user.userStatus !== userStatus.ACTIVE) { 
        throw new ForbiddenException(`Account status (${user.userStatus}) prevents login.`);
      }

      const deviceInfo = userAgent.substring(0, 255); 

      // const session = await this.prisma.session.create({
      //   data: {
      //     userId: user.id,
      //     ipAddress: ipAddress,
      //     deviceInfo: deviceInfo,
      //   },
      // });

      const accessTokenPayload: AccessTokenPayload = { id: user.id, role: user.role, status: user.userStatus };
      // const refreshTokenPayload: RefreshTokenPayload = { userId: user.id, sessionId: session.id };

      const accessToken = await this.genAccessToken(accessTokenPayload);
      // const refreshToken = await this.genRefreshToken(refreshTokenPayload);

      const { password: _, ...userInfo } = user;
      return { accessToken, user: userInfo };

    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Login failed for ${email}:`, error);
      throw new InternalServerErrorException('An unexpected error occurred during login.');
    }
  }

  // --- Boshqa yordamchi metodlar (masalan, refresh token, logout) ---

}