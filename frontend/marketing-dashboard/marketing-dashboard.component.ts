import { Component, ViewChild } from '@angular/core';
import { FilterService } from '../../services/filter.service';
import { UtilsService } from '../../services/utils.service';
import { SettingsRepositoryService } from '../../repository/settings-repository.service';
import { MarketingGraphItem, MarketingRevenueAndCostDto, MarketPlatform } from '../../models/marketing-analytics';
import { UserStatisticFilter } from '../../models/dashboard';
import { UserFilterComponent } from '../../items/user-filter/user-filter.component';
import { ChartOption, ChartType, colorsList, marketingChartTypes } from './marketing.chart.settings';
import { ChartSettings } from '../../models/chart-settings';
import { MarketingDashboardService } from '../../services/marketing-dashboard.service';
import { ChartDataSets } from 'chart.js';

@Component({
  selector: 'app-marketing-dashboard',
  templateUrl: './marketing-dashboard.component.html',
  styleUrls: ['./marketing-dashboard.component.sass']
})

export class MarketingDashboardComponent {
  @ViewChild(UserFilterComponent)
  userFilter: UserFilterComponent;

  charts: ChartOption[] = [
    {type: 'roas', platform: 'ANDROID', options: {...marketingChartTypes.roasAndr}},
    {type: 'roas', platform: 'IOS', options: {...marketingChartTypes.roasIos}},
    {type: 'cost', platform: 'ANDROID', options: {...marketingChartTypes.costAndr}},
    {type: 'cost', platform: 'IOS', options: {...marketingChartTypes.costIos}},
    {type: 'revenue', platform: 'ANDROID', options: {...marketingChartTypes.revenueAndr}},
    {type: 'revenue', platform: 'IOS', options: {...marketingChartTypes.revenueIos}},
  ];

  isFilterSubmitted = false;

  constructor(
    private filterService: FilterService,
    private marketingService: MarketingDashboardService,
    public utilsService: UtilsService,
    public settings: SettingsRepositoryService,
  ) {
  }

  async getSourceData(filter: UserStatisticFilter): Promise<MarketingRevenueAndCostDto[]> {
    try {
      return await this.marketingService.getRevenueAndCostData(filter);
    } catch (error) {
      console.log(error);
      this.utilsService.snackBarActive(error.message);
    }
  }

  toHideGraph({name, platform}: MarketingGraphItem): boolean {
    if (name === 'NONE (ORGANIC)') {
      return true;
    }
    if (name === 'APPLE SEARCH ADS' && platform === 'ANDROID') {
      return true;
    }
    if (name === 'OTHERS' && platform === 'IOS') {
      return true;
    }

    return false;
  }

  drawChart(data: MarketingGraphItem[], options?: ChartSettings) {
    let i = 0;
    options.datasets = [];

    data.forEach(item => {
      const dataset: ChartDataSets = {
        label: item.name,
        yAxisID: 'A',
        data: item.data,
        borderColor: colorsList[i],
        borderWidth: 2,
        hidden: this.toHideGraph(item)
      };

      i++;
      options.datasets.push(dataset);
    });

    options.labels = [
      'day0',
      'day1',
      'day7',
      'day30',
      'day60',
      'day180',
      'day365',
    ];
  }

  prepareDataForCharts(data: MarketingRevenueAndCostDto[], type: ChartType, platformToShow: MarketPlatform): MarketingGraphItem[] {
    return data
      .filter(item => item.platform === platformToShow)
      .map(item => {
        switch (type) {
          case 'roas':
            return {
              name: item.trafficSource,
              platform: item.platform,
              data: this.rounding([
                item.paymentsD0 / (item.adCostSum || 1) * 100,
                item.paymentsD1 / (item.adCostSum || 1) * 100,
                item.paymentsD7 / (item.adCostSum || 1) * 100,
                item.paymentsD30 / (item.adCostSum || 1) * 100,
                item.paymentsD60 / (item.adCostSum || 1) * 100,
                item.paymentsD180 / (item.adCostSum || 1) * 100,
                item.paymentsD365 / (item.adCostSum || 1) * 100
              ])
            };
          case 'cost':
            return {
              name: item.trafficSource,
              platform: item.platform,
              data: this.rounding([
                item.adCostSum
              ])
            };
          case 'revenue':
            return {
              name: item.trafficSource,
              platform: item.platform,
              data: this.rounding([
                item.paymentsD0,
                item.paymentsD1,
                item.paymentsD7,
                item.paymentsD30,
                item.paymentsD60,
                item.paymentsD180,
                item.paymentsD365
              ])
            };
          default:
            throw new Error('Invalid chart type');
        }
    });
  }

  loadSingleChart(data: MarketingRevenueAndCostDto[], chartOption: ChartOption, filter: UserStatisticFilter) {
    chartOption.options.progress = true;

    this.drawChart(this.prepareDataForCharts(data, chartOption.type, chartOption.platform), chartOption.options);

    chartOption.options.progress = false;
  }

  async load(filter: UserStatisticFilter) {
    this.isFilterSubmitted = true;

    const data = await this.getSourceData(filter);
    this.charts.map(chartOption => this.loadSingleChart(data, chartOption, filter));

    this.userFilter.isLoadingResults = false;
  }

  rounding(items: number[]): number[] {
    return items.map(
      item => typeof item === 'number' ? this.utilsService.roundNum(item) : 0
    );
  }

}
