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
    label?: string
    ariaLabel?: string
    guardType?: GuardType
    placeholder?: string
    required?: boolean
    positive?: boolean
    min?: number
    requiredMessage?: string
    invalidMessage?: string
    initialValue?: string | number
    showError?: boolean
  }>(),
  {
    label: '',
    ariaLabel: '',
    guardType: 'anything',
    placeholder: '',
    required: false,
    positive: false,
    requiredMessage: '',
    invalidMessage: '',
    initialValue: '',
    showError: true,
  },
)

const emit = defineEmits<{
  validated: [value: ValidatedValue]
  blur: []
  enter: []
  escape: []
}>()

const rawValue = ref(String(props.initialValue))
const error = ref('')

const hasLabel = computed(() => props.label.trim() !== '')
const hasError = computed(() => error.value !== '')
const fieldName = computed(() => props.label.toLowerCase() || 'this field')

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
      return fail(props.requiredMessage || `Please do not leave ${fieldName.value} blank.`)
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
      return fail(props.invalidMessage || `Please enter letters only for ${fieldName.value}.`)
    }

    return pass(value)
  }

  if (props.guardType === 'integer') {
    if (!/^\d+$/.test(value)) {
      return fail(props.invalidMessage || `Please enter whole numbers only for ${fieldName.value}.`)
    }

    const numberValue = Number(value)

    if (!Number.isSafeInteger(numberValue)) {
      return fail(
        props.invalidMessage || `Please enter a valid whole number for ${fieldName.value}.`,
      )
    }

    if (props.positive && numberValue <= 0) {
      return fail(props.invalidMessage || `${props.label || 'This value'} must be greater than 0.`)
    }

    if (props.min !== undefined && numberValue < props.min) {
      return fail(
        props.invalidMessage || `${props.label || 'This value'} must be at least ${props.min}.`,
      )
    }

    return pass(numberValue)
  }

  if (props.guardType === 'decimal') {
    const decimalNumber = /^(?:\d+|\d*\.\d+)$/

    if (!decimalNumber.test(value)) {
      return fail(props.invalidMessage || `Please enter a valid number for ${fieldName.value}.`)
    }

    const numberValue = Number(value)

    if (!Number.isFinite(numberValue)) {
      return fail(props.invalidMessage || `Please enter a valid number for ${fieldName.value}.`)
    }

    if (props.positive && numberValue <= 0) {
      return fail(props.invalidMessage || `${props.label || 'This value'} must be greater than 0.`)
    }

    if (props.min !== undefined && numberValue < props.min) {
      return fail(
        props.invalidMessage || `${props.label || 'This value'} must be at least ${props.min}.`,
      )
    }

    return pass(numberValue)
  }

  return fail(`Could not validate ${fieldName.value}.`)
}

function clearError() {
  error.value = ''
}

function reset(value: string | number = '') {
  rawValue.value = String(value)
  error.value = ''
}

defineExpose({
  validate,
  reset,
})
</script>

<template>
  <div class="grid gap-2">
    <Label v-if="hasLabel" :for="id">
      {{ label }}
      <span v-if="required" class="text-destructive" aria-hidden="true"> * </span>
    </Label>

    <Input
      :id="id"
      v-model="rawValue"
      type="text"
      :inputmode="inputMode"
      :placeholder="placeholder"
      :aria-label="ariaLabel || undefined"
      :aria-invalid="hasError || undefined"
      :aria-describedby="hasError && showError ? `${id}-error` : undefined"
      :class="{
        'border-destructive ring-destructive/20 focus-visible:ring-destructive/30': hasError,
      }"
      @update:model-value="clearError"
      @blur="emit('blur')"
      @keyup.enter.prevent="emit('enter')"
      @keyup.escape.prevent="emit('escape')"
    />

    <p
      v-if="hasError && showError"
      :id="`${id}-error`"
      class="leading-none text-sm text-destructive"
    >
      {{ error }}
    </p>
  </div>
</template>
