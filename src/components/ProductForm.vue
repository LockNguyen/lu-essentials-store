<script setup lang="ts">
import { ref } from 'vue'
import { useProductStore } from '@/stores/productStore'

import ValidatedInput from '@/components/uiElements/ValidatedInput.vue'

import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const productStore = useProductStore()

const nameInput = ref<InstanceType<typeof ValidatedInput> | null>(null)
const categoryInput = ref<InstanceType<typeof ValidatedInput> | null>(null)
const priceInput = ref<InstanceType<typeof ValidatedInput> | null>(null)
const stockInput = ref<InstanceType<typeof ValidatedInput> | null>(null)

const emit = defineEmits<{
  created: []
  canceled: []
}>()

function handleSubmit() {
  const validatedName = nameInput.value?.validate()
  const validatedCategory = categoryInput.value?.validate()
  const validatedPrice = priceInput.value?.validate()
  const validatedStock = stockInput.value?.validate()

  if (
    !validatedName?.valid ||
    !validatedCategory?.valid ||
    !validatedPrice?.valid ||
    !validatedStock?.valid
  ) {
    toast.error('Please correct the highlighted fields before submitting.')
    return
  }

  const success = productStore.addProduct({
    name: String(validatedName.value),
    category: String(validatedCategory.value),
    price: Number(validatedPrice.value),
    stock: Number(validatedStock.value),
  })

  if (success) {
    emit('created')
  }
}
</script>

<template>
  <Dialog :open="true">
    <DialogContent class="sm:max-w-lg [&>button]:hidden">
      <DialogHeader>
        <DialogTitle>Add a new product</DialogTitle>
        <DialogDescription> Fill out the product details below. </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" @submit.prevent="handleSubmit">
        <ValidatedInput
          ref="nameInput"
          id="product-name"
          label="Name"
          guardType="anything"
          required
          placeholder="Type product name…"
          required-message="Please do not leave the product name blank."
        />

        <ValidatedInput
          ref="categoryInput"
          id="product-category"
          label="Category"
          guardType="anything"
          placeholder="Type product category..."
        />

        <ValidatedInput
          ref="priceInput"
          id="product-price"
          label="Price"
          guardType="decimal"
          required
          positive
          placeholder="Type product price..."
          required-message="Please do not leave the price blank."
          invalid-message="Please enter a price greater than 0, using numbers and at most one decimal point."
        />

        <ValidatedInput
          ref="stockInput"
          id="product-stock"
          label="Stock"
          guardType="integer"
          required
          :min="0"
          placeholder="Type product stock..."
          required-message="Please do not leave the stock blank."
          invalid-message="Please enter 0 or a positive whole number for stock."
        />

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('canceled')"> Cancel </Button>

          <Button type="submit"> Add to changes </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
