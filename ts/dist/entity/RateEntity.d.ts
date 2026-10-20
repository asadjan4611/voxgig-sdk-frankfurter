import { FrankfurterEntityBase } from '../FrankfurterEntityBase';
import type { FrankfurterSDK } from '../FrankfurterSDK';
import type { Control } from '../types';
import type { Rate, RateLoadMatch, RateListMatch } from '../FrankfurterTypes';
declare class RateEntity extends FrankfurterEntityBase<Rate> {
    constructor(client: FrankfurterSDK, entopts: any);
    make(this: RateEntity): RateEntity;
    load(this: any, reqmatch?: RateLoadMatch, ctrl?: Control): Promise<RateEntity>;
    list(this: any, reqmatch?: RateListMatch, ctrl?: Control): Promise<RateEntity[]>;
}
export { RateEntity };
