<template>
    <div class="min-h-max" style="background-color: #111;"><!-- 27272A -->
        <!-- <div 
      v-if="!RABenchmarks.overallPoints"
      class="grid place-items-center p-10"
    >
      <loading-spinner></loading-spinner>
    </div> -->
        <div>
            <div
                class="mt-4 flex max-h-96 w-full justify-center gap-4 font-oswald"
            >
                <div class="ml-4 mr-auto self-start" style="display: flex; flex-direction: row;">
                    <dropdown class="ml-4 mr-auto self-start" :selected-tab="currentTab">
                    <li
                        class="px-4 py-1 transition hover:bg-slate-600" style="background-color: #27272A;"
                        v-for="(element, index) in dropdownElements"
                        :key="index"
                        @click="handleDropdownSelect(index)"
                    >
                        {{ element }}
                    </li>
                </dropdown>
                <!--<dropdown class="ml-4 mr-auto self-start" :selected-tab="currentGame">
                    <li
                        class="px-4 py-1 transition hover:bg-slate-600" style="background-color: #27272A;"
                        v-for="(element, index) in gameDropdownElements"
                        :key="index"
                        @click="handleGameDropdownSelect(index)"
                    >
                        {{ element }}
                    </li>
                </dropdown>-->
                </div>
                
                <div class="my-2 mr-auto flex gap-20">
                    <!--  -->
                    <div class="mr-auto flex gap-20">
                        <div
                            class="flex flex-col items-center justify-center text-center"
                        >
                            <img
                                class="h-36 self-center"
                                :src="
                                    getImagePath(
                                        RABenchmarks.overallRank,
                                        'medal'
                                    )
                                "
                                alt=""
                            />
                            <p
                                class="font-bold uppercase tracking-widest"
                                :class="colorLookup[RABenchmarks.overallRank]"
                            >
                                {{ RABenchmarks.overallRank }}
                            </p>
                            <div class="flex items-center gap-1">
                                <span class="-mt-1">Overall Points :</span>
                                <span class="font-bold tracking-wider" :class="colorLookup[RABenchmarks.overallRank]"
                                    >{{ formatPoints(RABenchmarks.overallPoints) }}</span>
                            </div>
                        </div>
                        <div
                            class="flex flex-col items-center justify-center tracking-wide text-slate-200"
                        >
                            <p class="text-lg font-bold">Categories</p>

                            <ul id="catPart" class="mt-4 grid grid-cols-2 gap-1">
                                <li
                                    v-for="(item, index) in RABenchmarks.subCategoryPoints"
                                    :key="index"
                                    class="flex items-center gap-2 pr-4">
                                    {{ subCategories[index] }} :
                                    <span class="font-bold">{{ formatPoints(item) }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <!-- <span class="font-bold">{{ item.energy }}</span> ({{ item.rank }}) -->
            </div>


            <!-- --------------------------------------------------------------------- -->
            <!-- ------------------------ SCENARIO RESULTS --------------------------- -->
            <!-- --------------------------------------------------------------------- -->

            <section class="relative p-4" id="benchmark-table">
                <header class="grid grid-cols-12 bg-slate-700 py-2 pr-4 pl-16" style="background-color: #7F1D1D;">
                    <p class="col-span-4 ml-2">Scenario</p>
                    <p>Score</p>
                    <p class="col-span-3">Rank</p>
                    <p class="col-span-2">Points</p>
                </header>
                <div style="background-color: #333;"
                    v-for="(bench, index) in RABenchmarks.benchmarks"
                    :key="index"
                    class="mt-1 ml-14 grid grid-cols-12 bg-slate-800 px-4 py-2 text-slate-200"
                >
                    <p class="col-span-4">{{ bench.name }}</p>
                    <p class="font-semibold tracking-wide">{{ bench.maxScore }}</p>
                    <p class="col-span-3 flex gap-2" :class="colorLookup[bench.rank]">
                        <img class="h-5 self-center" :src="getImagePath(bench.rank)" alt="" />
                        {{ bench.rank }}
                    </p>
                    <div class="relative col-span-3 flex items-center justify-between">
                        <span class="absolute left-1/2 z-10 -translate-x-1/2 transform text-right" :class="colorLookupBarText[bench.rank]">{{ formatPoints(bench.points) }}</span>
                        <progress-bar
                            class="h-5 w-full rounded-sm bg-slate-600"           
                            :value="bench.progress"
                            :color="colorLookupBar[bench.rank]"
                        ></progress-bar>
                        <!--color="bg-red-700" :class="colorLookup[RABenchmarks.overallRank]" -->
                        <!-- colors: bg-grandmaster bg-nova bg-celestial bg-astra bg-iron bg-bronze bg-silver bg-gold bg-platinum bg-diamond bg-jade bg-master -->
                    </div>
                    <p
                        class="relative col-start-12 ml-4 flex items-center justify-center"
                    >
                        <chevron-icon
                            direction="down"
                            class="absolute h-full w-12 transition hover:translate-y-0.5 hover:text-slate-400"
                            :class="bench.detailsOpen ? 'rotate-180' : ''"
                            @click="toggleBenchDetails(bench)"
                        ></chevron-icon>
                    </p>
                    <div
                        class="col-span-12 mt-2 border-t-2 border-t-slate-600 py-2 text-slate-200 transition"
                        v-if="bench.detailsOpen"
                    >
                        <div class="pb-4">
                            <div class="flex flex-col gap-0.5">
                                <div
                                    class="min-w-3/4 grid gap-0.5 text-center"
                                    :class="scoreReqGrid"
                                >
                                    <span
                                        v-for="(rank, index) in rankList"
                                        :key="index"
                                        class="bg-slate-700 px-8 py-2 text-center"
                                        :class="colorLookup[rank]"
                                        >{{ rank }}</span
                                    >
                                </div>
                                <div
                                    class="grid gap-0.5 text-center"
                                    :class="scoreReqGrid"
                                >
                                    <span
                                        v-for="(score, index) in bench.scores"
                                        :key="index"
                                        class="bg-slate-700 px-8 py-2"
                                        >{{ score }}</span
                                    >
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-10 pl-4">
                            <div class="flex flex-col gap-2">
                                <div class="grid grid-cols-2">
                                    <p v-if="bench.count">
                                        PB Accuracy :
                                        {{ Math.floor(bench.maxAcc) }}%
                                    </p>
                                    <p>Total Plays : {{ bench.count }}</p>
                                </div>
                                <div class="grid grid-cols-2">
                                    <p v-if="bench.count">
                                        Avg. Score :
                                        {{ Math.floor(bench.avgScore) }}
                                    </p>
                                    <p v-if="bench.count">
                                        Avg. Accuracy :
                                        {{ Math.floor(bench.avgAcc) }}%
                                    </p>
                                </div>
                            </div>
                            <div
                                class="ml-auto mr-10 flex items-center gap-10 text-white"
                            >
                                <button
                                    class="flex cursor-pointer items-center gap-1 transition hover:text-slate-300"
                                    @click="handlePlayScenario(bench.id)"
                                >
                                    <play-icon
                                        class="h-5 w-5 transition"
                                    ></play-icon
                                    >Play
                                </button>
                                <button
                                    class="flex items-center"
                                    :class="
                                        bench.count == 0
                                            ? 'disabled pointer-events-none text-slate-500'
                                            : ''
                                    "
                                    @click="replayLink(bench.id, bench.weapon)"
                                >
                                    <span v-if="replayLoading">Loading...</span>
                                    <span
                                        v-else
                                        class="cursor-pointer transition hover:text-slate-300"
                                        >Watch Replay</span
                                    >
                                </button>

                                <router-link
                                    class="cursor-pointer transition hover:text-slate-300"
                                    :to="'/tasks/' + bench.id"
                                    >View Leaderboard</router-link
                                >
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Categories sidebar -->
                <!-- <div
          class="text-center origin-top-left absolute rotate-90"
          id="category-bar"
          v-if="RABenchmarks.overallPoints"
        >
          <div class="grid grid-cols-6 gap-1" id="category-item">
            <span
              class="bg-slate-700"
              v-for="item in subCategories"
              :key="item"
              >{{ item }}</span
            >
          </div>
          <div class="grid grid-cols-6 gap-0.5 min-w-full">
            <span
              id="subcategory-item"
              class="col-span-2 bg-slate-800"
              v-for="category in categories"
              :key="category"
              >{{ category }}</span
            >
          </div>
        </div> -->
            </section>
        </div>
    </div>
    <!-- text-mythic bg-mythic grid-cols-5 grid-cols-4 -->
</template>
<script>
import axios from 'axios';
import * as ra from "../helpers/revosectData.js";
import { isNullOrEmpty } from '../helpers/functions.js';
import {
    findReplay,
    findWorkshopId,
    taskDeepLink,
} from "@/helpers/functions.js";
export default {
    data() {      
        return {
            replayLoading: false,
            currentTabIndex: 2,
            categories: ["Clicking", "Tracking", "Switching"],
            subCategories: [
                "Clicking",
                "Tracking",
                "Switching",
            ],
            dropdownElements: ["Easy", "Medium", "Hard"],
            //currentGameIndex: 0,
            //gameDropdownElements: ["Aimlabs", "KovaaK's"],
        };
    },
    computed: {
        currentPlayerInfo() {
            return this.$store.getters.currentPlayerInfo;
        },
        currentTab() {
            return {
                value: this.dropdownElements[this.currentTabIndex].toLowerCase(),
                label: this.dropdownElements[this.currentTabIndex],
            };
        },
        rankList() {
            switch (this.currentTab.value) {
                case "hard": return [ "Immortal", "Archon", "Ethereal", "Divine", "Omnipotent" ];
                case "medium": return ["Ace", "Legend", "Sentinel", "Valour", "Mythic"];
                case "easy": return ["Bronze", "Silver", "Gold", "Platinum"];               
            }
        },
        pointList() {
            switch (this.currentTab.value) {
                case "hard": return ra.hardSubPoints;             
                case "medium": return ra.mediumPoints;
                case "easy": return ra.easySubPoints;    
            }
        },
        RABenchmarks() {
            switch (this.currentTab.value) {
                case "hard": return this.$store.getters.RAHard;
                case "medium": return this.$store.getters.RAMedium;
                case "easy": return this.$store.getters.RAEasy;
                default: return this.$store.getters.RAHard; 
            }
        },
        scoreReqGrid() {
            return `grid-cols-${this.rankList.length}`;
        },
        colorLookup() {
            return {
                Iron: "text-iron",
                Bronze: "text-bronze",
                Silver: "text-silver",
                Gold: "text-gold",
                Platinum: "text-platinum",
                Mythic: "text-mythic",
                Immortal: "text-immortal",
                Archon: "text-archon",
                Ethereal: "text-ethereal",
                Divine: "text-divine",
                Omnipotent: "text-omnipotent",
            };
        },
        colorLookupBar() {
            return {
                Iron: "bg-iron",
                Bronze: "bg-bronze",
                Silver: "bg-silver",
                Gold: "bg-gold",
                Platinum: "bg-platinum",
                Mythic: "bg-mythic",
                Immortal: "bg-immortal",
                Archon: "bg-archon",
                Ethereal: "bg-ethereal",
                Divine: "bg-divine_opposite",
                Omnipotent: "bg-omnipotent",
            };
        },
        colorLookupBarText() {
            return {
                Iron: "text-iron_opposite",
                Bronze: "text-bronze_opposite",
                Silver: "text-silver_opposite",
                Gold: "text-gold_opposite",
                Platinum: "text-platinum_opposite",
                Mythic: "text-mythic_opposite",
                Immortal: "text-immortal_opposite",
                Archon: "text-archon_opposite",
                Ethereal: "text-ethereal_opposite",
                Divine: "text-divine",
                Omnipotent: "text-omnipotent_opposite",
            };
        },
        /*subCategoryPoints() {
            let fixed = [];
            for(let i=0;i<this.RABenchmarks.subCategoryPoints.length;i++) {
                //fixed.push(this.RABenchmarks.subCategoryPoints[i].toFixed(3));
                fixed.push(Math.floor(this.RABenchmarks.subCategoryPoints[i]));
            }
            return fixed;
        },*/
    },
    methods: {
        formatPoints(points) {
            if(points == null || points == undefined) return 0;
            if (Number.isInteger(points)) return points;
            else return points.toFixed(3);
        },
        getImagePath(rank) {
            if(rank != null && !isNullOrEmpty(rank)) return `../../rank-img/ra/s4/${rank.toLowerCase()}.png`;
        },
        handleDropdownSelect(index) {
            this.currentTabIndex = index;
        },
        handleGameDropdownSelect(index) {
            this.currentGameIndex = index;
        },
        toggleBenchDetails(bench) {
            bench.detailsOpen = !bench.detailsOpen;
        },
        async handlePlayScenario(taskId) {
            const workshopId = await findWorkshopId(taskId);
            const taskLink = taskDeepLink(workshopId);
            window.open(taskLink, "_blank");
        },
        async replayLink(taskId, weapon) {
            this.replayLoading = true;
            let link = await findReplay(
                this.currentPlayerInfo.username,
                taskId,
                weapon
            );
            if (link) {
                window.open(link, "_blank");
                window.focus();
            }
            this.replayLoading = false;
        },
        
    },
};
</script>

<style scoped>
#category-bar {
    min-width: 788px;
    left: 64px;
    top: 60px;
}
#category-bar span {
    transform: scale(-1, -1);
}
</style>
