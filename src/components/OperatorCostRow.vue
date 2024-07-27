<script lang="ts" setup>
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import ItemCell from './ItemCell.vue';
import { Item } from '../types/outputdata';

const emit = defineEmits<{
    (e: 'applyUpgrade', costs: {
        [key: string]: number;
    }): void
}>();

const props = defineProps<{
    costs: {
        [key: string]: number;
    },
    title: string;
    enableApply: boolean;
    hideApply: boolean;
}>();

const { items, inventory } = storeToRefs(usePlannerStore());
const entries = computed(() => {
    const entries: { item: Item, count: number }[] = [];

    for (const [itemId, count] of Object.entries(props.costs)) {
        entries.push({
            item: items.value[itemId],
            count
        });
    }

    return entries.sort(({ item: a }, { item: b }) => a.sortId - b.sortId);
});

const ItemsAvailable = computed(() => {
    for (const [itemId, count] of Object.entries(props.costs)) {
        if ((inventory.value[itemId] ?? 0) < count) {
            return false;
        }
    }

    return true;
});
</script>

<template>
    <div class="col-md-2 col-8 mb-2 mb-md-0">
        <label class="d-none d-md-inline-block mt-4">{{ title }}</label>
        <h5 class="d-md-none">{{ title }}</h5>
    </div>
    <div class="col-4 d-md-none mb-2" v-if="!hideApply">
        <button :disabled="!props.enableApply || !ItemsAvailable" class="btn btn-primary form-control"
            @click="emit('applyUpgrade', costs)">Apply</button>
    </div>
    <div class="col-lg-9 col-md-8 col-12 mt-md-2">
        <div class="row">
            <div class="col-auto" v-for="{ item, count } in entries" :key="item.itemId">
                <ItemCell :item="item" :count="count" />
            </div>
        </div>
    </div>
    <div class="col-md-2 col-lg-1 d-md-block d-none" v-if="!hideApply">
        <button :disabled="!props.enableApply || !ItemsAvailable" class="btn btn-primary mt-3"
            @click="emit('applyUpgrade', costs)">Apply</button>
    </div>
</template>