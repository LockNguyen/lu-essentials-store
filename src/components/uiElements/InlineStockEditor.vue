<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  productId: string
  productName: string
  originalStockValue: number
}>()

const newStockValue = ref(props.originalStockValue)
const isEditing = ref(false)
const isSubmitting = ref(false)

const emit = defineEmits<{
  'stock-update': [productId: string, newStockValue: number]
}>()

function startEditing() {
  isEditing.value = true
}

function finishEditing() {
  if (isSubmitting.value) return
  isSubmitting.value = true // boolean lock to prevent double submissions

  try {
    emit('stock-update', props.productId, newStockValue.value)
    isEditing.value = false
  } finally {
    isSubmitting.value = false
  }
}

function cancelEditing() {
  newStockValue.value = props.originalStockValue
  isEditing.value = false
}
</script>

<template>
  <div class="inline-flex items-center">
    <Input
      v-if="isEditing"
      v-model.number="newStockValue"
      class="h-8 w-24"
      :aria-label="'Edit stock for ' + productName"
      autofocus="true"
      @blur="finishEditing"
      @keyup.enter="finishEditing"
      @keyup.esc="cancelEditing"
    />

    <Button
      v-else
      type="button"
      variant="ghost"
      size="sm"
      class="h-8 px-2"
      :title="'Click to edit stock for ' + productName"
      :aria-label="'Edit stock for ' + productName + ', current stock is ' + originalStockValue"
      @click="startEditing"
    >
      {{ originalStockValue }}
    </Button>
  </div>
</template>
