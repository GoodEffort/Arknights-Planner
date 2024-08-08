<script setup lang="ts">
import { computed } from 'vue';
import Modal from './Modal.vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';

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

const store = usePlannerStore();
const { googleDriveTest } = storeToRefs(store);

const joinGoogleDriveTest = () => {
  if (confirm('Make sure you export your data before trying this. Are you sure you want to try Google Drive Sync Test?')) {
    localStorage.setItem('GoogleDriveTest', '1');
    googleDriveTest.value = true;
    window.location.reload(); // reload the page to get the auth flow correct
  }
};

const leaveGoogleDriveTest = () => {
  localStorage.removeItem('GoogleDriveTest');
  googleDriveTest.value = false;
  window.location.reload();
};
</script>

<template>
    <modal v-model="show">
        <template #header>
            Settings (not much here yet, more to come)
        </template>
        <template #body>
            <div>
                <div>
                    <button class="btn btn-primary" @click="joinGoogleDriveTest">Try Google Drive Sync Test</button>
                    <hr />
                    <button class="btn btn-danger" @click="leaveGoogleDriveTest">Leave Google Drive Sync Test</button>
                </div>
            </div>
        </template>
        <template #footer>
            <button class="btn btn-danger" @click="show = false">Close</button>
        </template>
    </modal>
</template>