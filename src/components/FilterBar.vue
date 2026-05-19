<script setup lang="ts">
import { useFiltersStore } from '@/stores/filtersStore'
import { useProductStore } from '@/stores/productStore'

import { Search } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// store imports
const filtersStore = useFiltersStore()
const productStore = useProductStore()
</script>

<template>
  <section class="rounded-xl border bg-card p-4 shadow-md">
    <div class="grid gap-4 grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_auto_auto] md:items-end">
      <div class="grid gap-2 col-span-2 md:col-span-1">
        <Label for="search-input">Search</Label>

        <div class="relative">
          <Search
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="search-input"
            v-model="filtersStore.searchQuery"
            type="search"
            class="pl-9"
            placeholder="Filter by product name…"
          />
        </div>
      </div>

      <div class="grid gap-2">
        <Label for="category-select">Category</Label>

        <Select v-model="filtersStore.category">
          <SelectTrigger id="category-select" class="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem
              v-for="category in productStore.productCategoryList"
              :key="category"
              :value="category"
            >
              {{ category }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="grid gap-2">
        <Label for="sort-select">Sort by price</Label>

        <Select v-model="filtersStore.sortDirection">
          <SelectTrigger id="sort-select" class="w-full">
            <SelectValue placeholder="Sort by price" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="asc">Price: Low → High</SelectItem>
            <SelectItem value="desc">Price: High → Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-2 rounded-md border px-3 py-2">
        <Checkbox
          id="in-stock-toggle"
          v-model="filtersStore.inStockOnly"
          aria-describedby="in-stock-description"
        />

        <Label for="in-stock-toggle" class="cursor-pointer text-sm font-medium leading-none">
          In-stock only
        </Label>
      </div>

      <Button type="button" variant="ghost" @click="filtersStore.resetFilters()">
        Reset filters
      </Button>
    </div>
  </section>
</template>
