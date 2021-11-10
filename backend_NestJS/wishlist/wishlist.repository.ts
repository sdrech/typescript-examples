import { EntityRepository, Repository } from 'typeorm';
import { WishlistItem } from './wishlist.entity';
import { ProviderUtils } from '../utils/provider-utils';

export abstract class AbstractWishlistRepository {

  abstract findMany(userId: string): Promise<WishlistItem[]>;

  abstract saveItem(data: Partial<WishlistItem>): Promise<boolean>;

  abstract removeItem(wishlist: WishlistItem): Promise<boolean>;
}

@EntityRepository(WishlistItem)
export class MySqlWishlistRepository extends Repository<WishlistItem> implements AbstractWishlistRepository {

  async findMany(userId: string): Promise<WishlistItem[]> {
    const data = await this.find({
      select: ['oldPrizeId'],
      where: {userId}
    });

    return data;
  }

  async saveItem(data: Partial<WishlistItem>): Promise<boolean> {
    try {
      await this.save(data);
    } catch (error) {
      return false;
    }

    return true;
  }

  async removeItem({userId, oldPrizeId}: WishlistItem): Promise<boolean> {
    const result = await this.delete({userId, oldPrizeId});
    return result.affected === 1;
  }

}

export const WishlistRepositoryProvider = ProviderUtils.makeTypeOrmRepositoryProvider(AbstractWishlistRepository, MySqlWishlistRepository);
