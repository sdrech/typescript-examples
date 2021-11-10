import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { UserWishlistFilterDto, UserWishlistResponseDto } from './dto/get-user-wishlist.dto';
import { WishlistItem } from './wishlist.entity';

@Controller('v0/wishlist')
export class WishlistController {

  constructor(private readonly service: WishlistService) {}

  @Get()
  async getManyLegacy(@Query() {userId}: UserWishlistFilterDto): Promise<UserWishlistResponseDto> {
    const items = await this.service.findMany(userId);
    return new UserWishlistResponseDto(items);
  }

  @Post()
  async create(@Body() wishlist: WishlistItem): Promise<void> {
    const result = await this.service.create(wishlist);
    if (!result) {
      throw new HttpException('Wrong oldPrizeId', HttpStatus.CONFLICT);
    }
  }

  @Delete()
  async delete(@Query() wishlist: WishlistItem) {
    const result = await this.service.remove(wishlist);
    if (!result) {
      throw new HttpException('Wrong incoming params', HttpStatus.CONFLICT);
    }
  }

}
