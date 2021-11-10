export type MarketPlatform = 'ANDROID' | 'IOS';
export type MarketTrafficSource = 'OVERALL' | 'FACEBOOK ADS' | 'GOOGLEADWORDS_INT' | 'BYTEDANCEGLOBAL_INT' | 'APPLE SEARCH ADS' | 'NONE (ORGANIC)' | 'OTHERS';

export type MarketingRevenueAndCostDto = {
  platform: MarketPlatform,
  trafficSource: MarketTrafficSource,
  paymentsD0: number,
  paymentsD1: number,
  paymentsD7: number,
  paymentsD30: number,
  paymentsD60: number,
  paymentsD180: number,
  paymentsD365: number,
  adCostSum: number
};

export type MarketingDailyDto = {
  date: string,
  platform: MarketPlatform,
  trafficSource: MarketTrafficSource,
  paymentsSum: number,
  feesSum: number,
  adCostSum: number
};

export type MarketingAnalyticsResponse = {
  revenuesAndCosts: MarketingRevenueAndCostDto[],
  marketingDataDaily: MarketingDailyDto[],
};

export type MarketingGraphItem = {
  name: MarketTrafficSource,
  platform: MarketPlatform,
  data: number[]
};

export type MarketingGroupedDailyData = {
  [trafficSource: string]: number[]
};
