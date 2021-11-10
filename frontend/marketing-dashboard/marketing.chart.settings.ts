import { ChartSettings } from '../../models/chart-settings';
import { MarketPlatform } from '../../models/marketing-analytics';

export type ChartType = 'roas' | 'cost' | 'revenue';

export interface ChartOption {
  type: ChartType;
  platform: MarketPlatform;
  options: ChartSettings;
}

export const colorsList = [
  'purple',
  'deeppink',
  '#4285f4',  // blue
  'green',
  '#f4b400',  // orange
  'yellow',
  'cyan',
  'olive',
  '#db4437',  // red
  'brown',
  'bronze',
  'tan',
  'steelblue',
  'black'
];

const baseMarketingChartOption: ChartSettings = {
  name: '',
  labels: [
    'day0',
    'day1',
    'day7',
    'day30',
    'day60',
    'day180',
    'day365',
  ],
  options: {
    scales: {
      yAxes: [
        {
          id: 'A',
          type: 'linear',
          position: 'left',
          ticks: {
            beginAtZero: true
          }
        }
      ],
    },
    responsive: true
  },
  datasets: [],
  legend: true,
  colors: [{}],
  progress: false,
  chartType: 'line'
};

export const marketingChartTypes: {[key: string]: ChartSettings} = {
  roasAndr: {
    ...baseMarketingChartOption,
    name: 'Cohort ROAS (%%) - Android',
  },
  roasIos: {
    ...baseMarketingChartOption,
    name: 'Cohort ROAS (%%) - iOS',
  },
  revenueAndr: {
    ...baseMarketingChartOption,
    name: 'Cohort Revenues ($$) - Android',
  },
  revenueIos: {
    ...baseMarketingChartOption,
    name: 'Cohort Revenues ($$) - iOS',
  },
  costAndr: {
    ...baseMarketingChartOption,
    name: 'Cohort Media Costs ($$) - Android',
  },
  costIos: {
    ...baseMarketingChartOption,
    name: 'Cohort Media Costs ($$) - iOS',
  },
};
