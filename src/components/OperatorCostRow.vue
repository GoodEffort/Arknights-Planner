<script lang="ts" setup>
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import ItemCell from './ItemCell.vue';
import { Item } from '../types/item';

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
    <div class="col-2">
        <label>{{ title }}</label>
    </div>
    <div class="col-9">
        <div class="row">
            <div class="col-auto" v-for="{ item, count } in entries" :key="item.itemId">
                <ItemCell :item="item" :count="count" />
            </div>
        </div>
    </div>
    <div class="col-1">
        <button :disabled="!props.enableApply || !ItemsAvailable" class="btn btn-primary"
            @click="emit('applyUpgrade', costs)">Apply</button>
    </div>
</template>