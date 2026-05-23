<script setup lang="ts">
import { computed, ref } from 'vue'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type GuardType = 'anything' | 'letters' | 'integer' | 'decimal'
type ValidatedValue = string | number

export type ValidationResult =
  | {
      valid: true
      value: ValidatedValue
    }
  | {
      valid: false
      error: string
    }

const props = withDefaults(
  defineProps<{
    id: string
    label: string
    guardType?: GuardType
    placeholder?: string
    required?: boolean
    positive?: boolean
    min?: number
    requiredMessage?: string
    invalidMessage?: string
    initialValue?: string | number
  }>(),
  {
    guardType: 'anything',
    placeholder: '',
    required: false,
    positive: false,
    requiredMessage: '',
    invalidMessage: '',
    initialValue: '',
  },
)

const emit = defineEmits<{
  validated: [value: ValidatedValue]
}>()

const rawValue = ref(String(props.initialValue))
const error = ref('')

const hasError = computed(() => error.value !== '')

const inputMode = computed(() => {
  if (props.guardType === 'decimal') return 'decimal'
  if (props.guardType === 'integer') return 'numeric'
  return 'text'
})

function fail(message: string): ValidationResult {
  error.value = message

  return {
    valid: false,
    error: message,
  }
}

function pass(value: ValidatedValue): ValidationResult {
  error.value = ''
  emit('validated', value)

  return {
    valid: true,
    value,
  }
}

function validate(): ValidationResult {
  const value = rawValue.value.trim()

  if (!value) {
    if (props.required) {
      return fail(
        props.requiredMessage || `Please do not leave ${props.label.toLowerCase()} blank.`,
      )
    }

    return pass('')
  }

  if (props.guardType === 'anything') {
    return pass(value)
  }

  if (props.guardType === 'letters') {
    // Allows letters from different languages, plus spaces,
    // apostrophes and hyphens between words.
    const lettersOnly = /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u

    if (!lettersOnly.test(value)) {
      return fail(
        props.invalidMessage || `Please enter letters only for ${props.label.toLowerCase()}.`,
      )
    }

    return pass(value)
  }

  if (props.guardType === 'integer') {
    if (!/^\d+$/.test(value)) {
      return fail(
        props.invalidMessage || `Please enter whole numbers only for ${props.label.toLowerCase()}.`,
      )
    }

    const numberValue = Number(value)

    if (!Number.isSafeInteger(numberValue)) {
      return fail(
        props.invalidMessage ||
          `Please enter a valid whole number for ${props.label.toLowerCase()}.`,
      )
    }

    if (props.positive && numberValue <= 0) {
      return fail(props.invalidMessage || `${props.label} must be greater than 0.`)
    }

    if (props.min !== undefined && numberValue < props.min) {
      return fail(props.invalidMessage || `${props.label} must be at least ${props.min}.`)
    }

    return pass(numberValue)
  }

  if (props.guardType === 'decimal') {
    // Accepts 12, 12.50 and .50. Rejects 12., 12.3.4 and 123abc.
    const decimalNumber = /^(?:\d+|\d*\.\d+)$/

    if (!decimalNumber.test(value)) {
      return fail(
        props.invalidMessage || `Please enter a valid number for ${props.label.toLowerCase()}.`,
      )
    }

    const numberValue = Number(value)

    if (!Number.isFinite(numberValue)) {
      return fail(
        props.invalidMessage || `Please enter a valid number for ${props.label.toLowerCase()}.`,
      )
    }

    if (props.positive && numberValue <= 0) {
      return fail(props.invalidMessage || `${props.label} must be greater than 0.`)
    }

    if (props.min !== undefined && numberValue < props.min) {
      return fail(props.invalidMessage || `${props.label} must be at least ${props.min}.`)
    }

    return pass(numberValue)
  }

  return fail(`Could not validate ${props.label.toLowerCase()}.`)
}

function clearError() {
  error.value = ''
}

function reset() {
  rawValue.value = ''
  error.value = ''
}

defineExpose({
  validate,
  reset,
})
</script>

<template>
  <div class="grid gap-2">
    <Label :for="id">
      {{ label }}
      <span v-if="required" class="text-destructive" aria-hidden="true"> * </span>
    </Label>

    <Input
      :id="id"
      v-model="rawValue"
      type="text"
      :inputmode="inputMode"
      :placeholder="placeholder"
      :aria-invalid="hasError || undefined"
      :aria-describedby="hasError ? `${id}-error` : undefined"
      :class="{
        'border-destructive ring-destructive/20 focus-visible:ring-destructive/30': hasError,
      }"
      @update:model-value="clearError"
    />

    <p v-if="hasError" :id="`${id}-error`" class="leading-none text-sm text-destructive">
      {{ error }}
    </p>
  </div>
</template>
