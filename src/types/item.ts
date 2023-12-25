type Item_Table = {
    items: {
        [id: string]: Item
    };
    expItems: {
        [id: string]: ExpItem
    };
    potentialItems: object;
    apSupplies: object;
    charVoucherItems: object;
    uniqueInfo: object;
    itemTimeLimit: object;
    uniCollectionInfo: object;
    itemPackInfos: object;
    fullPotentialCharacters: object;
    activityPotentialCharacters: object;
    favorCharacters: object | null;
}

type Item = {
    itemId: string;
    name: string;
    description: string;
    rarity: "TIER_1" | "TIER_2" | "TIER_3" | "TIER_4" | "TIER_5" | "TIER_6";
    iconId: string;
    overrideBkg: null;
    stackIconId: string;
    sortId: number;
    usage: string;
    obtainApproach: string;
    hideInItemGet: boolean;
    classifyType: string;
    itemType: string;
    stageDropList: {
        stageId: string;
        occPer: string;
    }[];
    buildingProductList: {
        roomType: string;
        formulaId: string;
    }[];
}

type ExpItem = {
    id: keyof Item_Table["expItems"] & string;
    gainExp: number;
}

export type { Item_Table, Item, ExpItem }