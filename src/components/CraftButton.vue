<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { Item } from '../types/item';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

const { craftItem } = usePlannerStore();
const { inventory, recipes } = storeToRefs(usePlannerStore());

export interface Props {
    item: Item;
    class?: string;
    buttonClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
    class: 'craft-button-parent',
    buttonClass: 'btn btn-primary craft-button'
});

const enableCraftButton = computed(() => {
    const formula = recipes.value[props.item.itemId];
    return formula.every(cost => {
        const { id: itemId, count } = cost;
        return inventory.value[itemId] >= count;
    });
});
</script>

<template>
    <div :class="class" v-if="item.buildingProductList.length > 0">
        <button
            :class="buttonClass"
            :disabled="!enableCraftButton"
            @click="craftItem(item)"
        >Craft</button>
    </div>
</template>

<style scoped>
.craft-button-parent {
    position: relative;
    top: -2.5em;
    right: 2px;
    height: 0px;
}

.craft-button:disabled {
    opacity: 0.25;
}
</style>