<script setup lang="ts">
import PlannerSection from './PlannerSection.vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';

const { getItemImageLink } = usePlannerStore();

const { inventoryItems, inventory } = storeToRefs(usePlannerStore());

const craft = () => {
    console.log('craft');
};
</script>

<template>
    <PlannerSection title="Current Inventory" local-storage-id="inventory-controls-collapsed">
        <div class="container">
            <div class="row">
                <div class="col-2" v-for="item in inventoryItems">
                    <div class="item-col">
                        <div class="text-align-end">
                            <img :src="getItemImageLink(item)" :alt="item.name" class="img-thumbnail item-image" :style="{ opacity: inventory[item.itemId] > 0 ? '100%' : '30%' }" />
                            <div class="craft-button" v-if="item.buildingProductList.length > 0">
                                <button class="btn btn-primary" @click="craft">Craft</button>
                            </div>
                        </div>
                        <div class="name">
                            {{ item.name }}
                        </div>
                        <div class="count">
                            <input type="number" class="form-control" min="0" v-model="inventory[item.itemId]" />
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