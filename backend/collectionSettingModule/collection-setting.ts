import { Collection } from 'fireorm';
import { Dictionary } from '../../custom';

export type CollectionSettingAssets = {
  backgroundLeft?: string,
  backgroundRight?: string,
  backgroundReward?: string,
  foregroundBottom?: string,
  foregroundGgb?: string,
  emptySlotFiller?: string,
};

@Collection('collectionSettings')
export class CollectionSetting {
  id!: string;
  name!: string;
  availableFromTier!: number;
  positionOfCollection!: number;
  rewardInCoins!: number;
  regularPrizesAmount!: number;
  goldenStickersAmount!: number;
  icon!: string;
  iconMini!: string;
  assets?: CollectionSettingAssets;
  isComingSoon!: boolean;
  isActive!: boolean;
  cabinetSizeByRows!: number;
  cabinetSizeByColumns!: number;
  allowedToRecompleteAmount!: number;
  rulesInfo?: string;
  positionInCategory?: number;      // position of subcategory (which is collection.titleInCategory)
  titleInCategory?: string;
  isDefault?: boolean;
  rewardForMilestones?: Dictionary<number>;

  createdAt?: number;
  updatedAt?: number;

  constructor() {
    this.updatedAt = Date.now();
    this.createdAt = Date.now();
  }

}

export type CollectionSettingWithoutId = Omit<CollectionSetting, 'id'>;

