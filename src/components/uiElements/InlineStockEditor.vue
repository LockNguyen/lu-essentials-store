<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  productId: string
  originalStockValue: number
  handleSubmit: (productId: string, newStockValue: number) => void
}>()

const newStockValue = ref(props.originalStockValue)
const isEditing = ref(false)
const isSubmitting = ref(false)

function startEditing() {
  isEditing.value = true
}

function finishEditing() {
  // prevent double submit due to pressing Enter key, which fires both v-on listeners
  if (isSubmitting.value) return
  isSubmitting.value = true // block double submissions

  try {
    props.handleSubmit(props.productId, newStockValue.value)
    isEditing.value = false
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div style="border-radius: 10px">
    <input
      v-if="isEditing"
      autofocus="true"
      id="search-input"
      class="input"
      v-model.number="newStockValue"
      @blur="finishEditing"
      @keyup.enter="finishEditing"
    />

    <span v-else @click="startEditing">{{ originalStockValue }}</span>
  </div>
</template>
