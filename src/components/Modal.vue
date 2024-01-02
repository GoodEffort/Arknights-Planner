<!-- Vue 3 basic Modal with slots for header, body, and footer. Using bootstrap -->

<template>
    <div :class="{ show: show }" class="modal fade show modal-lg" tabindex="-1" role="dialog" aria-labelledby="modal-title">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><slot name="header">Modal Title</slot></h5>
                    <button type="button" class="close" aria-label="Close" @click="$emit('close')">
                        <span aria-hidden="true" >&times;</span>
                    </button>
                </div>

                <div class="modal-body">
                    <slot name="body">
                        <p>Modal body text goes here.</p>
                    </slot>
                </div>

                <div v-if="$slots.footer" class="modal-footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineEmits<{
    (e: 'close'): void;
}>();

const show = ref(false);

onMounted(() => {
    setTimeout(() => {
        show.value = true;
    }, 100);
});
onUnmounted(() => {
    setTimeout(() => {
        show.value = true;
    }, 100);
});
</script>

<style scoped>
.modal {
    display: block;
}

button.close {
    padding: 1rem;
    margin: -1rem -1rem -1rem auto;
    color: inherit;
    background-color: transparent;
}
</style>