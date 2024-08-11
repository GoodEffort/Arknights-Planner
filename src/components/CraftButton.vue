<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { Item } from '../types/outputdata';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { canCraft } from '../store/store-item-functions';

const { craftItem } = usePlannerStore();
const { inventory } = storeToRefs(usePlannerStore());

export interface Props {
    item: Item;
    class?: string;
    buttonClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
    class: 'craft-button-parent',
    buttonClass: 'btn btn-primary craft-button'
});

const enableCraftButton = computed(() => canCraft(props.item, inventory.value));
</script>

<template>
    <div :class="class" v-if="item.recipe">
        <button
            :class="buttonClass"
            :disabled="!enableCraftButton"
            @click="craftItem(item)"
            tabindex="30000"
        >Craft</button>
    </div>
</template>