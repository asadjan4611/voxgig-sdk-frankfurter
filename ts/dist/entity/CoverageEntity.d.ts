import { FrankfurterEntityBase } from '../FrankfurterEntityBase';
import type { FrankfurterSDK } from '../FrankfurterSDK';
import type { Control } from '../types';
import type { Coverage, CoverageLoadMatch } from '../FrankfurterTypes';
declare class CoverageEntity extends FrankfurterEntityBase<Coverage> {
    constructor(client: FrankfurterSDK, entopts: any);
    make(this: CoverageEntity): CoverageEntity;
    load(this: any, reqmatch?: CoverageLoadMatch, ctrl?: Control): Promise<CoverageEntity>;
}
export { CoverageEntity };
