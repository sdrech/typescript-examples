import {
  CollectionSettingRepository,
  FindCollectionSettingParams
} from '../repository/firestore/collection-setting-repository';
import {
  CollectionSetting,
  CollectionSettingWithoutId
} from '../model/firestore/collection-setting';
import { Nullable } from '../custom';

export class CollectionSettingService {

  private static get repository() {
    return CollectionSettingRepository.getInstance();
  }

  private static getMany(params?: FindCollectionSettingParams): Promise<CollectionSetting[]> {
    return this.repository.findManyByParams(params);
  }

  static createMany(collectionSettings: CollectionSetting[]) {
    return this.repository.createByBatch(collectionSettings);
  }

  static getDefaultOne(): Promise<Nullable<CollectionSetting>> {
    return this.repository.findOneByParams({isDefault: true, isActive: true});
  }

  static getAll(): Promise<CollectionSetting[]> {
    return this.getMany({orderByAsc: 'positionOfCollection'});
  }

  static async getManyAvailable(onlyDefaultCollection?: boolean): Promise<CollectionSetting[]> {
    const params: FindCollectionSettingParams = {
      isActive: true,
      isComingSoon: false
    };

    if (onlyDefaultCollection) {
      params.isDefault = true;
    }

    const collectionsList = await this.getMany(params);
    return collectionsList.sort((a, b) =>
      a.positionInCategory < b.positionInCategory ? -1 : 1
    );
  }

  static async getManyAvailableInOldSorting(): Promise<CollectionSetting[]> {
    const collectionsList = await this.getMany({isActive: true, isComingSoon: false});
    return collectionsList.sort((a) => a.isDefault ? -1 : 1);
  }

  static getManyForCollectionsHub(): Promise<CollectionSetting[]> {
    return this.getMany({orderByAsc: 'positionOfCollection'});
  }

  static async getById(collectionId: string): Promise<CollectionSetting> {
    const collectionSetting = await this.repository.findById(collectionId);
    if (!collectionSetting) {
      throw new Error(`collectionSetting not found by id: "${collectionId}"`);
    }

    return collectionSetting;
  }

  static async getByTier(availableFromTier: number): Promise<CollectionSetting> {
    const collectionSetting = await this.repository.findOneByParams({availableFromTier, isActive: true});
    if (!collectionSetting) {
      throw new Error(`CollectionSetting is not found by availableFromTier: "${availableFromTier}"`);
    }

    return collectionSetting;
  }

  static async create(collection: CollectionSettingWithoutId): Promise<CollectionSetting> {
    return this.repository.create(collection);
  }

  static update(id: string, collection: CollectionSettingWithoutId): Promise<CollectionSetting> {
    return this.repository.update({...collection, id});
  }

}
