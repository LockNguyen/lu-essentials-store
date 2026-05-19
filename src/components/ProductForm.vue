<script setup lang="ts">
import { ref } from 'vue'
import { useProductStore } from '@/stores/productStore'
import ButtonWithIcon from '@/components/uiElements/ButtonWithIcon.vue'

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
        <ButtonWithIcon text="X" @click="emit('canceled')" />
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
            v-model.number="productPrice"
            placeholder="Type product price..."
          />
        </div>

        <div class="form-group">
          <label for="search-input" class="filter-label">Stock</label>
          <input
            id="search-input"
            class="input"
            v-model.number="productStock"
            placeholder="Type product stock..."
          />
        </div>

        <div class="form-group">
          <ButtonWithIcon id="search-input" text="Submit" @click="handleSubmit" />
        </div>
      </div>
    </div>
  </section>
</template>
