import { BigqueryCommon } from '../repository/bigquery/bigquery-common';
import { UserFilterDto } from '../model/dto/user-filter.dto';
import { DateRangeFilterDto } from '../model/dto/date-range-filter-dto';
import { NumberUtils } from '../util/number';
import {
  MarketingCostFilter,
  MarketingService,
  PerDatesRawSinglePerPlatformsAdsCosts,
} from './marketing-service';
import {
  MarketPlatforms,
  MarketingAnalyticsResponse,
  MarketingRevenueAndCostDto
} from '../modules/admin/report/dto/marketing-analytics.dto';

export class AdminService {

  /**
   * Get Cohort and Daily data for ROAS & ROI
   *
   * @param userFilters
   * @param dateRange
   * @param timezone
   */
  static async getMarketingAnalytics(userFilters: UserFilterDto, dateRange: DateRangeFilterDto, timezone: string): Promise<MarketingAnalyticsResponse> {
    const cohortDays = [0, 1, 7, 30, 60, 180, 365];
    const mainMediaSources = ['FACEBOOK ADS', 'GOOGLEADWORDS_INT', 'BYTEDANCEGLOBAL_INT', 'APPLE SEARCH ADS', 'NONE (ORGANIC)'];   // without 'FACEBOOK_PAGE_BUTTON'
    const supportedPlatforms: string[] = Object.values(MarketPlatforms);

    const [revenuesAndCostsCohort, revenuesAndCostsDaily, manualExtraCosts] = await Promise.all([
      BigqueryCommon.getMarketingCohortData(userFilters, dateRange, timezone, mainMediaSources, cohortDays),
      BigqueryCommon.getMarketingDailyData(userFilters, dateRange, timezone, mainMediaSources),
      MarketingService.getAdsManualCostPerDates(
        dateRange,
        'DAY',
        MarketingCostFilter.from(userFilters),
        timezone,
        !!userFilters.platform
      )
    ]);

    const extraCostsSum = this.prepareCostSumFromDaily(manualExtraCosts);
    revenuesAndCostsCohort.map(item => this.applyExtraCost(item, extraCostsSum, supportedPlatforms));

    return {
      revenuesAndCosts: revenuesAndCostsCohort.filter(item => supportedPlatforms.includes(item.platform)),
      marketingDataDaily: revenuesAndCostsDaily
    };
  }

  private static prepareCostSumFromDaily(marketingCosts: PerDatesRawSinglePerPlatformsAdsCosts): {[key: string]: number} {
    const results = {
      [MarketPlatforms.ANDROID]: 0,
      [MarketPlatforms.IOS]: 0
    };

    Object.values(marketingCosts).forEach(costItem => {
      results[MarketPlatforms.ANDROID] += costItem[MarketPlatforms.ANDROID] || 0;
      results[MarketPlatforms.IOS] += costItem[MarketPlatforms.IOS] || 0;
    });

    results[MarketPlatforms.ANDROID] = NumberUtils.round(results[MarketPlatforms.ANDROID], 2);
    results[MarketPlatforms.IOS] = NumberUtils.round(results[MarketPlatforms.IOS], 2);
    return results;
  }

  private static applyExtraCost(mainItem: MarketingRevenueAndCostDto,
                                extraCostList: {[key: string]: number},
                                desiredPlatforms: string[]): MarketingRevenueAndCostDto {
    if (!desiredPlatforms.includes(mainItem.platform) || mainItem.trafficSource !== 'OTHERS') {
      return mainItem;
    }

    mainItem.adCostSum += extraCostList[mainItem.platform] || 0;
    return mainItem;
  }

}
