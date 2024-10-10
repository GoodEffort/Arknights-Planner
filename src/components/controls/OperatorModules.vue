<script setup lang="ts">
import { computed, ref } from 'vue';
import { SelectedOperator } from '@/types/planner-types';
import OperatorInputGroup from '@/components/controls/OperatorInputGroup.vue';
import { usePlannerStore } from '@/store/planner-store';
import { storeToRefs } from 'pinia';
import { Module } from '@/types/outputdata';
import Modal from '@/components/generic/Modal.vue';
import Tooltip from '@/components/Tooltip.vue';

const { selectedOperators } = storeToRefs(usePlannerStore());

const props = defineProps<{
    selectedOperator: SelectedOperator;
    type: 'current' | 'target';
}>();

const selectedModule = ref<Module>();
const showModal = computed<boolean>({
    get: () => selectedModule.value !== undefined,
    set: (value: boolean) => !value ? selectedModule.value = undefined : null
});

const imageErrors = ref<number[]>([]);

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
    const modType = module.type === "D" ? "Δ" : module.type;
    return `${module.typeName1}-${modType}`;
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

const moduleImageLink = 'https://goodeffort.github.io/Arknights-Planner-Data/images/modules/';
</script>

<template>
    <hr />
    <div v-if="selectedOperator.operator.modules.length > 0">
        <h5>{{ props.type === 'current' ? 'Current' : 'Target' }} Modules</h5>
        <div class="row mb-2" v-for="(module, index) in modules">
            <div class="col-auto" v-if="!imageErrors.includes(index) || true">
                <img :src="`${moduleImageLink}${module.icon}.webp`" :alt="module.name"
                    class="operator-module-icon img-thumbnail" @click="selectedModule = module"
                    @error="imageErrors.push(index)" />
            </div>
            <div class="col text-start">
                <div>
                    <span>{{ module.name }}</span>
                    <span v-if="module.cnOnly">
                        <span>&nbsp;</span>
                        <Tooltip tooltipText="CN server only Module for now">
                            <font-awesome-icon icon="clock" />
                        </Tooltip>
                    </span>
                </div>
                <OperatorInputGroup :model-value="getModule(module.type) ?? 0"
                    @update:model-value="value => setModule({ type: module.type, value })"
                    :label="getModuleTypeDisplay(module)" :key="`1${operatorId}-mx`" :min="getMin(module.type)" />
            </div>
        </div>
    </div>
    <Modal v-model="showModal">
        <template #header>
            <h5>{{ selectedModule?.name }}</h5>
        </template>
        <template #body>
            <div>
                <img :src="`${moduleImageLink}${selectedModule?.icon}.webp`" :alt="selectedModule?.name" class="" />
            </div>
            <p class="text-start mx-4 module-text">
                {{ selectedModule?.description.replaceAll('\n', '\n\n') }}
            </p>
        </template>
        <template #footer>
            <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
        </template>
    </Modal>
</template>

<style scoped>
.operator-module-icon {
    width: 4em;
    cursor: pointer;
}

.module-text {
    white-space: pre-wrap;
    font-size: large;
    line-height: 1.8em;
}
</style>