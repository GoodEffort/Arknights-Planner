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
            <h3>8/6/2024</h3>
            <ul>
              <li>
                - Added a new import from ArkPRTS. This will merge that data with your already input data so that you
                can easily fill out your operators and inventory quickly.
              </li>
              <li>
                - Added the ability to hide/show inactive operators in the selected operators section.
              </li>
              <li>
                - Added the ability sort operators by inactive/active and name in the selected operators section.
              </li>
              <li>
                - Added the ablility to manually sort operators in the selected operators section.
              </li>
              <li class="text-warning">
                - Warning: If you have a manual sort and click the sort by name or active/inactive it will reset the manual sort!
              </li>
            </ul>
            <h3>8/5/2024</h3>
            <ul>
              <li>
                - Redesigned UI to allow for more buttons and features in the future. Like the one in testing below.
              </li>
              <li>
                - Added a test for syncing to Google Drive.
              </li>
              <li>
                - I believe I am the only one with access to the API, but if you click the button in settings it may ask
                you to login after reloading the page, but I'm 99% sure it only works for me as of right now.
              </li>
              <li>
                - If you do click that there is a button right underneath it to disable it until I can get it working
                for everyone after a bit of testing.
              </li>
              <li>
                - Bug fix: 2 and 3 Star Operators had the Skill Masteries tab showing up. This has been fixed.
              </li>
            </ul>
          </div>
          <!-- <h3>8/2/2024</h3>
          <p>
            Updated module display to show the modules icon and a more detailed type.

            Added a popup on the module icon to show the module story. Eventually this will show the module stats and
            effect as well.
          </p>
          <h3>7/28/2024</h3>
          <p>
            Updated Modules to support future module types (hopefully).

            This is for the new IS only modules for Phantom and Kal'tsit in CN. Hopefully these changes will
            automatically pick those up when they are added to the game.

            I had to update the underlying data structures for plans so if you run into any issues please let me know.
            I had to change how imports/exports worked to support as well but I believe you shouldn't even be able to
            notice anything.
          </p>
          <p>
            Also updated module and skill display to show the name of the skills and modules.
            And Skill Icons
          </p>
        </div> -->
          <!-- <div>
          <h3>7/26/2024</h3>
          <p>
            Changed how data was being fetched, let me know if you run into any issues as this was a larger change.
          </p>
          <p>
            Added an Item BOM crafting modal, clicking the Hammer Icon will open it.
          </p>
        </div> -->
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