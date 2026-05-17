<script setup lang="ts">
import { useProductStore } from '@/stores/productStore'
import { formatPrice } from '@/helpers/priceFormatter'

const productStore = useProductStore()
</script>

<template>
  <section class="table-wrapper">
    <table class="product-table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Category</th>
          <th scope="col">Price</th>
          <th scope="col">Stock</th>
          <th scope="col"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="productStore.filteredProductList.length === 0">
          <td colspan="5" class="empty-state">No products found.</td>
        </tr>

        <tr
          v-for="product in productStore.filteredProductList"
          :key="product.id"
          :class="{ 'row--out-of-stock': product.stock === 0 }"
        >
          <td>{{ product.name }}</td>
          <td>{{ product.category }}</td>
          <td>{{ formatPrice(product.price) }}</td>
          <td>
            <span>{{ product.stock }}</span>
            <span v-if="product.stock === 0" class="badge badge--danger"> Out-of-stock </span>
          </td>
          <td>
            <button class="btn btn--danger btn--sm" @click="productStore.removeProduct(product.id)">
              Remove
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
