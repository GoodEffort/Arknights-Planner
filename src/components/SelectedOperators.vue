<script lang="ts" setup>
import PlannerSection from './PlannerSection.vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import OperatorControls from './OperatorControls.vue';

const { selectedCharacters } = storeToRefs(usePlannerStore());
</script>

<template>
    <PlannerSection title="Selected Operators" :initial-state="true">
        <div class="container">
            <div class="row" v-for="character in selectedCharacters" :key="character.id">
                <OperatorControls :character="character" />
            </div>
        </div>
    </PlannerSection>
</template>