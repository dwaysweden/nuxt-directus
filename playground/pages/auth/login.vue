<template>
  <div>
    <h1>Login</h1>
    <button @click="login('test@test.se', 'test123')">Login</button>
    <button @click="loginWithProvider('google')">Login with google</button>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'guest' })
const { login, loginWithProvider } = useDirectusAuth()
</script>
