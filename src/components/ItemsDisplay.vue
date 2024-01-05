<script setup lang="ts">
import { computed } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import { Item } from '../types/item';
import PlannerSection from './PlannerSection.vue';
import { storeToRefs } from 'pinia';
import CraftButton from './CraftButton.vue';

const { getItemImageLink } = usePlannerStore();
const { inventory } = storeToRefs(usePlannerStore());

const props = defineProps<{
    displayItems: {
        item: Item;
        count: number;
    }[];
    title: string;
    localStorageId: string;
}>();

const lmdChangeAmount = computed(() => {
    const neededLmd = props.displayItems.find(item => item.item.itemId === '4001')?.count ?? 0;
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
                        <div class="text-align-end">
                            <img :src="getItemImageLink(item)" :alt="item.name" class="img-thumbnail item-image" />
                            <CraftButton :item="item" />
                        </div>
                        <div class="name">
                            {{ item.name }}
                        </div>
                        <div class="count">
                            {{ count }}
                        </div>
                        <div class="row">
                            <div class="col px-0">
                                <button
                                    class="btn btn-primary"
                                    @click="changeItemAmount(item, item.itemId === '4001' ? -lmdChangeAmount : -1)"
                                >-{{ item.itemId === '4001' ? lmdChangeAmountString : '1' }}</button>
                            </div>
                            <div class="col px-0">
                                <button
                                    class="btn btn-primary"
                                    @click="changeItemAmount(item, item.itemId === '4001' ? lmdChangeAmount : 1)"
                                >+{{ item.itemId === '4001' ? lmdChangeAmountString : '1' }}</button>
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
    padding: 1em 0.5em;
    margin-bottom: 1em;
    border-radius: 5px;
    background-color: rgb(197, 197, 197);
}

.name {
    font-size: 0.8em;
    text-align: center;
    margin-top: 0.5em;
    height: 4em;
    text-align: center;
    vertical-align: middle;
}

.craft-button {
    position: relative;
    top: -2.5em;
    right: 2px;
    height: 0px;
}

.text-align-end {
    text-align: end;
}
</style>