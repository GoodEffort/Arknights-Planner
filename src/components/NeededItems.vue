<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { Item } from '../types/item';
import PlannerSection from './PlannerSection.vue';

const { getItemImageLink } = usePlannerStore();

const { totalCosts, inventory, items } = storeToRefs(usePlannerStore());

const neededItems = computed(() => {
    const needed: { item: Item, count: number }[] = [];
    for (const key in totalCosts.value) {
        const count = totalCosts.value[key] - (inventory.value[key] ?? 0);
        if (count > 0) {
            const item = items.value[key];
            needed.push({ item, count });
        }
    }
    return needed;
});
</script>

<template>
    <PlannerSection title="Needed Items">
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
                            {{  count }}
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
</style>