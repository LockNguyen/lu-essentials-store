<script setup lang="ts">
import { Button } from '../ui/button'
import { useProductStore } from '@/stores/productStore'

const productStore = useProductStore()
</script>

<template>
  <section
    v-if="productStore.hasUnsavedChanges"
    class="z-50 rounded-xl border bg-card p-4 shadow-md"
    aria-label="Unsaved Changes Panel"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <p class="font-medium">You have unsaved changes</p>
        <p class="text-sm text-muted-foreground">
          {{ productStore.pendingAddCount }} new, {{ productStore.pendingStockUpdateCount }} edited,
          {{ productStore.pendingDeleteCount }} deleted
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          :disabled="productStore.isAwaitingSave"
          @click="productStore.clearPendingChanges"
          size="lg"
        >
          Cancel
        </Button>

        <Button
          :disabled="productStore.isAwaitingSave"
          @click="productStore.submitPendingChangesToDatabase"
          size="lg"
        >
          {{ productStore.isAwaitingSave ? 'Saving...' : 'Submit' }}
        </Button>
      </div>
    </div>
  </section>
</template>
