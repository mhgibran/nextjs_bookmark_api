import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
  Param,
  ParseIntPipe,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorators';
import { AccessTokenGuard } from 'src/auth/guards';
import { BookmarkService } from './bookmark.service';
import {
  CreateBookmarkDto,
  UpdateBookmarkDto,
} from './dto';

@UseGuards(AccessTokenGuard)
@Controller('bookmark')
export class BookmarkController {
  constructor(
    private bookmarkService: BookmarkService,
  ) {}

  @Get()
  getBookmark(@GetUser('id') userId: number) {
    return this.bookmarkService.getBookmark(
      userId,
    );
  }

  @Get(':id')
  getBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.getBookmarkById(
      userId,
      bookmarkId,
    );
  }

  @Post()
  createBookmark(
    @GetUser('id') userId: number,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(
      userId,
      dto,
    );
  }

  @Patch(':id')
  updateBookmark(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: UpdateBookmarkDto,
  ) {
    return this.bookmarkService.updateBookmark(
      userId,
      bookmarkId,
      dto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  destroyBookmark(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.destroyBookmark(
      userId,
      bookmarkId,
    );
  }
}
