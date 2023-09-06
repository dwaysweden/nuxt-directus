<template>
  <div>
    <h1>Request new password</h1>
    <button @click="requestPasswordReset('test@test.se')">
      Request password reset
    </button>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'guest' })
const { requestPasswordReset } = useDirectusAuth()
</script>
