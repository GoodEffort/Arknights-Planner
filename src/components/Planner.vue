<script lang="ts" setup>
import AddOperators from './AddOperators.vue';
import SelectedOperators from './SelectedOperators.vue';
import { usePlannerStore } from '../store/planner-store';
import { onMounted, ref } from 'vue';
import InventoryControls from './InventoryControls.vue';
import TotalCostOfPlan from './TotalCostOfPlan.vue';
import MissingItems from './MissingItems.vue';
import Farming from './Farming.vue';

const { loadCharacters, loadSavedRecords, getDriveClient, downloadFile, loadReservedItems } = usePlannerStore();

const isLoading = ref(true);

onMounted(async () => {
    await loadCharacters();
    loadSavedRecords(); // loads saved records from local storage
    loadReservedItems(); // loads reserved items from local storage

    if (localStorage.getItem("GoogleDriveTest") === "1") {
        const { credentials } = await getDriveClient();

        if (credentials !== null) {
            await downloadFile();
        }
    }

    isLoading.value = false;
});
</script>

<template>
    <div style="height: 100%;">
        <div v-if="!isLoading" class="mt-5">
            <SelectedOperators />
            <TotalCostOfPlan />
            <MissingItems />
            <Farming />
            <InventoryControls />
            <AddOperators />
        </div>
        <div v-else class="mt-5 spin-container">
            <img src="/trap_035_emperor_1.png" class="loading-penguin" />
        </div>
    </div>
</template>

<style scoped>
.spin-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    transform: scale(1) rotate(0deg);
    opacity: .8;
	animation: pulse 2s infinite;

}

@keyframes pulse {
	0% {
		transform: scale(0.55) rotate(0deg);
        opacity: .3;
	}

    25% {
        transform: scale(1) rotate(5deg);
        opacity: .8;
    }
    
    50% {
        transform: scale(1) rotate(-5deg);
        opacity: .8;
    }

	70% {
		transform: scale(1) rotate(0deg);
        opacity: .8;
	}

	100% {
		transform: scale(0.55) rotate(0deg);
        opacity: 0.3;
	}
}
</style>