import {
  ForbiddenException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon2 from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt/dist';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async register(dto: AuthDto) {
    // hashing password
    const hash = await argon2.hash(dto.password);

    try {
      // save new user
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      // return the token
      return this.signToken(user.id, user.email);
    } catch (error) {
      return { errors: error };
    }
  }

  async login(dto: AuthDto) {
    // find user by email
    const user = await this.prisma.user.findFirst(
      {
        where: {
          email: dto.email,
        },
        select: {
          id: true,
          email: true,
          hash: true,
        },
      },
    );

    // throw exception if user does not exists
    if (!user)
      throw new BadRequestException(
        'Credential does not exists!',
      );

    // compare password
    const matchPassword = await argon2.verify(
      user.hash,
      dto.password,
    );

    // throw exception if pass does not match
    if (!matchPassword)
      throw new ForbiddenException(
        'Password incorrect!',
      );

    // create token
    const tokens = await this.signToken(
      user.id,
      user.email,
    );

    // store refresh token
    await this.updateRefreshToken(
      user.id,
      tokens.refreshToken,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(
    userId: number,
    email: string,
  ) {
    const tokens = await this.signToken(
      userId,
      email,
    );

    await this.updateRefreshToken(
      userId,
      tokens.refreshToken,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token: refreshToken },
    });
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const [accessToken, refreshToken] =
      await Promise.all([
        this.jwt.signAsync(
          {
            sub: userId,
            email: email,
          },
          {
            secret: this.config.get(
              'JWT_ACCESS_SECRET',
            ),
            expiresIn: this.config.get(
              'JWT_ACCESS_EXPIRE',
            ),
          },
        ),
        this.jwt.signAsync(
          {
            sub: userId,
            email: email,
          },
          {
            secret: this.config.get(
              'JWT_REFRESH_SECRET',
            ),
            expiresIn: this.config.get(
              'JWT_REFRESH_EXPIRE',
            ),
          },
        ),
      ]);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
