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
      <div class="text-start">
        <div>
          <h2>New Features</h2>
          <div>
            <h4>8/11/2024 2</h4>
            <ul>
              <li>Improved performance of acquisition recommendations calculation</li>
            </ul>
          </div>
          <div>
            <h4>8/11/2024</h4>
            <h1>Crafting Recommendations</h1>
            <ul>
              <li>Added crafting recommendations to the Missing Items and Recommendations Section</li>
              <li>Moved farming, total cost, and breakdown to the missing items section</li>
            </ul>
          </div>
        </div>

        <div>
          <p>
            If you run into any issues or are missing a feature be sure to let me know here: <a
              href="https://github.com/GoodEffort/Arknights-Planner/issues">Github Issues</a>
          </p>
        </div>


        <div>
          <p>
            This is shown only once when new features are added, if you refresh after closing it (without the checkbox)
            it
            won't show until new features are added!
            If you would like to not see new features check the box below.
          </p>
          <input type="checkbox" class="formControl" v-model="doNotShowAgain" id="noshowagain" />
          <label for="noshowagain">Do not show this message again</label>
        </div>
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