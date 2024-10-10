<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlannerStore } from '@/store/planner-store';
import { Item } from '@/types/outputdata';
import { storeToRefs } from 'pinia';
import ItemModal from '@/components/modals/ItemModal.vue';
import { inventoryToList } from '@/store/store-inventory-functions';
import ItemDisplayCell from '@/components/ItemDisplayCell.vue';

const { inventory, reservedItems, items } = storeToRefs(usePlannerStore());

export interface Props {
    displayItems?: {
        item: Item;
        count: number;
    }[];
    controls?: boolean;
    craftButton?: boolean;
    farming?: boolean;
    reservedItems?: boolean;
    flash?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    controls: true,
    farming: false,
    craftButton: true,
    reservedItems: false,
    flash: false,
});

const displayItems = computed<ReturnType<typeof inventoryToList>>(() => {
    if (props.displayItems !== undefined) {
        return props.displayItems;
    }
    else {
        return inventoryToList(
            (props.reservedItems ?
                reservedItems.value :
                inventory.value
            ),
            items.value)
            .sort((a, b) => props.reservedItems? a.item.rarity.localeCompare(b.item.rarity) : a.item.sortId - b.item.sortId);
    }
});

const editInventory = computed(() => {
    return props.displayItems === undefined;
});

const editableInv = computed({
    get: () => {
        if (props.reservedItems) {
            return reservedItems.value;
        }
        else {
            return inventory.value;
        }
    },
    set: value => {
        if (props.reservedItems) {
            reservedItems.value = value;
        }
        else {
            inventory.value = value;
        }
    }
});

const showItem = ref<Item>();
</script>

<template>
    <div class="container">
        <div class="row">
            <div class="col-md-3 col-lg-2 col-6" v-for="{ item, count } in displayItems">
                <ItemDisplayCell
                    :item="item"
                    :count="count"
                    :controls="props.controls"
                    :craftButton="props.craftButton"
                    :farming="props.farming"
                    :edit-inventory="editInventory"
                    :editable-inv="editableInv"
                    :reservedItem="props.reservedItems"
                    :flash="props.flash"
                    @show-item="showItem = $event"
                />
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