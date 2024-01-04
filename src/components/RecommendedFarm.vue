<script setup lang="ts">
import PlannerSection from './PlannerSection.vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { Item } from '../types/item';

const { getItemImageLink, craftItem } = usePlannerStore();

const { recommendedFarmingItems, items, inventory } = storeToRefs(usePlannerStore());

const itemsToFarm = computed(() => {
    const itemsToFarm: { item: Item, count: number }[] = [];
    for (const [key, count] of Object.entries(recommendedFarmingItems.value)) {
        const item = items.value[key];
        itemsToFarm.push({ item, count });
    }
    return itemsToFarm;
});

const changeItemAmount = (item: Item, amount: number) => {
    inventory.value[item.itemId] += amount;
};

const lmdChangeAmount = computed(() => {
    const neededLmd = itemsToFarm.value.find(item => item.item.itemId === '4001')?.count ?? 0;
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
</script>

<template>
    <PlannerSection title="Items to Farm" local-storage-id="items-to-farm-collapsed">
        <div class="container">
            <div class="row">
                <div class="col-2" v-for="{ item, count } in itemsToFarm">
                    <div class="item-col">
                        <div class="text-align-end">
                            <img :src="getItemImageLink(item)" :alt="item.name" class="img-thumbnail item-image" />
                            <div class="craft-button" v-if="item.buildingProductList.length > 0">
                                <button class="btn btn-primary" @click="craftItem(item)">Craft</button>
                            </div>
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