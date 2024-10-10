<script setup lang="ts">
import { usePlannerStore } from '@/store/planner-store';
import { Item } from '@/types/outputdata';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { canCraft } from '@/store/store-inventory-functions';

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

const buttonLabel = computed(() => {
    if (props.item.itemId === 'mod_unlock_token' || props.item.itemId === '32001') {
        return 'Buy';
    }
    else {
        return 'Craft';
    }
})
</script>

<template>
    <div :class="class" v-if="item.recipe">
        <button
            :class="buttonClass"
            :disabled="!enableCraftButton"
            @click="craftItem(item)"
            tabindex="30000"
        >{{ buttonLabel }}</button>
    </div>
</template>