<template>
  <div>
    <h1>Callback</h1>
    <NuxtLink to="/auth/login"> Login </NuxtLink>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'guest' })
</script>
