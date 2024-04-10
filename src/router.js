import { createRouter, createWebHistory } from "vue-router";

//Pages
import HomePage from "./pages/HomePage.vue";
import ProfileSearch from "./pages/ProfileSearch.vue";
import TaskSearch from "./pages/TaskSearch.vue";
import PlayerProfile from "./pages/PlayerProfile.vue";
import PlayerTasksOverview from "./pages/PlayerTasksOverview.vue";
import RevosectBenchmarksPage from "./pages/RevosectBenchmarksPage.vue";
import RevosectBenchmarksPageS2 from "./pages/RevosectBenchmarksPageS2.vue";
import RevosectBenchmarksPageKvks from "./pages/RevosectBenchmarksPageKvks.vue";
import LeaderboardsPage from "./pages/LeaderboardsPage.vue";
import RevosectLeaderboardsPage from "./pages/RevosectLeaderboardsPage.vue";
import TaskView from "./pages/TaskView.vue";
import AboutPage from "./pages/AboutPage.vue";
import Me_Viewer from "./pages/Me_Viewer.vue";
// import TaskLeaderboard from "./pages/TaskLeaderboard.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/home" },
    { path: "/home", component: HomePage },
    {
      path: "/users",
      component: ProfileSearch,
      beforeEnter: (_, from) => {
        if (from.name == "profile-overview") {
          sessionStorage.removeItem("currentPlayer");
          return;
        }
        if (sessionStorage.getItem("currentPlayer")) {
          router.push("/users/" + sessionStorage.getItem("currentPlayer"));
        }
      },
    },
    {
      path: "/users/:username",
      component: PlayerProfile,
      props: true,
      children: [
        {
          path: "",
          redirect: { name: "profile-overview" },
        },
        {
          name: "profile-overview",
          path: "overview",
          component: PlayerTasksOverview,
        },
        {
          name: "ra-benches",
          path: "revosect",
          component: RevosectBenchmarksPage,
        },
        {
          name: "ra-benches-s2",
          path: "revosect",
          component: RevosectBenchmarksPageS2,
        },
      ],
    },
    {
      path: "/tasks",
      component: TaskSearch,
      beforeEnter: (_, from) => {
        if (from.name == "task-view") {
          sessionStorage.removeItem("currentTask");
          return;
        }
        if (sessionStorage.getItem("currentTask")) {
          router.push("/tasks/" + sessionStorage.getItem("currentTask"));
        }
      },
    },
    {
      path: "/tasks/:taskId",
      redirect: { name: "task-view" },
    },
    {
      name: "task-view",
      path: "/tasks/:taskId/leaderboard",
      component: TaskView,
      props: true,
    },

    {
      path: "/leaderboards",
      component: LeaderboardsPage,
      children: [
        { path: "", redirect: { name: "ra-leaderboards" } },
        {
          name: "ra-leaderboards",
          path: "ra",
          component: RevosectLeaderboardsPage,
        },
      ],
    },
    { path: "/about", component: AboutPage },
    { path: "/:notFound(.*)", component: null },

    {
      path: "/me",
      component: Me_Viewer,
      props: true,
      children: [
        {
          path: "",
          redirect: { name: "me-overview" },
        },
        {
          name: "me-overview",
          path: "overview",
          component: PlayerTasksOverview,
        },
        {
          name: "me-ra-benches",
          path: "revosect",
          component: RevosectBenchmarksPage,
        },
        {
          name: "me-ra-benches-s2",
          path: "revosect",
          component: RevosectBenchmarksPageS2,
        },
        {
          name: "me-ra-benches-s4kvks",
          path: "revosect",
          component: RevosectBenchmarksPageKvks,
        }
      ],
    }
  ],
});

export default router;
