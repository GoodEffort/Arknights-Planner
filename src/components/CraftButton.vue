<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { Item } from '../types/item';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

const { craftItem } = usePlannerStore();
const { inventory, workShopFormulas } = storeToRefs(usePlannerStore());

export interface Props {
    item: Item;
    class: string;
}

const props = withDefaults(defineProps<Props>(), {
    class: 'craft-button'
});

const enableCraftButton = computed(() => {
    const formulaList = props.item.buildingProductList;
    if (formulaList.length === 0) {
        return false;
    }
    else {
        const { formulaId } = formulaList[0];
        const formula = workShopFormulas.value[formulaId];
        return formula.every(cost => {
            const { id: itemId, count } = cost;
            return inventory.value[itemId] >= count;
        });
    }
});
</script>

<template>
    <div :class="class" v-if="item.buildingProductList.length > 0">
        <button
            class="btn btn-primary"
            :disabled="!enableCraftButton"
            @click="craftItem(item)"
        >Craft</button>
    </div>
</template>