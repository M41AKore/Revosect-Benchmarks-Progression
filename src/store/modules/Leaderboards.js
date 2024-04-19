import { organizeLeaderboard, KVKScalculateBenchmark } from "../../helpers/functions";
import { easyBench, hardBench, mediumBench, s4HardKvks } from "../../helpers/revosectData.js";
import { easyBenchS2, hardBenchS2, mediumBenchS2 } from "../../helpers/revosectDataS2.js";
import axios from 'axios';

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
    categoriesRAKvks(state) {
      return state.categoriesRA;
    },
    subCategoriesRAKvks(state) {
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
    setHardLbdKvks(state, payload) {
      state.hardLbdKvks = payload;
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

    setSelectedBenchmarkRAKvks(state, payload) {
      state.selectedBenchmarkRAKvks = payload;
    },
    setSelectedCategoryRAKvks(state, payload) {
      state.selectedCategoryRAKvks = payload;
    },
    setSelectedSubCategoryRAKvks(state, payload) {
      state.selectedSubCategoryRAKvks = payload;
    },
  },
  actions: {
    async fetchKvksLeaderboard(context, payload) {
      const { mode, season } = payload;
      console.log("mode: " + mode + ", " + ", season: " + season);

      let ldb = null;
      let fullBench = null;
      switch (mode) {
        case "hard":
          fullBench = s4HardKvks;
          break;
        /*case "medium":
          fullBench = mediumBench;
          break;
        case "easy":
          fullBench = easyBench;
          break;*/
        default: 
          return;
      }
  
      let leaderboardList = [];
      let axiosRequests = [];

      for (let scenario of fullBench) {
        axiosRequests.push(
          axios.get('https://kovaaks.com/webapp-backend/leaderboard/scores/global?leaderboardId=' + scenario.leaderboardID + '&page=0&max=100')
            .then(response => {
              if (response != null) {
                let plainData = { ...response.data };
                let leaderboard = [];
                for (let i = 0; i < plainData.data.length; i++) {
                  let result = {
                    playerid: plainData.data[i].steamId,
                    playerName: plainData.data[i].steamAccountName,
                    scenario: scenario.name,
                    id: scenario.leaderboardID,
                    score: (plainData.data[i].score).toFixed(2),
                    placement: plainData.data[i].rank,
                  };
                  leaderboard.push(result);
                }
                leaderboardList.push(leaderboard);
              }
            })
            .catch(error => {
              console.error('Error fetching data:', error);
            })
        );
      }

      // Wait for all axios requests to finish
      Promise.all(axiosRequests).then(() => {
        console.log(leaderboardList.length);

        if (leaderboardList.length > 0) {
          let playerList = [];
          for (let i = 0; i < leaderboardList.length; i++) {
              for(let j=0;j<leaderboardList[i].length;j++) {
                //console.log(leaderboardList[i][j].playerid);
                let found = false;
                for(let k=0;k<playerList.length;k++) {
                  if(playerList[k].id == leaderboardList[i][j].playerid) {
                    found = true;
                    let task = {
                      scenario: leaderboardList[i][j].scenario,
                      id: leaderboardList[i][j].id,
                      score: leaderboardList[i][j].score,
                      placement: leaderboardList[i][j].placement,
                    };
                    playerList[k].taskResults.push(task);
                  }
                }

                if(!found) {
                  let newPlayer = {
                    id: leaderboardList[i][j].playerid,
                    name: leaderboardList[i][j].playerName,
                    taskResults: [],
                    benchResult: {},
                  };
                  let task = {
                    scenario: leaderboardList[i][j].scenario,
                    id: leaderboardList[i][j].id,
                    score: leaderboardList[i][j].score,
                    placement: leaderboardList[i][j].placement,
                  };
                  newPlayer.taskResults.push(task);
                  playerList.push(newPlayer);
                }
              }
          }

          console.log("playerList: " + playerList.length);

          if(playerList.length > 0) {
            for (let i = 0; i < playerList.length; i++) {
              let bench = KVKScalculateBenchmark(playerList[i].taskResults, "hard", "s4");
              playerList[i].benchResult = bench;
            }
          }

          playerList = playerList.sort((a, b) => b.overallPoints - a.overallPoints);
          console.log(playerList[0]);

          switch (mode) {
            case "hard":
              context.commit("setHardLbdKvks", playerList);
              break;
            /*case "medium":
              context.commit("setMediumLdb", ldb);
              break;
            case "easy":
              context.commit("setEasyLdb", ldb);
              break;*/
            default: 
              return;
          }
        }
      });
    },
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

      let playerList = {};
      for (let scenario of fullBench) {

        const worker = new Worker("/scripts/leaderboard-worker.js");
        worker.onmessage = (event) => {
          playerList[event.data[1]] = event.data[0];
          if (Object.entries(playerList).length == fullBench.length) {

            //console.log("fullBench length: " + fullBench.length);
            ldb = organizeLeaderboard(playerList, fullBench, mode, season);

            if(ldb == null) console.log("ldb is null");
            //console.log(ldb[0].overallPoints + ", clicking: " + ldb[0].subCategoryPoints.Clicking);

            console.log("ldb length: " + ldb.length);
            //console.log(ldb[0].overallPoints + ", clicking: " + (ldb[0].subCategoryPoints.Static + ldb[0].subCategoryPoints.Dynamic));

            switch (mode) {
              case "hard":
                if(season == "s4") context.commit("setHardLdb", ldb);
                else if(season == "s2") context.commit("setHardLdbS2", ldb);
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
    },
  },
};
