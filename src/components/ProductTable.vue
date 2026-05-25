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
import { LOW_STOCK_THRESHOLD } from '@/types'
import InlineEditor from '@/components/uiElements/InlineStockEditor.vue'

const productStore = useProductStore()
</script>

<template>
  <section
    class="flex min-h-0 flex-col overflow-hidden rounded-md border bg-card shadow-md"
    aria-label="Product List"
  >
    <div class="min-h-0 overflow-auto">
      <Table class="min-w-190 w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead class="w-[30%] font-bold pl-4">Name</TableHead>
            <TableHead class="w-[22%] font-bold">Category</TableHead>
            <TableHead class="w-[14%] font-bold">Price</TableHead>
            <TableHead class="w-[22%] font-bold">Stock</TableHead>
            <TableHead class="w-[12%] font-bold pr-4 text-right">
              <span>Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <!-- Empty product list display -->
          <TableRow v-if="productStore.filteredProductList.length === 0">
            <TableCell colspan="5" class="h-24 text-center text-muted-foreground">
              No products found.
            </TableCell>
          </TableRow>

          <!-- Product list display -->
          <TableRow
            v-for="product in productStore.filteredProductList"
            :key="product.id"
            :class="{
              'bg-stock-low-background/30 hover:bg-stock-low-background/50':
                product.stock <= LOW_STOCK_THRESHOLD && product.pendingStatus !== 'deleted',
            }"
          >
            <TableCell class="font-medium pl-4">
              <div class="flex items-center gap-2">
                <span :class="product.pendingStatus === 'deleted' ? 'line-through' : ''">
                  {{ product.name }}
                </span>

                <Badge
                  v-if="product.pendingStatus === 'added'"
                  variant="outline"
                  class="text-green-600"
                >
                  New
                </Badge>
                <Badge
                  v-else-if="product.pendingStatus === 'stockUpdated'"
                  variant="outline"
                  class="text-amber-500"
                >
                  Stock Updated
                </Badge>
                <Badge
                  v-else-if="product.pendingStatus === 'deleted'"
                  variant="outline"
                  class="text-red-600"
                >
                  Deleted
                </Badge>
              </div>
            </TableCell>

            <TableCell>
              <span :class="product.pendingStatus === 'deleted' ? 'line-through' : ''">{{
                product.category
              }}</span>
            </TableCell>

            <TableCell>
              <span :class="product.pendingStatus === 'deleted' ? 'line-through' : ''">
                {{ formatPrice(product.price) }}
              </span>
            </TableCell>

            <TableCell>
              <div class="flex items-center gap-2">
                <span v-if="product.pendingStatus === 'deleted'" class="line-through">
                  {{ product.stock }}
                </span>

                <InlineEditor
                  v-else
                  :key="product.id"
                  :product-id="product.id"
                  :product-name="product.name"
                  :original-stock-value="product.stock"
                  @stock-update="productStore.updateStock"
                />

                <Badge
                  v-if="product.stock <= LOW_STOCK_THRESHOLD && product.pendingStatus !== 'deleted'"
                  variant="outline"
                  class="bg-stock-low-background border-stock-low-border text-stock-low"
                >
                  Low-stock
                </Badge>
              </div>
            </TableCell>

            <TableCell class="text-right pr-4">
              <Button
                variant="outline"
                class="hover:bg-destructive hover:text-primary-foreground px-3!"
                size="lg"
                :disabled="product.pendingStatus === 'deleted'"
                :aria-label="'Delete ' + product.name"
                @click="productStore.removeProduct(product.id)"
              >
                <Trash2 class="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </section>
</template>
