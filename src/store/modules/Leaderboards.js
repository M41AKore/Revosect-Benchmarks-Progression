import { organizeLeaderboard } from "../../helpers/functions";
import { easyBench, hardBench, mediumBench } from "../../helpers/revosectData.js";
import { easyBenchS2, hardBenchS2, mediumBenchS2 } from "../../helpers/revosectDataS2.js";

export default {
  state() {
    return {
      selectedBenchmarkRA: 2,
      selectedCategoryRA: 3,
      selectedSubCategoryRA: 3,
      benchmarksRA: ["Easy", "Medium", "Hard", "HardS2"],  //this is what shows up in the dropdown
      categoriesRA: ["Clicking", "Tracking", "Switching", "Overall"],
      subCategoriesRA: {
        Clicking: ["Static", "Dynamic", "Overall"],
        Tracking: ["Precise", "Reactive", "Overall"],
        Switching: ["Flick", "Track", "Overall"],
      },
      hardLdb: [],
      mediumLdb: [],
      easyLdb: [],
      hardLdbS2: [],
      hardLbdKvks: [],
      selectedBenchmarkRAKvks: 0,
      selectedCategoryRAKvks: 3,
      selectedSubCategoryRAKvks: 0,
      benchmarksRAKvks: ["Hard" ],
      categoriesRAKvks: [ "Clicking", "Tracking", "Switching", "Overall" ],
    };
  },
  getters: {
    hardLdb(state) {
      return state.hardLdb;
    },
    mediumLdb(state) {
      return state.mediumLdb;
    },
    easyLdb(state) {
      return state.easyLdb;
    },
    hardLdbS2(state) {
      return state.hardLdbS2;
    },
    hardLbdKvks(state) {
      return state.hardLbdKvks;
    },
    selectedBenchmarkRA(state) {
      return state.selectedBenchmarkRA;
    },
    selectedBenchmarkRAKvks(state) {
      return state.selectedBenchmarkRAKvks;
    },
    selectedCategoryRA(state) {
      return state.selectedSubCategoryRA;
    },
    selectedCategoryRAKvks(state) {
      return state.selectedSubCategoryRAKvks;
    },
    selectedSubCategoryRA(state) {
      return state.selectedSubCategoryRA;
    },
    selectedSubCategoryRAKvks(state) {
      return state.selectedSubCategoryRAKvks;
    },
    benchmarksRA(state) {
      return state.benchmarksRA;
    },
    benchmarksRAKvks(state) {
      return state.benchmarksRAKvks;
    },
    categoriesRA(state) {
      return state.categoriesRA;
    },
    subCategoriesRA(state) {
      return state.subCategoriesRA;
    },
  },
  mutations: {
    setHardLdb(state, payload) {
      state.hardLdb = payload;
    },
    setMediumLdb(state, payload) {
      state.mediumLdb = payload;
    },
    setEasyLdb(state, payload) {
      state.easyLdb = payload;
    },
    setHardLdbS2(state, payload) {
      state.hardLdbS2 = payload;
    },
    setSelectedBenchmarkRA(state, payload) {
      state.selectedBenchmarkRA = payload;
    },
    setSelectedCategoryRA(state, payload) {
      state.selectedCategoryRA = payload;
    },
    setSelectedSubCategoryRA(state, payload) {
      state.selectedSubCategoryRA = payload;
    },
  },
  actions: {
    async fetchLeaderboard(context, payload) {
      const { mode, season } = payload;

      console.log("mode: " + mode + ", " + ", season: " + season);

      let ldb = null;
      let fullBench = null;
      switch (mode) {
        case "hard":
          fullBench = season == "s4" ? hardBench : hardBenchS2;
          break;
        case "medium":
          fullBench = mediumBench;
          break;
        case "easy":
          fullBench = easyBench;
          break;
      }

      console.log("hey");
      console.log(fullBench);

      let playerList = {};
      for (let scenario of fullBench) {

        const worker = new Worker("/scripts/leaderboard-worker.js");
        worker.onmessage = (event) => {
          playerList[event.data[1]] = event.data[0];
          if (Object.entries(playerList).length == fullBench.length) {

            console.log("fullBench length: " + fullBench.length);

            ldb = organizeLeaderboard(playerList, fullBench, mode, season);

            if(ldb == null) console.log("yes, is null");

            switch (mode) {
              case "hard":
                context.commit("setHardLdb", ldb);
                break;
              case "hards2":
                context.commit("setHardLdbS2", ldb);
                break;
              case "medium":
                context.commit("setMediumLdb", ldb);
                break;
              case "easy":
                context.commit("setEasyLdb", ldb);
                break;
            }
          }
        };
        worker.postMessage(scenario);
      }

      console.log("ya");
    },
  },
};
