<template>
    <div class="space-y-10" >
        <base-card class="flex items-center gap-10">
            <!-- *************************** -->
            <!-- Benchmark Select          -->
            <!-- *************************** -->
            <div>
                <p class="mb-1 ml-1">Benchmark</p>
                <dropdown
                    class="relative"
                    :selectedTab="{ label: benchmarksRA[selectedBenchmarkRA] }">
                    <li
                        class="w-full bg-slate-700 px-4 py-1 transition hover:bg-slate-500"
                        v-for="(element, index) in benchmarksRA"
                        :key="index"
                        @click="changeBenchmark(index)"
                    >
                        {{ element }}
                    </li>
                </dropdown>
            </div>

            <!-- *************************** -->
            <!-- Category Select          -->
            <!-- *************************** -->
            <div>
                <p class="mb-1 ml-1">Category</p>
                <dropdown
                    class="relative"
                    :selectedTab="{ label: categoriesRA[selectedCategoryRA] }">
                    <li
                        class="w-full bg-slate-700 px-4 py-1 transition hover:bg-slate-500"
                        v-for="(element, index) in categoriesRA"
                        :key="index"
                        @click="changeCategory(index)"
                    >
                        {{ element }}
                    </li>
                </dropdown>
            </div>

            <!-- *************************** -->
            <!-- SubCategory Select           -->
            <!-- *************************** -->
            <div  v-if="selectedCategoryRA != 3 && benchmarksRA[selectedBenchmarkRA] == 'hards2'">
                <p class="mb-1 ml-1">Sub-Category</p>
                <dropdown
                    class="relative"
                    :selectedTab="{ label: subCategoriesRA[categoriesRA[selectedCategoryRA]][selectedSubCategoryRA] }">
                    <li
                        class="w-full bg-slate-700 px-4 py-1 transition hover:bg-slate-500"
                        v-for="(element, index) in subCategoriesRA[categoriesRA[selectedCategoryRA]]"
                        :key="index"
                        @click="changeSubCategory(index)"
                    >
                        {{ element }}
                    </li>
                </dropdown>
            </div>
            <!-- <button
        class="border-2 border-slate-500 px-6 py-2 rounded hover:bg-slate-500"
        @click="handleLeaderboardChange"
      >
        Show Leaderboard
      </button> -->
        </base-card>

        <!-- *************************** -->
        <!-- Leaderboard list            -->
        <!-- *************************** -->
        <div style="background-color: #272727;"
            v-if="leaderboardLoading"
            class="mb-16 flex items-center justify-center rounded-sm border border-slate-600 bg-slate-900 py-10">
            <loading-spinner></loading-spinner>
        </div>
        <div v-else class="rounded-sm border bg-slate-900" style="background-color: #111; border-color: #222; margin-top: 15px;">
            <div class="mx-2 mt-2 grid grid-cols-4 bg-slate-600 px-6 py-2" style="background-color: #7F1D1D;">
                <p>Rank</p>
                <p>Name</p>
                <p>Points</p>
                <p>Overall Rank</p>
            </div>
            <router-link style="background-color: #333;"
                v-for="(player, index) in paginatedPlayerList.data"
                :key="index"
                class="mx-2 mt-1 grid grid-cols-4 bg-slate-700 px-6 py-2"
                :to="'/users/' + player.username + '/'">
                <p>{{ paginatedPlayerList.start + index + 1 }}</p>
                <p>{{ player.username }}</p>
                <p>{{ formatPoints(player.selectedPoints) }}</p>
                <p class="flex items-center space-x-2">
                    <img
                        :src="getImagePath(player.overallRank)"
                        alt=""
                        class="inline-block h-6 w-6"
                    />
                    <span>{{ player.overallRank }}</span>
                </p>
            </router-link>

            <div class="mx-auto my-4 flex max-w-max items-center gap-1">
                <button
                    type="button"
                    class="inline-block h-full bg-slate-700 px-3 py-2.5"
                    @click="currentPage--"
                    :class="
                        currentPage > 0
                            ? ''
                            : 'disabled pointer-events-none text-slate-500'
                    "
                >
                    <chevron-icon
                        direction="left"
                        class="h-5 w-5 text-center"
                    ></chevron-icon>
                </button>

                <!-- Center Buttons -->
                <div class="flex gap-1">
                    <p
                        class="border border-slate-700 bg-slate-700 py-2 px-4 hover:cursor-pointer"
                        v-for="page in pageNumbers"
                        :key="page"
                        :class="{
                            'pointer-events-none border-slate-400 bg-slate-600':
                                this.currentPage == page - 1,
                            ' hover:bg-slate-600': !!parseInt(page),
                        }"
                        @click="handlePageSelect($event)"
                    >
                        {{ page }}
                    </p>
                </div>
                <!-- Center Buttons -->

                <button
                    type="button"
                    class="inline-block bg-slate-700 px-3 py-2.5 transition hover:bg-slate-600"
                    @click="currentPage++"
                    :class="
                        currentPage < paginatedPlayerList.pageCount
                            ? ''
                            : 'disabled pointer-events-none text-slate-500'
                    "
                >
                    <chevron-icon
                        class="h-5 w-5"
                        direction="right"
                    ></chevron-icon>
                </button>
                <input
                    type="text"
                    v-model.number="goToPageInput"
                    @keydown.enter="goToPage"
                    @blur="goToPage"
                    class="ml-2 w-10 bg-slate-600 py-2 text-center outline-none ring-inset ring-slate-300 transition focus:ring-2"
                />
                <button
                    class="w-10 bg-slate-600 py-2 text-center outline-none transition hover:bg-slate-500"
                    @click="goToPage"
                >
                    Go
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import Dropdown from "../components/UI/Dropdown.vue";
export default {
    components: { Dropdown },
    data() {
        return {
            currentPage: 0,
            goToPageInput: null,
            leaderboardLoading: false,
            benchmark: ["Easy", "Medium", "Hard", "HardS2"],
            category: ["Clicking", "Tracking", "Switching", "Overall"],
            subCategory: {
                Clicking: ["Static", "Dynamic", "Overall"],
                Tracking: ["Precise", "Reactive", "Overall"],
                Switching: ["Flick", "Track", "Overall"],
            },
            lastCategoryIndex: 3,
            lastSubCategoryIndex: 3,
        };
    },
    watch: {
        selectedBenchmarkRA(newIndex) {
            let bench = this.benchmark[newIndex].toLowerCase();
            console.log("bench: " + bench);

            if (bench == "hard" && this.$store.getters.hardLdb != 0) return;
            if (bench == "medium" && this.$store.getters.mediumLdb != 0) return;
            if (bench == "easy" && this.$store.getters.easyLdb != 0) return;
            this.leaderboardLoading = true;

            if(bench == "hards2") this.$store.dispatch("fetchLeaderboard", { mode: "hard", season: "s2" });
            else this.$store.dispatch("fetchLeaderboard", { mode: bench, season: "s4" });       
        },
        selectedLeaderboard(newArr) {
            if (newArr.length) {
                this.leaderboardLoading = false;
            }
        },
    },
    computed: {
        ...mapGetters([
            "selectedBenchmarkRA",
            "selectedCategoryRA",
            "selectedSubCategoryRA",
            "benchmarksRA",
            "subCategoriesRA",
            "categoriesRA",
        ]),
        selectedLeaderboard() {
            let ldb = null;
            switch (this.selectedBenchmarkRA) {
                case 0:
                    ldb = this.$store.getters.easyLdb;
                    break;
                case 1:
                    ldb = this.$store.getters.mediumLdb;
                    break;
                case 2:
                    ldb = this.$store.getters.hardLdb;
                    break;
                case 3:
                    ldb = this.$store.getters.hardLdbS2;
                    break;
            }

            console.log("selected benchmark: " + this.selectedBenchmarkRA);
            console.log("selected cat: " + this.selectedCategoryRA);

            ldb.forEach((player) => {

                player.selectedPoints = player.overallPoints;

                if(this.selectedBenchmarkRA < 3) {

                    if(this.selectedCategoryRA == 0) player.selectedPoints = player.subCategoryPoints.Clicking;
                    else if(this.selectedCategoryRA == 1) player.selectedPoints = player.subCategoryPoints.Tracking;
                    else if(this.selectedCategoryRA == 2) player.selectedPoints = player.subCategoryPoints.Switching;
                    else if(this.selectedCategoryRA == 3) player.selectedPoints = player.overallPoints;
                }
                else {
                    player.selectedPoints = 0;
                    let cat = this.subCategory[this.category[this.selectedCategoryRA]];
                    if (this.selectedCategoryRA == 3) {
                        player.selectedPoints = player.overallPoints;
                        return;
                    }
                    if (this.selectedSubCategoryRA == 2) {
                        player.selectedPoints = player.subCategoryPoints[cat[0]] + player.subCategoryPoints[cat[1]];
                        return;
                    }
                    player.selectedPoints = player.subCategoryPoints[cat[this.selectedSubCategoryRA]];
                }
            });
            return ldb.sort((a, b) => b.selectedPoints - a.selectedPoints);
        },
        paginatedPlayerList() {
            let perPage = 25;
            let playerList = [...this.selectedLeaderboard];
            let pageCount = Math.ceil(playerList.length / perPage) - 1;
            let start = this.currentPage * perPage;
            let end = this.currentPage * perPage + perPage;
            return {
                data: playerList.slice(start, end),
                start: start,
                end: end,
                perPage: perPage,
                pageCount: pageCount,
            };
        },
        pageNumbers() {
            let pages = [];
            if (this.currentPage > 1) pages.push(1);
            if (this.currentPage > 2) pages.push("...");
            for (
                let i = this.currentPage;
                i < this.currentPage + 3 &&
                i < this.paginatedPlayerList.pageCount + 2;
                i++
            ) {
                if (i > 0) pages.push(i);
            }
            if (this.currentPage < this.paginatedPlayerList.pageCount - 2)
                pages.push("...");
            if (this.currentPage < this.paginatedPlayerList.pageCount - 1)
                pages.push(this.paginatedPlayerList.pageCount + 1);
            return pages;
        },
    },
    methods: {
        formatPoints(points) {
            if(points == null || points == undefined) return 0;
            if (Number.isInteger(points)) return points;
            else return points.toFixed(3);
        },
        changeBenchmark(index) {
            this.$store.commit("setSelectedBenchmarkRA", index);
        },
        changeCategory(index) {
            if(index == this.lastCategoryIndex) return;

            console.log("category select! " + index);

            let bench = this.benchmark[this.selectedBenchmarkRA].toLowerCase();
            console.log("bench select " + bench);

            switch(bench) {
                case "hard":
                case "medium":
                case "easy":
                    this.changeSubCategory(index);
                    break;
                
                default:
                    this.$store.commit("setSelectedCategoryRA", index);
                    
                    break;
            }

            this.lastCategoryIndex = index;                               
        },
        changeSubCategory(index) {

            if(index == this.lastSubCategoryIndex) return;
            else {
                console.log("subcategory select! " + index);
                this.$store.commit("setSelectedSubCategoryRA", index);
                this.lastSubCategoryIndex = index;
            }        
        },

        handlePageSelect(event) {
            let value = parseInt(event.target.textContent);
            if (value) {
                this.currentPage = value - 1;
            }
        },
        goToPage() {
            if (this.goToPageInput) {
                if (
                    this.goToPageInput >
                    this.paginatedPlayerList.pageCount + 1
                ) {
                    this.currentPage = this.paginatedPlayerList.pageCount;
                } else if (this.goToPageInput < 1) {
                    this.currentPage = 0;
                } else {
                    this.currentPage = this.goToPageInput - 1;
                }
            }
            this.goToPageInput = null;
        },
        getImagePath(rank) {
            if(rank != null) return `../../rank-img/ra/s4/${rank.toLowerCase()}.png`;
        },


    },

    mounted() {
        let bench = this.benchmark[this.selectedBenchmarkRA].toLowerCase();

        if (bench == "hard" && this.$store.getters.hardLdb != 0) return;
        if (bench == "medium" && this.$store.getters.mediumLdb != 0) return;
        if (bench == "easy" && this.$store.getters.easyLdb != 0) return;
        this.leaderboardLoading = true;

        if(bench == "hards2") {
            if(this.$store.getters.hardLdbS2 != 0) {
                this.$store.dispatch("fetchLeaderboard", { mode: "hard", season: "s2" });
            }
        }
         else {
            this.$store.dispatch("fetchLeaderboard", { mode: bench, season: "s4" });
        }         
    },
};
</script>
