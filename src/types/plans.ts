class SkillMasteries {
    skill1: number;
    skill2: number;
    skill3: number;

    constructor() {
        this.skill1 = 0;
        this.skill2 = 0;
        this.skill3 = 0;
    }
}

class ModuleLevels {
    x: number;
    y: number;
    z: number;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
}

class OperatorPlans {
    currentLevel: number;
    currentElite: 0 | 1 | 2;
    currentSkillLevels: number;
    currentSkillMasteries: SkillMasteries;
    currentModules: ModuleLevels;

    targetLevel: number;
    targetElite: 0 | 1 | 2;
    targetSkillLevels: number;
    targetSkillMasteries: SkillMasteries;
    targetModules: ModuleLevels;

    constructor() {
        this.currentLevel = 1;
        this.currentElite = 0;
        this.currentSkillLevels = 1;
        this.currentSkillMasteries = new SkillMasteries();
        this.currentModules = new ModuleLevels();

        this.targetLevel = 1;
        this.targetElite = 0;
        this.targetSkillLevels = 1;
        this.targetSkillMasteries = new SkillMasteries();
        this.targetModules = new ModuleLevels();
    }
}

export { OperatorPlans }