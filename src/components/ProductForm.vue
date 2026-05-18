<script setup lang="ts">
import { ref } from 'vue'
import { useProductStore } from '@/stores/productStore'
import ButtonWithIcon from './ui_elements/ButtonWithIcon.vue'

// store imports
const productStore = useProductStore()

// form fields
const productName = ref('')
const productCategory = ref('')
const productPrice = ref<number>(0)
const productStock = ref<number>(0)

const emit = defineEmits<{
  created: []
  cancel: []
}>()

// helpers
function handleSubmit() {
  productStore.addProduct({
    name: productName.value,
    category: productCategory.value,
    price: productPrice.value,
    stock: productStock.value,
  })

  emit('created')
}
</script>

<template>
  <section>
    <div class="product-form">
      <h1>Add a new Product</h1>
      <div class="form-grid">
        <ButtonWithIcon type="button" text="X" @click="emit('cancel')" />
        <div class="form-group">
          <label for="search-input" class="filter-label">Name</label>
          <input
            id="search-input"
            class="input"
            type="text"
            v-model="productName"
            placeholder="Type product name…"
          />
        </div>

        <div class="form-group">
          <label for="search-input" class="filter-label">Category</label>
          <input
            id="search-input"
            class="input"
            type="text"
            v-model="productCategory"
            placeholder="Type product category..."
          />
        </div>

        <div class="form-group">
          <label for="search-input" class="filter-label">Price</label>
          <input
            id="search-input"
            class="input"
            v-model="productPrice"
            placeholder="Type product price..."
          />
        </div>

        <div class="form-group">
          <label for="search-input" class="filter-label">Stock</label>
          <input
            id="search-input"
            class="input"
            v-model="productStock"
            placeholder="Type product stock..."
          />
        </div>

        <div class="form-group">
          <ButtonWithIcon id="search-input" type="button" text="Submit" @click="handleSubmit" />
        </div>
      </div>
    </div>
  </section>
</template>
