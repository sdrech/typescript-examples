import { UserFilterDto } from '../../../../model/dto/user-filter.dto';
import { DateRangeFilterDto, DateUnit } from '../../../../model/dto/date-range-filter-dto';

export type MarketingAnalyticsFilter = {
  userFilter: UserFilterDto,
  dateRange: DateRangeFilterDto,
  groupBy: DateUnit,
  timezone: string
};

export type MarketingCostDto = {
  platform: string,
  costs: number
};

export type MarketingBasicInfo = {
  platform: string,
  trafficSource: string
};

export type MarketingRevenueAndCostDto = MarketingBasicInfo & {
  paymentsD0: number,
  paymentsD1: number,
  paymentsD7: number,
  paymentsD30: number,
  paymentsD60: number,
  paymentsD180: number,
  paymentsD365: number,
  adCostSum: number
};

export type MarketingDailyDto = MarketingBasicInfo & {
  date: string,
  paymentsSum: number,
  feesSum: number,
  adCostSum: number
};

export type MarketingAnalyticsResponse = {
  revenuesAndCosts: MarketingRevenueAndCostDto[],
  marketingDataDaily: MarketingDailyDto[],
};

export enum MarketPlatforms {
  ANDROID = 'ANDROID',
  IOS = 'IOS'
}
