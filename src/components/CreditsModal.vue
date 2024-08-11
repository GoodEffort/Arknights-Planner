<script setup lang="ts">
import { computed } from 'vue';
import Modal from './Modal.vue';

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
</script>

<template>
    <modal v-model="show">
        <template #header>
            Data Source Credits
        </template>
        <template #body>
            <div>
                <div>This calculator was made by Luke Hovarter</div>
                <div>Find me on <a href="https://github.com/GoodEffort">GitHub</a>!</div>
                <div>Repository here: <a href="https://github.com/GoodEffort/Arknights-Planner">Arknights-Planner</a>
                </div>

                <div class="mt-4">Thanks to the following sources for data:</div>
                <div>
                    <a href="https://github.com/Kengxxiao/ArknightsGameData_YoStar">Kengxxiao's Yostar info</a>
                </div>

                <div>
                    <a href="https://github.com/Kengxxiao/ArknightsGameData">Kengxxiao's CN client info</a>
                </div>
                <div>
                    <a href="https://github.com/Aceship/Arknight-Images">Aceship for images</a>
                </div>
                <div>
                    <a href="https://github.com/ArknightsAssets/ArknightsAssets">ArknightsAssets for images</a>
                </div>
                <div>
                    <a href="https://docs.google.com/spreadsheets/d/12X0uBQaN7MuuMWWDTiUjIni_MOP015GnulggmBJgBaQ/">This
                        super
                        impressive Google Sheet of most efficient maps by momo.moe / u/elmoe0715</a>
                </div>
            </div>
            <div>
                <a href="https://ak.gamepress.gg/news/arknights-material-farming-efficiency-best-stages-farm">Gamepress
                    for
                    material farming efficiency quick reference</a>
            </div>
        </template>
        <template #footer>
            <button class="btn btn-danger" @click="show = false">Close</button>
        </template>
    </modal>
</template>