import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators';
import { AccessTokenGuard } from '../auth/guards';

@UseGuards(AccessTokenGuard)
@Controller('user')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}
