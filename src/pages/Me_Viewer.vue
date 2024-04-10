<template>
   <div class="px-[8%] relative">
    <section class="py-8 flex items-start justify-between">
      <base-card
        v-if="isLoading"
        class="grid place-items-center max-w-md py-5 px-10">
        <loading-spinner></loading-spinner>
      </base-card>
      <base-card
        v-else
        class="
          bg-slate-700
          text-gray-900
          tracking-wide
          p-8
          flex flex-1
          gap-10
          max-w-xl
        ">
       <div class="flex flex-col gap-4 w-[40%]">
          <span class="block text-2xl font-semibold">{{
            playerInfo.username
          }}</span>
          <span class="block"
            >{{ playerInfo.rank }} -
            {{ Math.floor(playerInfo.skill) }}</span
          >
          <progress-bar
            class="w-40 h-5 bg-red-200 rounded-sm"
            :value="playerSkill"
            :color="'bg-mainCyan'"
          ></progress-bar>
        </div>
        <div class="flex flex-col text-lg">
          <span>Unique Tasks Played - {{ tasksPlayed }}</span>
          <span>Total Play Count - {{ totalPlays }}</span>        
          <span
            >rA Rank - {{ overallRankRA }}
            <img
              :src="`../../rank-img/ra/${imagePath(overallRankRA)}.png`"
              class="h-5 inline"
              alt=""
          /></span>
        </div>
      </base-card>
      <div style="display:flex;flex-direction: column;" >
      <button
        class="
          right-0
          border-2 border-slate-500
          px-6
          py-2
          rounded
          transition
          hover:bg-slate-500
        "
        @click="openPopup()">
        Set Profile
      </button>
      <Popup v-if="showPopup" @submit="handleSubmission"/>
      </div>   
    </section>
  <div class="relative z-10" id="profile-nav" >
      <ul class="flex">
        <li v-for="(tab, key) in tabs" :key="tab" >
          <router-link
            class="
              py-2
              px-4
              bg-slate-600
              inline-block
              border border-slate-600
              hover:bg-slate-500
            "  style="background-color: #27272A;"
            :to="{ name: tab }"
            @click="displayRoute"
          >
            {{ key }}
          </router-link>
        </li>
      </ul>
    </div>
    <router-view
      :isLoading="isLoading"
      class="border border-slate-600 bg-slate-900 rounded-b-md mb-10"
    ></router-view>
  </div>
</template>

<script>
//#27272A
// import axios from "axios";
import { mapGetters } from "vuex";
import * as queries from "../helpers/queries.js";
import * as functions from "../helpers/functions.js";
import * as revosectData from "../helpers/revosectData.js";
import Popup from './ProfileDataPopup.vue';
export default {
  components: {
    Popup
  },
  data() {
    return {
      playerInfo: {},
      isLoading: false,
      tabs: {
        Overview: "me-overview",
        "rA S4": "me-ra-benches",
        "rA S2": "me-ra-benches-s2",
        "rA S4 Kvks": "me-ra-benches-s4kvks",
      },
      kvksScores: [],
      showPopup: false,
    };
  },
  computed: {
    ...mapGetters([
      "RAHard",
      "RAMedium",
      "RAEasy",
      "RAHardS2",
      "RAMediumS2",
      "RAEasyS2",
      "currentPlayerTasks",
    ]),
    overallRankRA() {
      return this.RAHard.overallRank != "Unranked"
        ? this.RAHard.overallRank
        : this.RAMedium.overallRank != "Unranked"
        ? this.RAMedium.overallRank
        : this.RAEasy.overallRank;
    },
    overallRankRAS2() {
      return this.RAHardS2.overallRank != "Unranked"
        ? this.RAHardS2.overallRank
        : this.RAMediumS2.overallRank != "Unranked"
        ? this.RAMediumS2.overallRank
        : this.RAEasyS2.overallRank;
    },
    playerSkill() {
      if (this.playerInfo.skill) {
        if (this.playerInfo.skill == 1000) return 100;
        return this.playerInfo.skill % 100;
      } else {
        return 0;
      }
    },
    tasksPlayed() {
      return this.$store.getters.tasksPlayed;
    },
    totalPlays() {
      return this.$store.getters.totalPlays;
    },
  },
  watch: {
    currentPlayerTasks(newArr) {
      if (newArr.length) {
        this.isLoading = false;
      }
    },
  },
  methods: {
    imagePath(rank) {
      if(!functions.isNullOrEmpty(rank)) return rank.replace(/ /g, "").toLowerCase(); 
    },
    openPopup() {
      if(this.showPopup) this.showPopup = false;
      else this.showPopup = true;
    },
    handleSubmission() {
      //console.log('Submit button clicked!');
      this.yourFunction();
    },
    async yourFunction() {
      let cookiefiedAimlabsName = functions.getCookie('aimlabsusername');
    //console.log("aimlabsusername from cookies: " + cookiefiedAimlabsName);
    if(!functions.isNullOrEmpty(cookiefiedAimlabsName)) {
      this.playerInfo = {};
    this.isLoading = true;
    let aimlabProfile = await queries.APIFetch(queries.GET_USER_INFO, { username: cookiefiedAimlabsName, });
    //console.log(aimlabProfile);
    if (aimlabProfile != null) {
      this.playerInfo = {
        username: aimlabProfile.aimlabProfile.username,
        id: aimlabProfile.aimlabProfile.user.id,
        rank: aimlabProfile.aimlabProfile.ranking.rank.displayName,
        skill: aimlabProfile.aimlabProfile.ranking.skill,
      };
      let plays_agg = await queries.APIFetch(queries.GET_USER_PLAYS_AGG, {
        where: {
          is_practice: {
            _eq: false,
          },
          score: {
            _gt: 0,
          },
          user_id: {
            _eq: this.playerInfo.id,
          },
        },
      });
      if (!plays_agg?.aimlab) {
        this.$router.go();
      }

      this.$store.dispatch("updateCurrentPlayerInfo", this.playerInfo);
      this.$store.dispatch(
        "updateCurrentPlayerTasks",
        plays_agg.aimlab.plays_agg
      );
      this.$store.dispatch("setRABenches");
      this.$store.dispatch("setRABenchesS2");
      }
    }
    //else console.log("no aimlabs username in cookies!");     
    }
  },
  async mounted() {
    //this.showPopup = true;
    this.yourFunction();
  },
};
</script>

<style scoped>
#profile-nav .router-link-active {
  @apply bg-slate-900 border-b-transparent;
}

#profile-nav {
  top: 1px;
}

ul li:first-of-type a {
  border-top-left-radius: 0.25rem;
}
ul li:last-of-type a {
  border-top-right-radius: 0.25rem;
}
</style>