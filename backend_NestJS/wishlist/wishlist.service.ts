import { Injectable } from '@nestjs/common';
import { WishlistItem } from './wishlist.entity';
import { AbstractWishlistRepository } from './wishlist.repository';

@Injectable()
export class WishlistService {
  constructor(
    private readonly repo: AbstractWishlistRepository) {
  }

  create(wishlist: WishlistItem): Promise<boolean> {
    return this.repo.saveItem(wishlist);
  }

  remove(wishlist: WishlistItem): Promise<boolean> {
    return this.repo.removeItem(wishlist);
  }

  findMany(userId: string): Promise<WishlistItem[]> {
    return this.repo.findMany(userId);
  }

}
