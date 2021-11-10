import { CollectionSetting } from '../firestore/collection-setting';
import { classToPlain, Exclude, Expose, plainToClass, Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateIf, ValidateNested } from 'class-validator';
import { Dictionary } from '../../custom';
import { NumberUtils } from '../../util/number';

const isNotComingSoon = (dto: Pick<CollectionSettingDto, 'isComingSoon'>): boolean => !dto.isComingSoon;

class Assets {

  @Expose()
  @IsString()
  @IsUrl()
  @IsOptional()
  @IsNotEmpty()
  foregroundGgb?: string;

  @Expose()
  @IsString()
  @IsUrl()
  @IsOptional()
  @IsNotEmpty()
  backgroundLeft?: string;

  @Expose()
  @IsString()
  @IsUrl()
  @IsOptional()
  @IsNotEmpty()
  backgroundRight?: string;

  @Expose()
  @IsString()
  @IsUrl()
  @IsOptional()
  @IsNotEmpty()
  backgroundReward?: string;

  @Expose()
  @IsString()
  @IsUrl()
  @IsOptional()
  @IsNotEmpty()
  foregroundBottom?: string;

  @Expose()
  @IsString()
  @IsUrl()
  @IsOptional()
  @IsNotEmpty()
  emptySlotFiller?: string;

}

@Exclude()
export class CollectionSettingDto {

  @Expose()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Expose()
  @ValidateIf(isNotComingSoon)
  @IsInt()
  availableFromTier?: number;

  @Expose()
  @ValidateIf(isNotComingSoon)
  @IsInt()
  regularPrizesAmount?: number;

  @Expose()
  @ValidateIf(isNotComingSoon)
  @IsInt()
  goldenStickersAmount?: number;

  @Expose()
  @ValidateIf(isNotComingSoon)
  @IsInt()
  rewardInCoins?: number;

  @Expose()
  @ValidateIf(isNotComingSoon)
  @IsInt()
  cabinetSizeByRows?: number;

  @Expose()
  @ValidateIf(isNotComingSoon)
  @IsInt()
  cabinetSizeByColumns?: number;

  @Expose()
  @ValidateIf(isNotComingSoon)
  @IsInt()
  allowedToRecompleteAmount?: number;

  @Expose()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  rulesInfo?: string;

  @Expose()
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  icon!: string;

  @Expose()
  @IsString()
  @IsUrl()
  @ValidateIf(isNotComingSoon)
  @IsNotEmpty()
  iconMini?: string;

  @Type(() => Assets)
  @ValidateNested()
  @Expose()
  assets!: Assets;

  @Expose()
  @ValidateIf(isNotComingSoon)
  @Transform(value => value ?? {})
  rewardForMilestones!: Dictionary<number>;

  @Expose()
  @IsString()
  @IsNotEmpty()
  titleInCategory!: string;

  @Expose()
  @IsInt()
  positionOfCollection!: number;

  @Expose()
  @ValidateIf(isNotComingSoon)
  @IsInt()
  positionInCategory?: number;

  @Expose()
  @Transform(Boolean)
  isComingSoon!: boolean;

  @Expose()
  @Transform(Boolean)
  isDefault!: boolean;

  @Expose()
  @Transform(Boolean)
  isActive!: boolean;

  toModel(): CollectionSetting {
    const model = plainToClass(CollectionSetting, this);
    // Firestore doesn't support JavaScript objects with custom prototypes
    model.assets = classToPlain(model.assets);

    return model;
  }

  isRewardForMilestonesIsValid(): boolean {
    if (this.isComingSoon && !Object.keys(this.rewardForMilestones).length) {
      return true;
    }

    if (!NumberUtils.isInt(this.goldenStickersAmount)
      || !NumberUtils.isInt(this.regularPrizesAmount)
      || !NumberUtils.isInt(this.rewardInCoins)) {
      return false;
    }

    let rewardForMilestonesSum = 0;

    for (const [key, value] of Object.entries(this.rewardForMilestones)) {
      const keyNumber = Number(key);

      if (keyNumber && keyNumber <= (this.goldenStickersAmount + this.regularPrizesAmount)) {
        rewardForMilestonesSum += value;
      } else {
        return false;
      }
    }

    return this.rewardInCoins === rewardForMilestonesSum;
  }

}
