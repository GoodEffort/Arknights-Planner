import { Inventory } from "@/store/store-inventory-functions"

type ArkPrtsCharacter = {
    class: string
    favorite: boolean
    id: string
    level: number
    mastery: [number | null, number | null, number | null]
    module: [number | null, number | null, number | null]
    name: string
    owned: boolean
    potential: number
    promotion: 0 | 1 | 2
    rarity: number
    skillLevel: number
    skin: string
}

type ArkPrtsCharacterList = {
    [key: string]: ArkPrtsCharacter
}

//https://app.quicktype.io/?l=ts
//https://arkprts.ashlen.top/api/raw/user

type ARKPRTSData = {
    status: Status;
    troop: Troop;
    inventory: Inventory;
}

type Status = {
    gold: number;
}

type Troop = {
    curCharInstId: number;
    curSquadCount: number;
    squads: { [key: string]: Squad };
    chars: { [key: string]: Char };
    charGroup: { [key: string]: CharGroup };
    charMission: CharMission;
    addon: Addon;
}

type Addon = {
    [key: string]: AddonData;
}

type Mem = {
    startTimes: number;
    completeTimes: number;
    state: number;
    fts: number;
    rts: number;
}

type Story = {
    fts: number;
    rts: number;
}

type AddonData = {
    story?: { [key: string]: Story };
    stage?: { [key: string]: Mem };
}

type CharGroup = {
    favorPoint: number;
}

type CharMission = {
    [key: string]: CharMissionData;
}

type CharMissionData = {
    [key: string]: number;
}

type Char = {
    instId: number;
    charId: string;
    favorPoint: number;
    potentialRank: number;
    mainSkillLvl: number;
    skin: null | string;
    level: number;
    exp: number;
    evolvePhase: number;
    defaultSkillIndex: number;
    gainTime: number;
    skills: Skill[];
    voiceLan: VoiceLan;
    currentEquip: null | string;
    equip: { [key: string]: EquipValue };
    starMark?: number;
    currentTmpl?: string;
    tmpl?: Tmpl;
}

type EquipValue = {
    hide: number;
    locked: number;
    level: number;
}

type Skill = {
    skillId: string;
    unlock: number;
    state: number;
    specializeLevel: number;
    completeUpgradeTime: number;
}

type Tmpl = {
    [key: string]: CharSwap;
}

type CharSwap = {
    skinId: string;
    defaultSkillIndex: number;
    skills: Skill[];
    currentEquip: null | string;
    equip: { [key: string]: EquipValue };
}

export enum VoiceLan {
    En = "EN",
    Jp = "JP",
    Linkage = "LINKAGE",
}

type Squad = {
    squadId: string;
    name: string;
    slots: Slot[];
}

type Slot = {
    charInstId: number;
    skillIndex: number;
    currentEquip: null | string;
}

export type { ArkPrtsCharacter, ArkPrtsCharacterList, ARKPRTSData }