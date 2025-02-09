<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePlannerStore } from '@/store/planner-store';

const { renderButton, getDriveClient } = usePlannerStore();
const googleLoginBtn = ref<HTMLElement | null>(null);
const isLoggedIn = ref(false);

const rerenderButton = async () => {
    if (googleLoginBtn.value) {
        renderButton(googleLoginBtn.value);
        const { credentials } = await getDriveClient();
        if (credentials !== null) {
            isLoggedIn.value = true;
        }
        renderButton(googleLoginBtn.value);
    }
};

onMounted(() => {
    rerenderButton();
});
</script>

<template>
    <div ref="googleLoginBtn" style="color-scheme: light;" data-use_fedcm_for_prompt="true" />
    <div v-if="isLoggedIn">
        <div>Syncing to Drive</div>
    </div>
</template>