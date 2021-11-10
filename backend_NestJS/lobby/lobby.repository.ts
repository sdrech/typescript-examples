import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm';
import { BooleanUtils } from '../utils/boolean-utils';
import { FindManyResult, Maybe, Optional, OrderCondition, OrderDirection } from '../utils/custom.types';
import { LobbyItem } from './lobby.entity';
import { ProviderUtils } from '../utils/provider-utils';
import { WishlistItem } from '../wishlist/wishlist.entity';
import { WIN_RATIO_ABTEST_DEFAULT_GROUP } from '../machine/machine.entity';

export abstract class AbstractLobbyRepository {
  abstract findOneByOldId(oldLobbyId: string): Promise<LobbyItem | undefined | null>;

  abstract findMany(
    filter: Partial<LobbyItem>,
    availableSkillTiers: [] | undefined,
    wishlistForUserId: Maybe<string>,
    orders: OrderCondition[],
    ordersCustom: {orderForSkillTier: number; orderForQueueVip: number; orderForQueueNonVip: number},
    limit?: Optional<number>,
    offset?: Optional<number>
  ): Promise<FindManyResult<LobbyItem>>;
}

@EntityRepository(LobbyItem)
export class MySqlLobbyRepository extends Repository<LobbyItem> implements AbstractLobbyRepository {
  findOneByOldId(id: string): Promise<LobbyItem | undefined | null> {
    return this.findOne(id);
  }

  private findNakedByFilter(
    filter: Partial<LobbyItem>,
    availableSkillTiers: [] | undefined,
    wishlistForUserId: Maybe<string>,
    orders: OrderCondition[],
    ordersCustom: {orderForSkillTier: number; orderForQueueVip: number; orderForQueueNonVip: number},
    limit: number,
    offset: number
  ): SelectQueryBuilder<LobbyItem> {
    const qb = this.createQueryBuilder('lobby').distinct(true);

    // Ordering
    orders.forEach((order) => {
      qb.addOrderBy(`lobby.${order.key}`, order.direction);
      if (order.key === 'isGoldenGiftBox') {
          qb.addSelect(
            // note: prize_skill_tier=0 is "new free" flag, prize_skill_tier>0 is "new vip" flag
            `IF ((prize_skill_tier > 0 && queue < ${ordersCustom.orderForQueueVip}) || `
            + `(prize_skill_tier = 0 && queue < ${ordersCustom.orderForQueueNonVip}), 0, 999)`,
            'queueOrder'
          ).addOrderBy('queueOrder', OrderDirection.ASC);
      }
    });

    // Filtering
    if (BooleanUtils.isBoolean(filter.isHidden)) {
      qb.andWhere('lobby.isHidden = :isHidden', {isHidden: filter.isHidden});
    }
    if (filter.countryId) {
      qb.andWhere('lobby.countryId = :countryId', {countryId: filter.countryId});
    }
    if (filter.oldCategoryId) {
      qb.andWhere('lobby.oldCategoryId = :oldCategoryId', {oldCategoryId: filter.oldCategoryId});
    }
    if (filter.collectionId) {
      qb.andWhere('lobby.collectionId = :collectionId', filter);
    }
    if (availableSkillTiers && availableSkillTiers.length > 0) {
      qb.andWhere('lobby.prizeSkillTier IN (:...skillTiers)', {skillTiers: availableSkillTiers});
    }
    if (BooleanUtils.isBoolean(filter.isMinQueue)) {
      qb.andWhere('lobby.isMinQueue = :isMinQueue', {isMinQueue: filter.isMinQueue});
    }

    if (wishlistForUserId) {
      const subQuery = qb.subQuery()
        .select('wishlist.oldPrizeId')
        .from(WishlistItem, 'wishlist')
        .where('wishlist.userId = :userId', {userId: wishlistForUserId})
        .getQuery();

      qb.andWhere(`lobby.oldPrizeId IN ${subQuery}`);
    }

    // temp functionality while AB-testing is actual
    if (filter.winRatioAbtestGroup !== 'all') {
      const winRatioAbtestGroup = filter.winRatioAbtestGroup ?? WIN_RATIO_ABTEST_DEFAULT_GROUP;
      qb.andWhere('(lobby.win_ratio_abtest_group = :winRatioAbtestGroup OR lobby.win_ratio_abtest_group IS NULL) ', {winRatioAbtestGroup});
    }
    // THE END of temp functionality

    return qb.limit(limit).offset(offset);
  }

  async findMany(
    filter: Partial<LobbyItem>,
    availableSkillTiers: [] | undefined,
    wishlistForUserId: Maybe<string>,
    orders: OrderCondition[],
    ordersCustom: {orderForSkillTier: number; orderForQueueVip: number; orderForQueueNonVip: number},
    limit = 100,
    offset = 0
  ): Promise<FindManyResult<LobbyItem>> {

    const qb = this.findNakedByFilter(
      filter, availableSkillTiers, wishlistForUserId, orders, ordersCustom, limit, offset
    );

    const [total, items] = await Promise.all([
      qb.getCount(),
      qb.getMany()
    ]);

    return { total, items };
  }
}

export const LobbyRepositoryProvider = ProviderUtils.makeTypeOrmRepositoryProvider(AbstractLobbyRepository, MySqlLobbyRepository);
