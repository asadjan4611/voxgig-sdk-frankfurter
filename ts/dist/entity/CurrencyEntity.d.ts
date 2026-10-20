import { FrankfurterEntityBase } from '../FrankfurterEntityBase';
import type { FrankfurterSDK } from '../FrankfurterSDK';
import type { Control } from '../types';
import type { Currency, CurrencyLoadMatch, CurrencyListMatch } from '../FrankfurterTypes';
declare class CurrencyEntity extends FrankfurterEntityBase<Currency> {
    constructor(client: FrankfurterSDK, entopts: any);
    make(this: CurrencyEntity): CurrencyEntity;
    load(this: any, reqmatch?: CurrencyLoadMatch, ctrl?: Control): Promise<CurrencyEntity>;
    list(this: any, reqmatch?: CurrencyListMatch, ctrl?: Control): Promise<CurrencyEntity[]>;
}
export { CurrencyEntity };
