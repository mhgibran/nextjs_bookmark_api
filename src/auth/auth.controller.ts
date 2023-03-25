import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Get,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { GetUser } from './decorators';
import { User } from '@prisma/client';
import { RefreshTokenGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(
      dto,
    );

    res.cookie('session', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      access_token: tokens.accessToken,
    };
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshToken(
    @GetUser('id') userId: number,
    @GetUser('email') email: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens =
      await this.authService.refreshToken(
        userId,
        email,
      );

    res.cookie('session', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      access_token: tokens.accessToken,
    };
  }
}
