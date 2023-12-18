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
        blackboard: { key: string; value: number; }[];
        ovverideDesciption?: string | null;
        prefabKey?: string | null;
        rangeId?: string | null;
        requiredPotentialRank?: number | null;
        unlockCondition?: { phase: number; level: number; };
        name?: string | null;
        description?: string | null;
        overrideDescripton?: string | null;
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

type LevelUpCost = {
    id: string;
    count: number;
    type: string;
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
    id: string;
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
    tokenKey?: string | null;
    appellation: string;
    position: string;
    tagList: string[];
    itemUsage?: string | null;
    itemDesc?: string | null;
    itemObtainApproach?: string | null;
    isNotObtainable: boolean;
    isSpChar: boolean;
    maxPotentialLevel: number;
    rarity: number;
    profession: string;
    subProfessionId: string;
    trait?: Upgrades | null;

    // Max levels per promotion
    phases: Phase[];
    skills: Skill[];
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

export default Operator;
export type { Phase };