<template>
  <footer class="inset-x-0 bg-red-900">
    <div class="px-[10%] py-4">
      <p class="text-center text-slate-300">
        Revosect & Saibot | {{ year }} | <router-link to="/about">About</router-link>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  computed: {
    year() {
      let date = new Date();
      return date.getFullYear();
    },
  },
};
</script>