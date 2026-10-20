<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/gestao/pendencias-white-martins', { redirectCode: 301 })
    }
  ]
})
</script>
<template>
  <div />
</template>
