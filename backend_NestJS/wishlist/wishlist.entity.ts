import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';

export const WISHLIST_TABLE_NAME = 'wishlist';

@Entity(WISHLIST_TABLE_NAME)
export class WishlistItem {

  @PrimaryColumn({ type: 'char', name: 'user_id', length: 50 })
  userId: string;

  @PrimaryColumn('varchar', {name: 'old_prize_id', length: 100})
  oldPrizeId: string;

  @Column('timestamp', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt?: Date;
}
