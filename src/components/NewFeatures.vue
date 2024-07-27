<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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

const closeNewFeaturesModal = () => {
  show.value = false;
  localStorage.setItem('last-use-timestamp', new Date().toISOString());
};

const doNotShowAgain = ref(localStorage.getItem('do-not-show-again') === 'true');

watch(doNotShowAgain, (val) => {
  localStorage.setItem('do-not-show-again', val.toString());
});
</script>

<template>
  <modal v-model="show">
    <template #header>
      New Features
    </template>
    <template #body>
      <div>
        <h2>New Features</h2>
        <div>
          <h3>7/26/2024</h3>
          <p>
            Changed how data was being fetched, let me know if you run into any issues as this was a larger change.
          </p>
          <p>
            Added an Item BOM crafting modal, clicking the Hammer Icon will open it.
          </p>
        </div>
        <!-- <div>
          <h3>7/24/2024</h3>
          <ul>
            <li>Fixed EXP calculations, now calculated by value</li>
          </ul>
        </div>
        <div>
          <h3>7/17/2024</h3>
          <ul>
            <li>Added Amiya forms support</li>
            <li>Added a new feature to import and export data</li>
            <li>Added mobile support</li>
            <li>Added a new feature notification! (here it is!)</li>
          </ul>
        </div> -->
      </div>

      <div>
        <p>
          If you run into any issues or are missing a feature be sure to let me know here: <a
            href="https://github.com/GoodEffort/Arknights-Planner/issues">Github Issues</a>
        </p>
      </div>

      <div>
        <h2>Potential Features</h2>
        <div>
          <ul>
            <li>Optional Google Account sign in (for the feature below)</li>
            <li>Ability to save plans to your Google Drive so that you can use your plans between different devices and
              browsers</li>
          </ul>
        </div>
      </div>
      <div>
        <p>
          This is shown only once when new features are added, if you refresh after closing it (without the checkbox) it
          won't show until new features are added!
          If you would like to not see new features check the box below.
        </p>
        <input type="checkbox" class="formControl" v-model="doNotShowAgain" id="noshowagain" />
        <label for="noshowagain">Do not show this message again</label>
      </div>
    </template>
    <template #footer>
      <button class="btn btn-danger" @click="closeNewFeaturesModal">Close</button>
    </template>
  </modal>
</template>

<style scoped>
p {
  white-space: pre-line;
}

ul {
  list-style-type: none;
}
</style>