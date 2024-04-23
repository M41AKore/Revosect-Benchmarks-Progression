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
                    :selectedTab="{ label: benchmarksRAS2[selectedBenchmarkRAS2] }">
                    <li
                        class="w-full bg-slate-700 px-4 py-1 transition hover:bg-slate-500"
                        v-for="(element, index) in benchmarksRAS2"
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
                    :selectedTab="{ label: categoriesRAS2[selectedCategoryRAS2] }">
                    <li
                        class="w-full bg-slate-700 px-4 py-1 transition hover:bg-slate-500"
                        v-for="(element, index) in categoriesRAS2"
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
            <div  v-if="selectedCategoryRAS2 != 3">
                <p class="mb-1 ml-1">Sub-Category</p>
                <dropdown
                    class="relative"
                    :selectedTab="{ label: subCategoriesRAS2[categoriesRAS2[selectedCategoryRAS2]][selectedSubCategoryRAS2] }">
                    <li
                        class="w-full bg-slate-700 px-4 py-1 transition hover:bg-slate-500"
                        v-for="(element, index) in subCategoriesRAS2[categoriesRAS2[selectedCategoryRAS2]]"
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
                <button style="background-color: #333; border-color: #222;"
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
                <div class="flex gap-1" >
                    <p 
                        class="border border-slate-700 bg-slate-700 py-2 px-4 hover:cursor-pointer"
                        v-for="page in pageNumbers"
                        :key="page"
                        :class="{ 'pointer-events-none border-slate-400 bg-slate-600': this.currentPage == page - 1, ' hover:bg-slate-600': !!parseInt(page), }"
                        :style="{ 
                            'background-color': (this.currentPage == page - 1 ? '#555' : '#333'),
                            'border-color': (this.currentPage == page - 1 ? '#888' : '#222')
                         }"
                        @click="handlePageSelect($event)"
                    >
                        {{ page }}
                    </p>
                </div>
                <!-- Center Buttons -->

                <button style="background-color: #333; border-color: #222;"
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
                <input style="background-color: #333;"
                    type="text"
                    v-model.number="goToPageInput"
                    @keydown.enter="goToPage"
                    @blur="goToPage"
                    class="ml-2 w-10 bg-slate-600 py-2 text-center outline-none ring-inset ring-slate-300 transition focus:ring-2"
                />
                <button style="background-color: #333;"
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
            benchmark: ["Easy", "Medium", "Hard"],
            category: ["Clicking", "Tracking", "Switching", "Overall"],
            subCategory: {
                Clicking: ["Static", "Dynamic", "Overall"],
                Tracking: ["Precise", "Reactive", "Overall"],
                Switching: ["Flick", "Track", "Overall"],
            },
            lastCategoryIndex: 3,
            lastSubCategoryIndex: 2,
        };
    },
    watch: {
        selectedBenchmarkRA(newIndex) {
            let bench = this.benchmark[newIndex].toLowerCase();
            //console.log("bench: " + bench);

            if (bench == "hard" && this.$store.getters.hardLdbS2 != 0) return;
            if (bench == "medium" && this.$store.getters.mediumLdbS2 != 0) return;
            if (bench == "easy" && this.$store.getters.easyLdbS2 != 0) return;
            this.leaderboardLoading = true;

            this.$store.dispatch("fetchLeaderboard", { mode: bench, season: "s2" });       
        },
        selectedLeaderboard(newArr) {
            if (newArr.length) {
                this.leaderboardLoading = false;
            }
        },
    },
    computed: {
        ...mapGetters([
            "selectedBenchmarkRAS2",
            "selectedCategoryRAS2",
            "selectedSubCategoryRAS2",
            "benchmarksRAS2",
            "subCategoriesRAS2",
            "categoriesRAS2",
        ]),
        selectedLeaderboard() {
            let ldb = null;

            /*console.log("this.selectedBenchmarkRAS2: " + this.selectedBenchmarkRAS2);
            console.log("this.selectedCategoryRAS2: " + this.selectedCategoryRAS2);
            console.log("this.selectedSubCategoryRA: " + this.selectedSubCategoryRAS2);*/

            switch (this.selectedBenchmarkRAS2) {
                case 0:
                    ldb = this.$store.getters.easyLdbS2;
                    break;
                case 1:
                    ldb = this.$store.getters.mediumLdbS2;
                    break;
                case 2:
                    ldb = this.$store.getters.hardLdbS2;
                    break;
            }

            /*let cat = this.category[this.selectedCategoryRAS2];
            console.log("cat: " + cat);

            console.log("subcats: " + this.subCategory["Switching"]);
            let subcat = this.subCategory[cat][this.selectedSubCategoryRAS2];
            console.log("subcat: " + subcat);*/

            ldb.forEach((player) => {
                player.selectedPoints = 0;

                switch(this.selectedCategoryRAS2) {
                    case 0:
                        switch(this.selectedSubCategoryRAS2) {
                            case 0:
                                player.selectedPoints = player.subCategoryPoints.Static;
                                break;
                            case 1:
                                player.selectedPoints = player.subCategoryPoints.Dynamic;
                                break;
                            case 2: 
                                player.selectedPoints = player.subCategoryPoints.Static + player.subCategoryPoints.Dynamic;
                                break;
                        }
                        break;

                    case 1:
                        switch(this.selectedSubCategoryRAS2) {
                            case 0:
                                player.selectedPoints = player.subCategoryPoints.Precise;
                                break;
                            case 1:
                                player.selectedPoints = player.subCategoryPoints.Reactive;
                                break;
                            case 2: 
                                player.selectedPoints = player.subCategoryPoints.Precise + player.subCategoryPoints.Reactive;
                                break;
                        }
                        break;

                    case 2:
                        switch(this.selectedSubCategoryRAS2) {
                            case 0:
                                player.selectedPoints = player.subCategoryPoints.Flick;
                                break;
                            case 1:
                                player.selectedPoints = player.subCategoryPoints.Track;
                                break;
                            case 2: 
                                player.selectedPoints = player.subCategoryPoints.Flick + player.subCategoryPoints.Track;
                                break;
                        }
                        break;

                    case 3:
                        player.selectedPoints = player.overallPoints;
                        break;
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
            this.$store.commit("setSelectedBenchmarkRAS2", index);

            this.lastCategoryIndex = 3;
            this.lastSubCategoryIndex = 3;
        },
        changeCategory(index) {
            if(index == this.lastCategoryIndex) return;

            //console.log("category select! " + index);
            let bench = this.benchmark[this.selectedBenchmarkRAS2].toLowerCase();
            //console.log("bench select " + bench);

            switch(bench) {
                case "hard":
                case "medium":
                case "easy":
                    this.$store.commit("setSelectedCategoryRAS2", index);
                    break;
                default:
                    break;
            }

            this.lastCategoryIndex = index;                               
        },
        changeSubCategory(index) {
            if(index == this.lastSubCategoryIndex) return;
            else {
                //console.log("subcategory select! " + index);
                this.$store.commit("setSelectedSubCategoryRAS2", index);
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
            if(rank != null) return `../../rank-img/ra/s2/${rank.toLowerCase()}.png`;
            else if(rank == null || rank == undefined) {
                return `../../rank-img/ra/s2/unranked.png`;
            }
        },
    },

    mounted() {
        let bench = this.benchmark[this.selectedBenchmarkRAS2].toLowerCase();

        if (bench == "hard" && this.$store.getters.hardLdbS2 != 0) return;
        if (bench == "medium" && this.$store.getters.mediumLdbS2 != 0) return;
        if (bench == "easy" && this.$store.getters.easyLdbS2 != 0) return;
        this.leaderboardLoading = true;

        this.$store.dispatch("fetchLeaderboard", { mode: "hard", season: "s2" });      
    },
};
</script>
