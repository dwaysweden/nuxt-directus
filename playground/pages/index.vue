<template>
  <div>
    <h1>Index Dashboard</h1>
    {{ user }}
    <hr />
    <button @click="logout()">Logout</button>
  </div>
</template>

<script setup>
const { logout, user } = useDirectusAuth()
</script>
