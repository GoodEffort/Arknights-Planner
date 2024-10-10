<script setup lang="ts">
import { computed } from 'vue';
import Modal from './Modal.vue';
import NavTabList from './NavTabList.vue';
import ImportTab from './DefaultImportExportTab.vue';
import PenguinStatsTab from './PenguinStatsTab.vue';
import CSVInventoryImportTab from './CSVInventoryImportTab.vue';
import ArkPRTSImportTab from './ArkPRTSImportTab.vue';

const props = defineProps<{
    modelValue: boolean | string;
    defaultTab?: string;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const show = computed({
    get: () => !!props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const tabs = [
    {
        name: 'arknightsplanner',
        title: 'Arknights Planner'
    },
    {
        name: 'penguin-stats',
        title: 'Penguin Stats'
    },
    {
        name: 'inventory-csv',
        title: 'CSV (Inventory)'
    },
    {
        name: 'ark-prts',
        title: 'ArkPRTS Import'
    }
];
</script>

<template>
    <modal v-model="show">
        <template #header>
            Import or Export Data
        </template>
        <template #body>
            <nav-tab-list :tabs="tabs"
                :default-tab="defaultTab ? tabs.findIndex(t => t.name === defaultTab) : undefined">
                <template #arknightsplanner>
                    <import-tab @imported="show = false" />
                </template>
                <template #penguin-stats>
                    <penguin-stats-tab @imported="show = false" />
                </template>
                <template #inventory-csv>
                    <CSVInventoryImportTab @imported="show = false" />
                </template>
                <template #ark-prts>
                    <ArkPRTSImportTab @imported="show = false" />
                </template>
            </nav-tab-list>
        </template>
        <template #footer>
            <button class="btn btn-danger" @click="show = false">Cancel</button>
        </template>
    </modal>
</template>