<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import { Item } from '../types/outputdata';
import { storeToRefs } from 'pinia';
import CraftButton from './CraftButton.vue';
import ImageFinder from './ImageFinder.vue';
import ItemModal from './ItemModal.vue';
import { stages } from '../data/farmingdata';
import { Inventory, inventoryToList } from '../store/store-inventory-functions';

const { inventory, reservedItems, lmdId, items } = storeToRefs(usePlannerStore());

export interface Props {
    displayItems?: {
        item: Item;
        count: number;
    }[];
    controls?: boolean;
    craftButton?: boolean;
    farming?: boolean;
    reservedItems?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    controls: true,
    farming: false,
    craftButton: true,
    reservedItems: false
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
            .sort((a, b) => a.item.sortId - b.item.sortId);
    }
});

const editInventory = computed(() => {
    return props.displayItems === undefined;
});

const lmdChangeAmount = computed(() => {
    const neededLmd = displayItems.value.find(item => item.item.itemId === lmdId.value)?.count ?? 0;
    if (+neededLmd.toExponential().split('+')[1] > 3) {
        return 10000;
    }
    else {
        return 1000;
    }
});

const lmdChangeAmountString = computed(() => {
    const amount = lmdChangeAmount.value;
    return amount === 1000 ? '1k' : '10k';
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

const changeItemAmount = ({ itemId }: Item, amount: number) => {
    const inv: Inventory = JSON.parse(JSON.stringify(editableInv.value));

    if (inv[itemId] === undefined) {
        inv[itemId] = 0;
    }

    inv[itemId] += amount;

    editableInv.value = inv;
};

const showItem = ref<Item>();
</script>

<template>
    <div class="container">
        <div class="row">
            <div class="col-md-3 col-lg-2 col-6" v-for="{ item, count } in displayItems">
                <div class="item-col">
                    <div class="name">
                        <span>
                            {{ item.name }}
                        </span>
                    </div>
                    <div class="text-align-end">
                        <ImageFinder :subject="item" class="item-image" />
                        <CraftButton v-if="controls" :item="item" />
                        <div class="bom" v-if="(item.recipe?.costs.length ?? 0 > 0) && craftButton">
                            <button @click="showItem = item" class="btn btn-primary" tabindex="30000">
                                <font-awesome-icon icon="hammer" />
                            </button>
                        </div>
                    </div>
                    <div class="count">
                        <input v-if="editInventory" type="number" class="form-control" min="0"
                            v-model="editableInv[item.itemId]" />
                        <span v-else>
                            <b>{{ count }}</b>
                        </span>
                        <div v-if="farming">
                            <hr class="my-1" />
                            {{ stages[item.itemId] ?? 'Craft/Buy' }}
                        </div>
                    </div>
                    <div v-if="!editInventory && controls" class="row mb-2">
                        <div class="col px-0">
                            <button class="btn btn-primary"
                                :disabled="editableInv[item.itemId] === undefined || editableInv[item.itemId] === 0"
                                @click="changeItemAmount(item, item.itemId === lmdId ? -lmdChangeAmount : -1)">-{{
                                    item.itemId === lmdId ? lmdChangeAmountString : '1' }}</button>
                        </div>
                        <div class="col px-0">
                            <button class="btn btn-primary"
                                @click="changeItemAmount(item, item.itemId === lmdId ? lmdChangeAmount : 1)">+{{
                                    item.itemId === lmdId ? lmdChangeAmountString : '1' }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <ItemModal v-model="showItem" />
</template>

<style scoped>
.item-image {
    width: 100%;
    height: 5em;
    object-fit: contain;
}

.item-col {
    width: 100%;
    padding: 0px .5em 0px .5em;
    margin-bottom: 1em;
    border-radius: 5px;
    background-color: rgb(197, 197, 197);
}

html.dark>body .item-col {
    background-color: rgb(31, 31, 31);
    border: 1px solid rgb(172, 172, 172);
}

.name {
    font-size: 0.8em;
    height: 3.3em;
    margin-bottom: .5em;
    margin-top: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    vertical-align: middle;
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.text-align-end {
    text-align: end;
}

.count {
    margin-top: .25em;
    margin-bottom: .25em;
}

.container :deep(.craft-button-parent) {
    position: relative;
    top: -2.5em;
    right: 2px;
    height: 0px;
}

.container :deep(.craft-button:disabled) {
    opacity: 0.25;
}

.bom {
    position: relative;
    top: -2.5em;
    right: 70%;
    height: 0px;
    margin-left: 5px;
}
</style>