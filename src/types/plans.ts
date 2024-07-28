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
    d: number;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.d = 0;
    }
}

class OldOperatorPlans {
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

class OperatorPlans {
    currentLevel: number;
    currentElite: 0 | 1 | 2;
    currentSkillLevels: number;
    currentSkillMasteries: SkillMasteries;
    currentModules: {
        type: string;
        level: number;
    }[];


    targetLevel: number;
    targetElite: 0 | 1 | 2;
    targetSkillLevels: number;
    targetSkillMasteries: SkillMasteries;
    targetModules: {
        type: string;
        level: number;
    }[];

    constructor(oldPlans?: OldOperatorPlans) {
        if (oldPlans) {
            this.currentLevel = oldPlans.currentLevel;
            this.currentElite = oldPlans.currentElite;
            this.currentSkillLevels = oldPlans.currentSkillLevels;
            this.currentSkillMasteries = oldPlans.currentSkillMasteries;
            this.currentModules = [];

            if (oldPlans.currentModules.x > 0) {
                this.currentModules.push({ type: 'X', level: oldPlans.currentModules.x });
            }

            if (oldPlans.currentModules.y > 0) {
                this.currentModules.push({ type: 'Y', level: oldPlans.currentModules.y });
            }

            if (oldPlans.currentModules.d > 0) {
                this.currentModules.push({ type: 'D', level: oldPlans.currentModules.d });
            }

            this.targetLevel = oldPlans.targetLevel;
            this.targetElite = oldPlans.targetElite;
            this.targetSkillLevels = oldPlans.targetSkillLevels;
            this.targetSkillMasteries = oldPlans.targetSkillMasteries;
            this.targetModules = [];

            if (oldPlans.targetModules.x > 0) {
                this.targetModules.push({ type: 'X', level: oldPlans.targetModules.x });
            }

            if (oldPlans.targetModules.y > 0) {
                this.targetModules.push({ type: 'Y', level: oldPlans.targetModules.y });
            }

            if (oldPlans.targetModules.d > 0) {
                this.targetModules.push({ type: 'D', level: oldPlans.targetModules.d });
            }
        } else {
            this.currentLevel = 1;
            this.currentElite = 0;
            this.currentSkillLevels = 1;
            this.currentSkillMasteries = new SkillMasteries();
            this.currentModules = [];

            this.targetLevel = 1;
            this.targetElite = 0;
            this.targetSkillLevels = 1;
            this.targetSkillMasteries = new SkillMasteries();
            this.targetModules = [];
        }
    }
}

const IsOldOperatorPlans = (plans: OldOperatorPlans | OperatorPlans): plans is OldOperatorPlans => {
    return (<OldOperatorPlans>plans).currentModules.x !== undefined;
}

export { OldOperatorPlans, OperatorPlans, SkillMasteries, ModuleLevels, IsOldOperatorPlans }