<script setup lang="ts">
import { computed } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import { Item } from '../types/item';
import PlannerSection from './PlannerSection.vue';
import { storeToRefs } from 'pinia';
import CraftButton from './CraftButton.vue';
import ImageFinder from './ImageFinder.vue';

const { inventory, lmdId, inventoryItems } = storeToRefs(usePlannerStore());

export interface Props {
    displayItems?: {
        item: Item;
        count: number;
    }[];
    title: string;
    localStorageId: string;
    controls?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    controls: true
});

const displayItems = computed(() => {
    if (props.displayItems) {
        return props.displayItems;
    }
    else {
        return inventoryItems.value.map(item => {
            return {
                item,
                count: inventory.value[item.itemId] || 0
            };
        }).sort((a, b) => a.item.sortId - b.item.sortId);
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

const changeItemAmount = (item: Item, amount: number) => {
    inventory.value[item.itemId] += amount;
};
</script>

<template>
    <PlannerSection :title="title" :local-storage-id="localStorageId">
        <div class="container">
            <div class="row">
                <div class="col-2" v-for="{ item, count } in displayItems">
                    <div class="item-col">
                        <div class="name">
                            <span>
                            {{ item.name }}
                            </span>
                        </div>
                        <div class="text-align-end">
                            <ImageFinder :subject="item" class="item-image" />
                            <CraftButton v-if="controls" :item="item" />
                        </div>
                        <div class="count">
                            <input
                                v-if="editInventory"
                                type="number"
                                class="form-control"
                                min="0"
                                v-model="inventory[item.itemId]"
                            />
                            <span v-else>
                                <b>{{ count }}</b>
                            </span>
                        </div>
                        <div v-if="!editInventory && controls" class="row mb-2">
                            <div class="col px-0">
                                <button
                                    class="btn btn-primary"
                                    @click="changeItemAmount(item, item.itemId === lmdId ? -lmdChangeAmount : -1)"
                                >-{{ item.itemId === lmdId ? lmdChangeAmountString : '1' }}</button>
                            </div>
                            <div class="col px-0">
                                <button
                                    class="btn btn-primary"
                                    @click="changeItemAmount(item, item.itemId === lmdId ? lmdChangeAmount : 1)"
                                >+{{ item.itemId === lmdId ? lmdChangeAmountString : '1' }}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </PlannerSection>
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
</style>