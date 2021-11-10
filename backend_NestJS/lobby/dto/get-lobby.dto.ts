import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { OrderCondition, toOrderCondition } from '../../utils/custom.types';
import { ArrayUtils } from '../../utils/array-utils';
import { BooleanUtils } from '../../utils/boolean-utils';
import { LobbyItem } from '../lobby.entity';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Exclude()
class LobbyOrderCondition extends OrderCondition {
  @IsIn(['isActive', 'position', 'id', 'isGoldenGiftBox'])
  @Expose()
  key!: string;
}

@Exclude()
class LobbyCustomOrderCondition {
  @IsIn(['prizeSkillTier', 'queue.forVip', 'queue.forNonVip'])
  @Expose()
  key!: string;
}

@Exclude()
export class LobbyRequestDto extends PaginationDto {
  @Expose()
  @IsBoolean()
  @IsOptional()
  @Transform(v => BooleanUtils.parseBoolean(v))
  @ApiProperty({ type: Boolean })
  isHidden?: boolean;

  @Expose()
  @IsString()
  @IsOptional()
  countryId?: string;

  @Expose()
  @IsOptional()
  @Transform((v) => ArrayUtils.fromString(v, ','))
  @ApiProperty({ type: [String] })
  prizeSkillTiers?: [];

  @Expose()
  @IsString()
  @IsOptional()
  oldCategoryId?: string;

  @Expose()
  @IsString()
  @IsOptional()
  collectionId?: string;

  @Expose()
  @IsString()
  @IsOptional()
  categoryAlias?: string;

  @Expose()
  @ValidateNested({each: true})
  @Transform((v) => toOrderCondition(v, LobbyOrderCondition))
  @ApiProperty({ type: Object })
  order!: LobbyOrderCondition[];
}

export class GetLobbyWithTotalAmountRO {
  items: LobbyItem[];
  total: number;
}
