import { IsOldOperatorPlans, OldOperatorPlans, OperatorPlans } from "./plans";
import { Operator } from "./outputdata";

class SelectedOperator {
    operator: Operator;
    plans: OperatorPlans;
    active: boolean;

    constructor(operator: Operator, plans?: OldOperatorPlans | OperatorPlans, active: boolean = true) {
        this.operator = operator;
        this.active = active;
        
        if (!plans) {
            this.plans = new OperatorPlans();
        } else if (IsOldOperatorPlans(plans)) {
            this.plans = new OperatorPlans(plans);
        } else {
            this.plans = plans;
        }
    }
}

class OldSaveRecord {
    operatorId: string;
    active: boolean;
    plans: OldOperatorPlans;

    constructor() {
        this.operatorId = "";
        this.plans = new OldOperatorPlans();
        this.active = false;
    }
}

class SaveRecord {
    operatorId: string;
    active: boolean;
    plans: OperatorPlans;

    constructor(operator: SelectedOperator) {
        this.operatorId = operator.operator.id;
        this.plans = operator.plans;
        this.active = !!operator.active;
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

export type {
    LevelUpNeeds,
    LevelUpNeedsKey,
}

export {
    SelectedOperator,
    OldSaveRecord,
    SaveRecord
}