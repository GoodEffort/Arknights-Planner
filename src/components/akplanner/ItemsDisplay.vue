<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlannerStore } from '@/store/planner-store';
import { Item } from '@/types/outputdata';
import { storeToRefs } from 'pinia';
import ItemModal from '@/components/modals/ItemModal.vue';
import { inventoryToList } from '@/store/store-inventory-functions';
import ItemDisplayCell from '@/components/akplanner/ItemDisplayCell.vue';
import { Inventory } from '@/types/planner-types';

const { items, inventory } = storeToRefs(usePlannerStore());

const emit = defineEmits<{
    (e: 'update:modelValue', value: Inventory): void;
    (e: 'increment-item', item: Item, count: number): void;
}>();

export interface Props {
    controls?: boolean;
    craftButton?: boolean;
    farming?: boolean;
    flash?: boolean;
    sort?: (a: {
        item: Item;
        count: number;
    }, b: {
        item: Item;
        count: number;
    }) => number
    modelValue: Inventory;
    useInput?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    controls: true,
    farming: false,
    craftButton: true,
    flash: false,
    sort: (a, b) => a.item.sortId - b.item.sortId
});

const displayItems = computed<ReturnType<typeof inventoryToList>>(() => {
    const inventory = props.modelValue;
    const list = inventoryToList(inventory, items.value);
    return list.sort(props.sort);
});

const setItemQuantity = (item: Item, count: number) => {
    const inv = JSON.parse(JSON.stringify(props.modelValue));
    inv[item.itemId] = count;
    emit('update:modelValue', inv);
}

const showItem = ref<Item>();
</script>

<template>
    <div class="container">
        <div class="row">
            <div class="col-md-3 col-lg-2 col-6" v-for="{ item, count } in displayItems">
                <ItemDisplayCell
                    :model-value="count"
                    @update:model-value="(value) => setItemQuantity(item, value)"
                    @increment-item="(item, count) => emit('increment-item', item, count)"
                    :item="item" 
                    :useInput="useInput ?? false"
                    :controls="props.controls" 
                    :craftButton="props.craftButton" 
                    :farming="props.farming"
                    :flash="props.flash" 
                    :disable-decrement="inventory[item.itemId] === 0"
                    @show-item="showItem = $event" />
            </div>
        </div>
    </div>
    <ItemModal v-model="showItem" />
</template>

<style scoped>
.container :deep(.craft-button-parent) {
    position: relative;
    top: -2.5em;
    right: 2px;
    height: 0px;
}

.container :deep(.craft-button:disabled) {
    opacity: 0.25;
}
</style>