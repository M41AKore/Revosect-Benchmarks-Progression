<template>
  <header
    class="
      flex
      justify-between
      items-center
      px-16
      py-6
      bg-red-900
      shadow-lg
      text-white
    "
  >
    
    <div class="
    flex
    items-center
    gap-2
    ">
      <img
              :src="`../../rank-img/Asset 7@4x-8.png`"
              class="
              h-5
              "
              alt=""
          />
        <h1 class="text-2xl font-semibold">
        <router-link to="/home" id="header-text">Revosect Tracker</router-link>
      </h1>
      
    </div>
    
    <nav id="nav">
      <ul class="flex gap-4">
        <li v-for="link in navLinks" :key="link">
          <router-link
            class="
              px-4
              py-2
              uppercase
              text-md
              tracking-wide
              text-slate-400
              hover:text-slate-300
              transition
            "
            :class="
              $route.path.includes(link) ? 'router-link-exact-active' : ''
            "
            :to="'/' + link"
          >
            {{ link }}
          </router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  data() {
    return {
      navLinks: ["home", "users", "tasks", "leaderboards", "me"],
    };
  },
  computed: {},
};
</script>

<style scoped>
nav .router-link-active,
nav .router-link-exact-active {
  @apply text-white font-semibold tracking-wider;
}
</style>