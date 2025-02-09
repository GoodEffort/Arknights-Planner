<template>
    <div @mouseenter="show = true" @mouseleave="show = false" class="tooltip-bubble-container">
        <slot></slot>
        <Transition>
            <div v-if="show" class="tooltip-bubble" :style="`top: ${ top }px`">
                <div class="tooltip-bubble-text">
                    <p ref="pText" v-html="tooltipText.replaceAll('\n', '<br/>')"></p>
                    <div class="tooltip-bubble-arrow"></div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

defineProps<{
    tooltipText: string;
}>();

const show = ref(false);
const pText = ref<HTMLParagraphElement | null>(null);

const top = computed(() => {
    if (pText.value) {
        return -(pText.value.clientHeight + 20);
    }
    return 0;
});
</script>

<style scoped>
.tooltip-bubble-container {
    position: absolute;
    display: inline-block;
}

.tooltip-bubble {
    position: absolute;
    z-index: 1000;
    transform: translateX(-50%);
    left: 50%;
    pointer-events: none;
}

.tooltip-bubble-text {
    position: relative;
    background-color: rgb(87, 95, 101);
    color: white;
    padding: 0.5rem;
    border-radius: 0.5rem;
    z-index: 1000;
    white-space: nowrap;
    border: 1px solid rgb(13, 110, 253);
}

.tooltip-bubble-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-left: 0.5rem solid transparent;
    border-right: 0.5rem solid transparent;
    border-top: 0.5rem solid rgb(13, 110, 253);
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
}

.tooltip-bubble-text p {
    margin: 0;
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