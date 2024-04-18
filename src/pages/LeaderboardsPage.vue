<template>
  <div class="container px-[8%] space-y-4 mb-10">
    <base-card class="mt-4 flex gap-4">
      <router-link 
        :to="{ name: 'ra-leaderboards' }"
        class="
          border-2 border-slate-500
          px-6
          py-2
          rounded-sm
          transition
          hover:bg-slate-500
          inline-block">AimLabs</router-link>
      <router-link
        :to="{ name: 'ra-leaderboards-kvks' }"
        class="
          border-2 border-slate-500
          px-6
          py-2
          rounded-sm
          transition
          hover:bg-slate-500
          inline-block
        ">KovaaK's</router-link>
    </base-card>
    <router-view></router-view>
  </div>
</template>
<style scoped>
.router-link-active,
.router-link-exact-active {
  @apply bg-slate-500 text-white;
}
</style>

<script>
export default {
  mounted() {
    // this.$store.dispatch("fetchLeaderboard");
  },
};
</script>