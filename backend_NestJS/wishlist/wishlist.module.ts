import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { WishlistItem } from './wishlist.entity';
import { WishlistRepositoryProvider } from './wishlist.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([WishlistItem]),
  ],
  controllers: [WishlistController],
  providers: [
    WishlistService,
    WishlistRepositoryProvider,
  ]
})
export class WishlistModule {
}
