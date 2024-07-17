<script setup lang="ts">
defineEmits(['active', 'remove', 'plan', 'items']);
defineProps({
    active: Boolean,
    section: String
});
</script>

<template>
    <div class="row text-start d-none d-md-flex">
        <div class="col-2">
            <button type="button" class="btn" :class="`${active ? 'btn-success' : 'btn-secondary'}`"
                @click="$emit('active')">{{ active ? 'Active' : 'Inactive' }}</button>
        </div>
        <div class="col-8 text-center">
            <div class="btn-group" role="group" aria-label="Operator Controls">
                <button type="button" class="btn btn-secondary" @click="$emit('plan')" :class="{ active: section === 'Plan' }
                    ">Plan</button>
                <button type="button" class="btn btn-secondary" @click="$emit('items')"
                    :class="{ active: section === 'Items' }">Items</button>
            </div>
        </div>
        <div class="col-2 text-end">
            <button type="button" class="btn btn-danger" @click="$emit('remove')">Remove</button>
        </div>
    </div>
    <div class="row d-flex d-md-none">
        <div class="row">
            <div class="btn-group" role="group">
                <button type="button" class="btn" :class="`${active ? 'btn-success' : 'btn-secondary'}`"
                    @click="$emit('active')">{{ active ? 'Active' : 'Inactive' }}</button>
                <button type="button" class="btn btn-danger" @click="$emit('remove')">Remove</button>
            </div>
        </div>
        <div class="row mt-1">
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-secondary" @click="$emit('plan')" :class="{ active: section === 'Plan' }
                    ">Plan</button>
                <button type="button" class="btn btn-secondary" @click="$emit('items')"
                    :class="{ active: section === 'Items' }">Items</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
div.row.d-flex.d-md-none div.btn-group button.btn {
    width: 50%;
}

div.btn-group :first-child {
    border-right: 1px solid #000;
}
div.btn-group :last-child {
    border-left: 1px solid #000;
}
</style>