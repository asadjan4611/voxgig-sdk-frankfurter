import { FrankfurterEntityBase } from '../FrankfurterEntityBase';
import type { FrankfurterSDK } from '../FrankfurterSDK';
import type { Control } from '../types';
import type { Provider, ProviderLoadMatch, ProviderListMatch } from '../FrankfurterTypes';
declare class ProviderEntity extends FrankfurterEntityBase<Provider> {
    constructor(client: FrankfurterSDK, entopts: any);
    make(this: ProviderEntity): ProviderEntity;
    load(this: any, reqmatch?: ProviderLoadMatch, ctrl?: Control): Promise<ProviderEntity>;
    list(this: any, reqmatch?: ProviderListMatch, ctrl?: Control): Promise<ProviderEntity[]>;
}
export { ProviderEntity };
