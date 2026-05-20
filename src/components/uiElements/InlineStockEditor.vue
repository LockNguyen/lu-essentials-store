<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'vue-sonner'

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
  if (isSubmitting.value) return
  isSubmitting.value = true // block double submissions

  try {
    props.handleSubmit(props.productId, newStockValue.value)
    isEditing.value = false
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Could not submit.')
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
      aria-label="Edit stock"
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
      title="Click to edit stock"
      @click="startEditing"
    >
      {{ originalStockValue }}
    </Button>
  </div>
</template>
