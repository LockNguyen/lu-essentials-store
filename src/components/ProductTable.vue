<script setup lang="ts">
import { useProductStore } from '@/stores/productStore'
import { formatPrice } from '@/helpers/priceFormatter'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-vue-next'
import InlineEditor from '@/components/uiElements/InlineStockEditor.vue'

// store imports
const productStore = useProductStore()
</script>

<template>
  <section class="w-full rounded-xl border bg-background shadow-md">
    <Table class="w-full table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead class="w-[30%]">Name</TableHead>
          <TableHead class="w-[22%]">Category</TableHead>
          <TableHead class="w-[14%]">Price</TableHead>
          <TableHead class="w-[22%]">Stock</TableHead>
          <TableHead class="w-[12%] text-right">
            <span>Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow v-if="productStore.filteredProductList.length === 0">
          <TableCell colspan="5" class="h-24 text-center text-muted-foreground">
            No products found.
          </TableCell>
        </TableRow>

        <TableRow
          v-for="product in productStore.filteredProductList"
          :key="product.id"
          :class="product.stock === 0 ? 'bg-destructive/5' : ''"
        >
          <TableCell class="font-medium">
            {{ product.name }}
          </TableCell>

          <TableCell>
            {{ product.category }}
          </TableCell>

          <TableCell>
            {{ formatPrice(product.price) }}
          </TableCell>

          <TableCell>
            <div class="flex items-center gap-2">
              <InlineEditor
                :key="product.id"
                :product-id="product.id"
                :original-stock-value="product.stock"
                :handle-submit="productStore.updateStock"
              />

              <Badge v-if="product.stock === 0" variant="destructive"> Out-of-stock </Badge>
            </div>
          </TableCell>

          <TableCell class="text-right">
            <Button variant="destructive" size="sm" @click="productStore.removeProduct(product.id)">
              <Trash2 />
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </section>
</template>
