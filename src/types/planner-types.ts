import { IsOldOperatorPlans, OldOperatorPlans, OperatorPlans } from "@/types/plans";
import { Item, Operator, Recipe } from "@/types/outputdata";

// key is item id, value is quantity
type Inventory = { [key: string]: number; };
type EventGains = { [key: string]: Inventory; };
type ItemWithRecipe = Item & { recipe: Recipe };
type EXPItem = Item & { gainExp: number; };

class SelectedOperator {
    operator: Operator;
    plans: OperatorPlans;
    active: boolean;
    sort: number;

    constructor(operator: Operator, plans?: OldOperatorPlans | OperatorPlans, active: boolean = true, sort: number = 9999999999999) {
        this.operator = operator;
        this.active = active;
        this.sort = sort;
        
        if (!plans) {
            this.plans = new OperatorPlans();
        } else if (IsOldOperatorPlans(plans)) {
            this.plans = new OperatorPlans(plans);
        } else {
            this.plans = plans;
        }
    }
}

type OldSaveRecord = {
    operatorId: string;
    active: boolean;
    plans: OldOperatorPlans;
}

class SaveRecord {
    operatorId: string;
    active: boolean;
    sort: number;
    plans: OperatorPlans;

    constructor(operator: SelectedOperator) {
        this.operatorId = operator.operator.id;
        this.plans = operator.plans;
        this.active = !!operator.active;
        this.sort = operator.sort ?? 9999999999999;
    }
}

type LevelUpNeedsKey = 'levelup' |
    'e1' |
    'e2' |
    's1m1' |
    's1m2' |
    's1m3' |
    's2m1' |
    's2m2' |
    's2m3' |
    's3m1' |
    's3m2' |
    's3m3'

type LevelUpNeeds = {
    [K in LevelUpNeedsKey]: { [key: string]: number };
} & {
    skill: { [key: string]: number }[];

    // this type got confusing, thank you hypergryph
    // module[moduletype: string][modulelevel: number][itemId: string] = count
    modules: { [key: string]: { [key: string]: number }[] };
};

const IsOldSaveRecord = (record: OldSaveRecord | SaveRecord): record is OldSaveRecord => {
    const plans = record.plans;
    return !Array.isArray(plans.currentModules);
}

export type {
    LevelUpNeeds,
    LevelUpNeedsKey,
    OldSaveRecord,
    EventGains,
    Inventory,
    ItemWithRecipe,
    EXPItem
}

export {
    SelectedOperator,
    SaveRecord,
    IsOldSaveRecord
}