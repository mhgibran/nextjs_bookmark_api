import {
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateBookmarkDto,
  UpdateBookmarkDto,
} from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmark(userId: number) {
    return await this.prisma.bookmark.findMany({
      where: {
        user_id: userId,
      },
    });
  }

  async getBookmarkById(
    userId: number,
    bookmarkId: number,
  ) {
    return await this.prisma.bookmark.findFirst({
      where: {
        user_id: userId,
        id: bookmarkId,
      },
    });
  }

  async createBookmark(
    userId: number,
    dto: CreateBookmarkDto,
  ) {
    const bookmark =
      await this.prisma.bookmark.create({
        data: {
          user_id: userId,
          ...dto,
        },
      });

    return bookmark;
  }

  async updateBookmark(
    userId: number,
    bookmarkId: number,
    dto: UpdateBookmarkDto,
  ) {
    // check bookmark is found
    await this.findBookmark(userId, bookmarkId);

    // update bookmark
    return await this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async destroyBookmark(
    userId: number,
    bookmarkId: number,
  ) {
    // check bookmark is found
    await this.findBookmark(userId, bookmarkId);

    // delete bookmark
    return await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }

  async findBookmark(
    userId,
    bookmarkId,
  ): Promise<{ id: number; user_id: number }> {
    const bookmark =
      await this.prisma.bookmark.findFirst({
        where: {
          id: bookmarkId,
        },
      });

    if (!bookmark) {
      throw new NotFoundException(
        'Bookmark not found!',
      );
    }

    if (bookmark.user_id !== userId) {
      throw new ForbiddenException(
        'Access denied!',
      );
    }

    return bookmark;
  }
}
