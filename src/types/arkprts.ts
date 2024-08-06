type ArkPrtsCharacter = {
    class: string
    favorite: boolean
    id: string
    level: number
    mastery: [ number | null, number | null, number | null ]
    module: [ number | null, number | null, number | null ]
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

export type { ArkPrtsCharacter, ArkPrtsCharacterList }