import { Column, Entity } from 'typeorm';
import { Optional } from '../utils/custom.types';

@Entity('lobby')
export class LobbyItem {
  @Column('int', {primary: true, name: 'id', comment: 'complex & merged: machineId_prizeId'})
  id: string;

  @Column('char', {name: 'old_categ_id', length: 36, select: false, comment: 'extended from CATEGORIES'})
  oldCategoryId: string;

  @Column('char', {name: 'country_id', length: 3, select: false, comment: 'extended from PRIZES-per-Countries'})
  countryId: string;

  @Column('bigint', {
    name: 'became_new_at',
    nullable: true,
    select: false,
    comment: 'extended from PRIZES',
  })
  becameNewAt: string | null;

  @Column({type: 'int', name: 'prize_id', select: false})
  prizeId: number;

  @Column('varchar', {name: 'old_prize_id', length: 100, comment: 'extended from PRIZES'})
  oldPrizeId: string;

  @Column('varchar', {name: 'name', length: 100, comment: 'extended from PRIZES'})
  name: string;

  @Column('int', {
    name: 'original_cost',
    nullable: true,
    select: false,
  })
    // to be ready for "per country" game cost
  gameCost: number | null;

  @Column('char', {name: 'short_name', nullable: true, length: 50, comment: 'extended from PRIZES'})
  shortName: string | null;

  @Column('varchar', {name: 'prize_description', nullable: true, length: 255, comment: 'extended from PRIZES'})
  description: string | null;

  @Column('text', {name: 'prize_image', nullable: true, comment: 'extended from PRIZES'})
  prizeImage: string | null;

  @Column('tinyint', {name: 'prize_skill_tier', width: 1, nullable: true, comment: 'extended from PRIZES'})
  prizeSkillTier: number;

  @Column('smallint', {name: 'position', default: 0, comment: 'extended from PRIZES'})
  position: number;

  @Column('boolean', {name: 'is_vip', default: 0, comment: 'extended from PRIZES'})
  isVip: boolean;

  @Column('char', {name: 'collection_id', nullable: true, default: null, length: 20})
  collectionId: string | null;

  ///

  @Column('boolean', {name: 'is_coming_soon', default: 0, comment: 'extended from MACHINES-PRIZES'})
  isComingSoon: boolean;

  @Column('boolean', {name: 'is_hidden', default: 0, comment: 'extended from MACHINES-PRIZES'})
  isHidden: boolean;

  @Column('boolean', {
    name: 'is_new',
    default: 0,
    comment: 'complex, based on: becameNewAt, isComingSoon and CURRENT_TIME',
  })
  isNew: boolean;

  ///

  @Column({type: 'int', name: 'machine_id', select: false})
  machineId: number;

  @Column('char', {name: 'old_machine_id', length: 30, comment: 'extended from MACHINES'})
  oldMachineId: string;

  @Column('char', {
    name: 'title',
    nullable: true,
    select: false,
    length: 50,
    comment: 'extended from MACHINES'
  })
    // TODO: consider removing from view
  title: string | null;

  @Column('boolean', {name: 'is_active', default: 0, comment: 'extended from MACHINES'})
  isActive: boolean;

  @Column('varchar', {
    name: 'machine_info',
    nullable: true,
    length: 200,
    comment: 'extended from MACHINES; ToDo: remove',
  })
  machineInfo: string | null;

  ///

  @Column('smallint', {name: 'watchers', default: 0, comment: 'extended from MACHINES-realtime'})
  watchers: number;

}
