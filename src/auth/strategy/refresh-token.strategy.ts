import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common/exceptions';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshTokenStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: config.get(
        'JWT_REFRESH_SECRET',
      ),
      passReqToCallBack: true,
    });
  }

  private static extractJWT(
    req: Request,
  ): string | null {
    if (req.cookies && req.cookies.session) {
      return req.cookies.session;
    }

    return null;
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findFirst(
      {
        where: { id: payload.sub },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    );

    if (!user) {
      throw new BadRequestException(
        'Invalid token',
      );
    }

    return user;
  }
}
