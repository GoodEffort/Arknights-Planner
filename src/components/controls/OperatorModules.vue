<script setup lang="ts">
import { computed } from 'vue';
import { SelectedOperator } from '../../types/planner-types';
import OperatorInputGroup from './OperatorInputGroup.vue';
import { usePlannerStore } from '../../store/planner-store';
import { storeToRefs } from 'pinia';
import { Module } from '../../types/outputdata';

const { selectedOperators } = storeToRefs(usePlannerStore());

const props = defineProps<{
    selectedOperator: SelectedOperator;
    type: 'current' | 'target';
}>();

const modules = computed(() => props.selectedOperator.operator.modules);

const operatorId = computed(() => props.selectedOperator.operator.id);

const modulePlans = computed(() => {
    const plansKey = props.type === "current" ? "currentModules" : "targetModules";
    return props.selectedOperator.plans[plansKey];
});

const getMin = (type: string) => {
    if (props.type === "current") {
        return 0;
    }
    else {
        const currentModule = props.selectedOperator.plans.currentModules.find(a => a.type === type);
        return currentModule?.level ?? 0;
    }
}

const getModule = (type: string) => {
    return modulePlans.value.find(a => a.type === type)?.level;
}

const getModuleTypeDisplay = (module: Module) => {
    return module.type === "D" ? "Δ" : module.type;
}

const setModule = ({ value, type }: { value: number | undefined; type: string; }) => {
    const plansKey = props.type === "current" ? "currentModules" : "targetModules";
    const op = selectedOperators.value.find(a => a.operator.id === operatorId.value);
    const level = value ?? 0;
    
    if (!op) {
        throw new Error("Operator not found in store");
    }

    let valueIndex = op.plans[plansKey].findIndex(a => a.type === type);

    if (valueIndex < 0) {
        op.plans[plansKey].push({ type, level });
        valueIndex = op.plans[plansKey].length - 1;
    }

    op.plans[plansKey][valueIndex].level = level;

    if (props.type === "current") {
        if (op.plans.targetModules[valueIndex] === undefined) {
            op.plans.targetModules.push({ type, level });
        }
        else if (op.plans.targetModules[valueIndex].level < level) {
            op.plans.targetModules[valueIndex].level = level;
        }
    }

}
</script>

<template>
    <hr />
    <div v-if="selectedOperator.operator.modules.length > 0">
        <h5>{{ props.type === 'current' ? 'Current' : 'Target' }} Modules</h5>
        <div class="row mb-2" v-for="module in modules">
            <div class="col">
                <div>{{ module.name }}</div>
                <OperatorInputGroup :model-value="getModule(module.type) ?? 0"
                    @update:model-value="value => setModule({ type: module.type, value })" :label="getModuleTypeDisplay(module)"
                    :key="`1${operatorId}-mx`" :min="getMin(module.type)" />
            </div>
        </div>
    </div>
</template>