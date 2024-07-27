import { OperatorPlans } from "./plans";
import { Operator } from "./outputdata";

class SelectedOperator {
    operator: Operator;
    plans: OperatorPlans;
    active: boolean;

    constructor(operator: Operator, plans?: OperatorPlans, active: boolean = true) {
        this.operator = operator;

        this.plans = plans || new OperatorPlans();

        this.active = active;
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
    's3m3' |
    'mxl1' |
    'mxl2' |
    'mxl3' |
    'myl1' |
    'myl2' |
    'myl3' |
    'mdl1' |
    'mdl2' |
    'mdl3';

type LevelUpNeeds = {
    [K in LevelUpNeedsKey]: { [key: string]: number };
} & {
    skill: { [key: string]: number }[];
};

export type {
    Operator,
    LevelUpNeeds,
    LevelUpNeedsKey,
}

export {
    SelectedOperator,
    SaveRecord
}