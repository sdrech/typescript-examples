import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LobbyItem } from './lobby.entity';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { LobbyRepositoryProvider } from './lobby.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([LobbyItem]),
  ],
  providers: [
    LobbyService,
    LobbyRepositoryProvider
  ],
  controllers: [LobbyController],
})
export class LobbyModule {
}
