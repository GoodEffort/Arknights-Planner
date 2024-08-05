<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePlannerStore } from '../store/planner-store';

const { renderButton, downloadFile, updateFile } = usePlannerStore();
const googleLoginBtn = ref<HTMLElement | null>(null);

onMounted(() => {
    if (googleLoginBtn.value) {
        renderButton(googleLoginBtn.value);
    }
});
</script>

<template>
    <div ref="googleLoginBtn" style="color-scheme: light;" data-use_fedcm_for_prompt="true" />
    <div @click="downloadFile" style="cursor: pointer;">Download Drive Data</div>
    <div @click="updateFile" style="cursor: pointer;">Update Drive Data</div>
</template>