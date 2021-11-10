import { Injectable } from '@nestjs/common';
import { LobbyItem } from './lobby.entity';
import { AbstractLobbyRepository } from './lobby.repository';
import { LobbyRequestDto } from './dto/get-lobby.dto';
import { FindManyResult } from '../utils/custom.types';
import { CATEGORY_ALIAS_FAVORITE } from '../category/category.entity';

@Injectable()
export class LobbyService {
  constructor(
    private readonly lobbyRepository: AbstractLobbyRepository) {
  }

  findById(id: string): Promise<LobbyItem | undefined | null> {
    return this.lobbyRepository.findOneByOldId(id);
  }

  findMany(dto: LobbyRequestDto): Promise<FindManyResult<LobbyItem>> {
    const wishlistForUserId = dto.categoryAlias === CATEGORY_ALIAS_FAVORITE ? dto.userId : undefined;

    if (wishlistForUserId) {
      delete(dto.oldCategoryId);
      delete(dto.collectionId);
      delete(dto.prizeSkillTiers);
    }

    return this.lobbyRepository.findMany(
      dto,
      dto.prizeSkillTiers,
      wishlistForUserId || undefined,
      dto.order,
      dto.limit, dto.offset
    );
  }
}
