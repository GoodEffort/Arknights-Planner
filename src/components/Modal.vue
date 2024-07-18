<!-- Vue 3 basic Modal with slots for header, body, and footer. Using bootstrap -->

<template>
    <Transition>
        <div :class="{ show: show }" class="modal fade show modal-lg" tabindex="-1" role="dialog"
            aria-labelledby="modal-title" v-if="show" @click.self="close">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <slot name="header">Modal Title</slot>
                        </h5>
                        <button type="button" class="close" aria-label="Close" @click="close">
                            <span aria-hidden="true">&times;</span>
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
    </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const close = () => show.value = false;
</script>

<style scoped>
.modal.fade {
    background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
    display: block;
}

.modal.dialog {
    opacity: 100%;
}

.modal-body {
    max-height: 70vh;
    overflow-y: auto;
}

button.close {
    padding: 1rem;
    margin: -1rem -1rem -1rem auto;
    color: inherit;
    background-color: transparent;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>