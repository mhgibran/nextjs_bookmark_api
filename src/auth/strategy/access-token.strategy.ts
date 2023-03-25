import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

type JwtPayload = {
  sub: number;
  email: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get(
        'JWT_ACCESS_SECRET',
      ),
    });
  }

  async validate(payload: JwtPayload) {
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
    return user;
  }
}
