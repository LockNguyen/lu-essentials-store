<script setup lang="ts">
import { ref } from 'vue'
import { useProductStore } from '@/stores/productStore'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// store imports
const productStore = useProductStore()

// form fields
const productName = ref('')
const productCategory = ref('')
const productPrice = ref<number>(0)
const productStock = ref<number>(0)

const emit = defineEmits<{
  created: []
  canceled: []
}>()

// helpers
function handleSubmit() {
  const success = productStore.addProduct({
    name: productName.value,
    category: productCategory.value,
    price: productPrice.value,
    stock: productStock.value,
  })

  if (success) {
    emit('created')
  }
}
</script>

<template>
  <Dialog :open="true" @update:open="(open) => !open && emit('canceled')">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Add a new product</DialogTitle>
        <DialogDescription> Fill out the product details below. </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" @submit.prevent="handleSubmit">
        <div class="grid gap-2">
          <Label for="product-name">Name</Label>
          <Input
            id="product-name"
            v-model="productName"
            type="text"
            placeholder="Type product name…"
          />
        </div>

        <div class="grid gap-2">
          <Label for="product-category">Category</Label>
          <Input
            id="product-category"
            v-model="productCategory"
            type="text"
            placeholder="Type product category..."
          />
        </div>

        <div class="grid gap-2">
          <Label for="product-price">Price</Label>
          <Input
            id="product-price"
            v-model.number="productPrice"
            placeholder="Type product price..."
            inputmode="numeric"
            pattern="[0-9]*"
            oninvalid="this.setCustomValidity('Please enter positive numbers only.')"
            oninput="this.setCustomValidity('')"
          />
        </div>

        <div class="grid gap-2">
          <Label for="product-stock">Stock</Label>
          <Input
            id="product-stock"
            v-model.number="productStock"
            placeholder="Type product stock..."
            inputmode="numeric"
            pattern="[0-9]*"
            oninvalid="this.setCustomValidity('Please enter positive whole numbers only.')"
            oninput="this.setCustomValidity('')"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('canceled')"> Cancel </Button>

          <Button type="submit"> Add to changes </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
