<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
    (e: 'imported'): void;
}>();

const props = defineProps<{
    importData?: (importString: string) => void;
    exportData?: () => string;
}>();

const hasImport = ref(props.importData !== undefined);
const hasExport = ref(props.exportData !== undefined);

const importString = ref('');
const exportString = ref('');

const sendImportData = () => {
    if (props.importData && importString.value) {
        props.importData(importString.value);
        importString.value = '';
        emit('imported');
    }
    else {
        alert('No data to import');
    }
}

const pasteFromClipboard = async () => {
    const text = await navigator.clipboard.readText();
    importString.value = text;
};

const copyToClipboard = () => {
    navigator.clipboard.writeText(exportString.value);
};

if (hasImport.value && props.exportData) {
    exportString.value = props.exportData();
}
</script>

<template>
    <div class="row">
        <div class="col" v-if="hasExport">
            <h2>Export Data</h2>
        </div>
        <div class="col" v-if="hasImport">
            <h2>Import Data</h2>
        </div>
    </div>

    <div class="row">
        <div class="col" v-if="hasExport">
            <div class="mb-2">
                <slot name="export-info">
                </slot>
            </div>
        </div>
        <div class="col" v-if="hasImport">
            <div class="mb-2">
                <slot name="import-info">
                </slot>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col" v-if="hasExport">
            <div>
                <textarea rows="10" cols="50" readonly>{{ exportString }}</textarea>
            </div>
        </div>
        <div class="col" v-if="hasImport">
            <div>
                <textarea rows="10" cols="50" v-model="importString"></textarea>
            </div>
        </div>
    </div>
    
    <div class="row">
        <div class="col" v-if="hasExport">
            <button class="btn btn-success" @click="copyToClipboard">Copy To Clipboard</button>
        </div>
        <div class="col" v-if="hasImport">
            <button class="btn btn-primary" @click="pasteFromClipboard">Paste from Clipboard</button>
        </div>
    </div>
    <hr />
    <div class="row">
        <div class="col" v-if="hasExport">
        </div>
        <div class="col" v-if="hasImport">
            <button class="btn btn-success" @click="sendImportData">Import Data</button>
        </div>
    </div>
</template>