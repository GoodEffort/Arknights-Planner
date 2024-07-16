import { OperatorPlans } from "./plans";

// uniequip_table.json
type UniEquip_Table = {
    equipDict: EquipDict;
    missionList: MissionList;
    subProfDict: SubProfDict;
    charEquip: CharEquip;
    equipTrackDict: object[];
}

type EquipDict = {
    [key: string]: Module;
}

type MissionList = {
    // mission list, not used
    [key: string]: object;
}

type SubProfDict = {
    // not used
    [key: string]: object;
}

type CharEquip = {
    [key: keyof Character_Table]: (keyof EquipDict & string)[];
}

type LevelUpCost = {
    id: string;
    count: number;
    type: "MATERIAL" | "GOLD";
}

type Module = {
    uniEquipId: string;
    uniEquipName: string;
    uniEquipIcon: string;
    uniEquipDesc: string;
    typeIcon: string;
    typeName1: string;
    typeName2: 'X' | 'Y' | 'D' | null;
    equipShiningColor: string;
    showEvolvePhase: string;
    unlockEvolvePhase: string;
    charId: string;
    tmplId: null;
    showLevel: number;
    unlockLevel: number;
    unlockFavorPoint: number;
    missionList: string[];
    itemCost: {
        1: LevelUpCost[];
        2: LevelUpCost[];
        3: LevelUpCost[];
    },
    type: "ADVANCED" | "INITIAL";
    uniEquipGetTime: number;
    charEquipOrder: number;
}

// character_table.json
type Character_Table = {
    [key: string]: OperatorRecord;
}

type KeyFrame = {
    level: number;
    data: {
        maxHp: number;
        atk: number;
        def: number;
        magicResistance: number;
        cost: number;
        blockCnt: number;
        moveSpeed: number;
        attackSpeed: number;
        baseAttackTime: number;
        respawnTime: number;
        hpRecoveryPerSec: number;
        spRecoveryPerSec: number;
        maxDeployCount: number;
        maxDeckStackCnt: number;
        tauntLevel: number;
        massLevel: number;
        baseForceLevel: number;
        stunImmune: boolean;
        silenceImmune: boolean;
        sleepImmune: boolean;
        frozenImmune: boolean;
        levitateImmune: boolean;
    };
}

type Phase = {
    attributesKeyFrames: KeyFrame[];
    characterPrefabKey: string;
    rangeId: string | null;
    maxLevel: number;
    evolveCost?: LevelUpCost[] | null;
}

type Upgrades = {
    candidates: {
        blackboard: { key: string; value: number; valueStr?: string | null }[];
        overrideDesciption?: string | null;
        prefabKey?: string | null;
        rangeId?: string | null;
        requiredPotentialRank?: number | null;
        unlockCondition?: { phase: number; level: number; };
        name?: string | null;
        description?: string | null;
        overrideDescripton?: string | null;
        tokenKey?: string | null;
    }[];
}

type Attribute = {
    abnormalFlags?: null;
    abnormalImmunes?: null;
    abnormalAntis?: null;
    abnormalCombos?: null;
    abnormalComboImmunes?: null;
    attributeModifiers: {
        attributeType: number;
        formulaItem: number;
        value: number;
        loadFromBlackboard: boolean;
        fetchBaseValueFromSourceEntity: boolean;
    }[];
}

type PotentialRank = {
    type: number;
    description: string;
    buff?: {
        attributes: Attribute;
    } | null;
    equivalentCost?: null;
}

type Skill = {
    skillId: string;
    overridePrefabKey?: string | null;
    overrideTokenKey?: string | null;
    levelUpCostCond: {
        unlockCond: UnlockCondition;
        lvlUpTime: number;
        levelUpCost: LevelUpCost[] | null;
    }[];
    unlockCond: UnlockCondition;
}

type UnlockCondition = {
    phase: number;
    level: number;
}

type Operator = {
    id: keyof Character_Table & string;
    name: string;
    description: string;
    canUseGeneralPotentialItem: boolean;
    canUseActivityPotentialItem: boolean;
    potentialItemId?: string | null;
    activityPotentialItemId?: string | null;
    nationId?: string | null;
    groupId?: string | null;
    teamId?: string | null;
    displayNumber?: string | null;
    appellation: string;
    position: string;
    tagList: string[];
    itemUsage?: string | null;
    itemDesc?: string | null;
    itemObtainApproach?: string | null;
    isNotObtainable: boolean;
    isSpChar: boolean;
    maxPotentialLevel: number;
    rarity: "TIER_6" | "TIER_5" | "TIER_4" | "TIER_3" | "TIER_2" | "TIER_1";
    profession: string;
    subProfessionId: string;
    trait?: Upgrades | null;

    // Max levels per promotion
    phases: Phase[];
    skills: Skill[];
    displayTokenDict: object | null;
    talents?: Upgrades[] | null;
    potentialRanks: PotentialRank[];

    // Trust stats
    favorKeyFrames: KeyFrame[];

    // Skill Level Up Costs
    allSkillLvlup: {
        unlockCond: UnlockCondition;
        lvlUpCost: LevelUpCost[] | null;
    }[];
}

type OperatorRecord = Omit<Operator, "id">;

class SelectedOperator {
    operator: Operator;
    plans: OperatorPlans;
    modules: Module[];
    active: boolean;

    constructor(operator: Operator, modules: Module[], plans?: OperatorPlans, active: boolean = true) {
        this.operator = operator;

        this.plans = plans || new OperatorPlans();

        this.modules = modules;

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
    'promotion' |
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
    'mzl1' |
    'mzl2' |
    'mzl3';

type LevelUpNeeds = {
    [K in LevelUpNeedsKey]: { [key: string]: number };
} & {
    skill: { [key: string]: number }[];
};

export type {
    UniEquip_Table,
    EquipDict,
    MissionList,
    SubProfDict,
    CharEquip,
    LevelUpCost,
    Module,
    Character_Table,
    KeyFrame,
    Phase,
    Upgrades,
    Attribute,
    PotentialRank,
    Skill,
    UnlockCondition,
    Operator,
    OperatorRecord,
    LevelUpNeeds,
    LevelUpNeedsKey
}

export {
    SelectedOperator,
    SaveRecord
}