<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { Item } from '../types/item';
import PlannerSection from './PlannerSection.vue';

const { getItemImageLink } = usePlannerStore();

const { totalCosts, inventory, items, expItems, battleRecords } = storeToRefs(usePlannerStore());

const neededItems = computed(() => {
    const needed: { item: Item, count: number }[] = [];
    let totalExp = 0;

    for (const key in totalCosts.value) {
        if (expItems.value[key] !== undefined) {
            totalExp += expItems.value[key].gainExp * totalCosts.value[key];
        }
        else {
            const count = totalCosts.value[key] - (inventory.value[key] ?? 0);
            if (count > 0) {
                const item = items.value[key];
                needed.push({ item, count });
            }
        }
    }

    for (const key in inventory.value) {
        if (expItems.value[key] !== undefined) {
            totalExp -= expItems.value[key].gainExp * inventory.value[key];
        }
    }

    const neededEXPItems: {
        [key: string]: number;
    } = {};

    // calculate exp items needed
    for (const { gainExp, id } of battleRecords.value) {
        const recordsNeeded = Math.floor(totalExp / gainExp);
        totalExp = totalExp % gainExp;

        if (recordsNeeded > 0) {
            if (neededEXPItems[id] === undefined) {
                neededEXPItems[id] = 0;
            }
            neededEXPItems[id] += recordsNeeded;
        }
    }

    for (const [key, count] of Object.entries(neededEXPItems)) {
        const item = items.value[key];
        needed.push({ item, count });
    }

    return needed.sort((a, b) => a.item.sortId - b.item.sortId);
});

const lmdChangeAmount = computed(() => {
    const neededLmd = neededItems.value.find(item => item.item.itemId === '4001')?.count ?? 0;
    if (+neededLmd.toExponential().split('+')[1] > 3) {
        return 10000;
    }
    else {
        return 1000;
    }
});

const lmdChangeAmountString = computed(() => {
    const amount = lmdChangeAmount.value;
    return amount === 1000 ? '1000' : '10k';
});

const changeItemAmount = (item: Item, amount: number) => {
    inventory.value[item.itemId] += amount;
};
</script>

<template>
    <PlannerSection title="Needed Items" local-storage-id="needed-items-collapsed">
        <div class="container">
            <div class="row">
                <div class="col-2" v-for="{ item, count } in neededItems">
                    <div class="item-col">
                        <div>
                            <img :src="getItemImageLink(item)" :alt="item.name" class="img-thumbnail item-image" />
                        </div>
                        <div class="name">
                            {{ item.name }}
                        </div>
                        <div class="count">
                            {{ count }}
                        </div>
                        <div class="row">
                            <div class="col">
                                <button
                                    class="plus-minus-button"
                                    @click="changeItemAmount(item, item.itemId === '4001' ? -lmdChangeAmount : -1)"
                                >- {{ item.itemId === '4001' ? lmdChangeAmountString : '1' }}</button>
                            </div>
                            <div class="col">
                                <button
                                    class="plus-minus-button"
                                    @click="changeItemAmount(item, item.itemId === '4001' ? lmdChangeAmount : 1)"
                                >+ {{ item.itemId === '4001' ? lmdChangeAmountString : '1' }}</button>
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
    background-color: rgb(31, 31, 31);
    padding: 1em 0.5em;
    margin-bottom: 1em;
    border: 1px solid rgb(172, 172, 172);
    border-radius: 5px;
}

.name {
    font-size: 0.8em;
    text-align: center;
    margin-top: 0.5em;
    height: 4em;
    text-align: center;
    vertical-align: middle;
}

.plus-minus-button {
    width: 100%;
    border-radius: 30%;
    border: 1px solid rgb(172, 172, 172);
    background-color: rgb(31, 31, 31);
    color: rgb(172, 172, 172);
    font-size: 0.8em;
    padding: 0;
    margin: 0;
}

.plus-minus-button:hover {
    background-color: rgb(172, 172, 172);
    color: rgb(31, 31, 31);
}
</style>