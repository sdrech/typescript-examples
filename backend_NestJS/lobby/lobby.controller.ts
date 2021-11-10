import { Controller, Get, Put, Param, Options, HttpException, Query } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { LobbyItem } from './lobby.entity';
import { GetLobbyWithTotalAmountRO, LobbyRequestDto } from './dto/get-lobby.dto';
import { ApiOkResponse } from '@nestjs/swagger';


@Controller()
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Options('lobby')
  showAPIs(): object {
    return {
      'API': [
        'GET /api/v0/lobby',
        'GET /api/v0/lobby/:machineId_prizeId'
      ],
    };
  }

  @Get('v0/lobby')
  @ApiOkResponse({ type: GetLobbyWithTotalAmountRO })
  async getMany(@Query() getManyDto: LobbyRequestDto): Promise<GetLobbyWithTotalAmountRO> {
    return this.lobbyService.findMany(getManyDto);
  }

  @Get('v0/lobby/:id')
  async getItemById(@Param('id') id: string): Promise<LobbyItem> {
    const item = await this.lobbyService.findById(id);

    const errors = { Prize: 'Item by ID is not found' };
    if (!item) throw new HttpException({ errors }, 404);

    return (item);
  }

}
