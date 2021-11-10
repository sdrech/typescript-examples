import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsAdminGuard } from '../../../guards/is-admin.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { AdminAuthDecorators } from '../../../dto-decorators/auth-decorators';
import { UserFilterDto } from '../../../model/dto/user-filter.dto';
import { DateRangeFilterDto } from '../../../model/dto/date-range-filter-dto';
import { AdminService } from '../../../service/admin-service';
import { GroupByDatepartDto } from '../../../model/dto/group-by-datepart-dto';
import { TimezoneDto } from '../../../model/dto/timezone-dto';
import { GetFreeRoundReportResultDto } from './dto/get-free-round-report-result.dto';
import { MarketingAnalyticsResponse } from './dto/marketing-analytics.dto';

@Controller('admin')
@ApiTags('Admin - Report')
@UseGuards(IsAdminGuard, RolesGuard)
export class AdminMarketingAnalyticsController {
  get adminService() {
    return AdminService;
  }

  @Get('marketing-analytics')
  @Roles('super_user')
  @ApiOperation({
    summary: '[WEB ADMIN] Get MarketingAnalytics report',
    description: 'Permission: **super_user**'
  })
  @AdminAuthDecorators()
  @ApiResponse({status: HttpStatus.OK, type: GetFreeRoundReportResultDto})
  async getMarketingAnalyticsReport(@Query() userFilter: UserFilterDto,
                                    @Query() dateRange: DateRangeFilterDto,
                                    @Query() groupByDatePartDto: GroupByDatepartDto,
                                    @Query() timezoneDto: TimezoneDto): Promise<MarketingAnalyticsResponse> {
    const items = await this.adminService.getMarketingAnalytics(
      userFilter,
      dateRange,
      timezoneDto.timezone
    );

    return items;
  }

}
