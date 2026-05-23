<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import ValidatedInput from '@/components/uiElements/ValidatedInput.vue'

const props = defineProps<{
  productId: string
  productName: string
  originalStockValue: number
}>()

const stockInput = ref<InstanceType<typeof ValidatedInput> | null>(null)

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

  const ValidatedStockInput = stockInput.value?.validate()

  if (!ValidatedStockInput?.valid) {
    if (ValidatedStockInput) {
      toast.error(ValidatedStockInput.error)
    }

    return
  }

  if (typeof ValidatedStockInput.value !== 'number') {
    toast.error('Please enter 0 or a positive whole number for stock.')
    return
  }

  isSubmitting.value = true // boolean lock to prevent double submissions

  try {
    emit('stock-update', props.productId, ValidatedStockInput.value)
    isEditing.value = false
  } finally {
    isSubmitting.value = false
  }
}

function cancelEditing() {
  isEditing.value = false
}
</script>

<template>
  <div class="inline-flex items-center">
    <ValidatedInput
      v-if="isEditing"
      ref="stockInput"
      :id="`stock-${productId}`"
      :aria-label="`Edit stock for ${productName}`"
      guard-type="integer"
      required
      :min="0"
      :initial-value="originalStockValue"
      :show-error="false"
      required-message="Please do not leave stock blank."
      invalid-message="Please enter 0 or a positive whole number for stock."
      @blur="finishEditing"
      @enter="finishEditing"
      @escape="cancelEditing"
    />

    <Button
      v-else
      type="button"
      variant="ghost"
      size="sm"
      class="h-8 px-2"
      :title="`Click to edit stock for ${productName}`"
      :aria-label="`Edit stock for ${productName}, current stock is ${originalStockValue}`"
      @click="startEditing"
    >
      {{ originalStockValue }}
    </Button>
  </div>
</template>
