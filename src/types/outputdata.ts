type Operator = {
    id: string;
    name: string;
    profession: string;

    rarity: "TIER_6" | "TIER_5" | "TIER_4" | "TIER_3" | "TIER_2" | "TIER_1";

    skillLevelUpCosts: LevelUpCost[][];
    skills: Skill[];

    promotions: Promotion[];

    modules: Module[];
}

type Promotion = {
    maxLevel: number;
    evolveCost: LevelUpCost[];
}

type LevelUpCost = {
    id: string;
    count: number;
}

type Skill = {
    name: string;
    id: string;
    icon: string;
    masteryCosts: LevelUpCost[][];
}

type Module = {
    typeName1: string;
    type: string;
    name: string;
    icon: string;
    description: string;
    cost: LevelUpCost[][];
}

type Item = {
    itemId: string;
    name: string;
    description: string;
    rarity: "TIER_1" | "TIER_2" | "TIER_3" | "TIER_4" | "TIER_5" | "TIER_6";
    iconId: string;
    sortId: number;
    classifyType: string;
    itemType: string;
    stageDropList: {
        stageId: string;
        occPer: string;
    }[];
    recipe?: Recipe;
    gainExp?: number;
}

type Recipe = {
    count: number;
    costs: {
        id: string;
        count: number;
        type: string;
    }[];
}

type JSONData = {
    commitHashes: {
        yostar: string;
        cn: string;
    };
    operators: {
        [key: string]: Omit<Operator, "id">;
    };
    items: {
        [key: string]: Item;
    };
};

export type { LevelUpCost, Promotion, Operator, Skill, Module, Item, Recipe, JSONData };