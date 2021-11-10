import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { WishlistItem } from '../wishlist.entity';

@Exclude()
export class UserWishlistFilterDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export class UserWishlistResponseDto {
  private prizeIds: string[] = [];

  constructor(items: Array<Partial<WishlistItem>>) {
    items.forEach(wishItem => {
      if (wishItem.oldPrizeId) {
        this.prizeIds.push(wishItem.oldPrizeId);
      }
    });
  }
}
