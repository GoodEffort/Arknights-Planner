type OperatorPlans = {
    operatorId: string;

    currentLevel: number;
    currentElite: number;
    currentSkillLevels: number;
    currentSkillMasteries: { skill1: number; skill2: number; skill3: number; };
    currentModules: { x: number; y: number; z: number; };

    targetLevel: number;
    targetElite: number;
    targetSkillLevels: number;
    targetSkillMasteries: { skill1: number; skill2: number; skill3: number; };
    targetModules: { x: number; y: number; z: number; };

}

export type { OperatorPlans }