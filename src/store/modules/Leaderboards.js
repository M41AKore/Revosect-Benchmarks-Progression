import { organizeLeaderboard, KVKScalculateBenchmark } from "../../helpers/functions";
import { easyBench, hardBench, mediumBench, S4HardKvks, S4MedKvks, S4EasyKvks } from "../../helpers/revosectData.js";
import { easyBenchS2, hardBenchS2, mediumBenchS2 } from "../../helpers/revosectDataS2.js";
import axios from 'axios';

export default {
  state() {
    return {
      selectedBenchmarkRA: 2,
      selectedCategoryRA: 3,
      selectedSubCategoryRA: 3,
      benchmarksRA: ["Easy", "Medium", "Hard"],  //this is what shows up in the dropdown
      categoriesRA: ["Clicking", "Tracking", "Switching", "Overall"],
      subCategoriesRA: {
        Clicking: ["Static", "Dynamic", "Overall"],
        Tracking: ["Precise", "HybridTrack", "Reactive", "Overall"],
        Switching: ["FlickTS", "HybridTS", "TrackTS", "Overall"],
      },
      hardLdb: [],
      mediumLdb: [],
      easyLdb: [],

      hardLdbS2: [],
      mediumLdbS2: [],
      easyLdbS2: [],
      selectedBenchmarkRAS2: 2,
      selectedCategoryRAS2: 3,
      selectedSubCategoryRAS2: 2,
      benchmarksRAS2: ["Easy", "Medium", "Hard"],
      categoriesRAS2: ["Clicking", "Tracking", "Switching", "Overall"],
      subCategoriesRAS2: {
        "Clicking": ["Static", "Dynamic", "Overall"],
        "Tracking": ["Precise", "Reactive", "Overall"],
        "Switching": ["Flick", "Track", "Overall"],
      },

      hardLdbKvks: [],
      mediumLdbKvks: [],
      easyLdbKvks: [],
      selectedBenchmarkRAKvks: 0,
      selectedCategoryRAKvks: 3,
      selectedSubCategoryRAKvks: 0,
      benchmarksRAKvks: [ "Easy", "Medium", "Hard" ],
      categoriesRAKvks: [ "Clicking", "Tracking", "Switching", "Overall" ],
      subCategoriesRAS4: {
        Clicking: ["Static", "Dynamic", "Overall"],
        Tracking: ["Precise", "HybridTrack", "Reactive", "Overall"],
        Switching: ["FlickTS", "HybridTS", "TrackTS", "Overall"],
      },
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
    mediumLdbS2(state) {
      return state.mediumLdbS2;
    },
    easyLdbS2(state) {
      return state.easyLdbS2;
    },
    hardLdbKvks(state) {
      return state.hardLdbKvks;
    },
    mediumLdbKvks(state) {
      return state.mediumLdbKvks;
    },
    easyLdbKvks(state) {
      return state.easyLdbKvks;
    },

    //-------------------------------------------
    selectedBenchmarkRA(state) {
      return state.selectedBenchmarkRA;
    },
    selectedBenchmarkRAKvks(state) {
      return state.selectedBenchmarkRAKvks;
    },
    selectedBenchmarkRAS2(state) {
      return state.selectedBenchmarkRAS2;
    },

    //-------------------------------------------
    selectedCategoryRA(state) {
      return state.selectedSubCategoryRA;
    },
    selectedCategoryRAKvks(state) {
      return state.selectedSubCategoryRAKvks;
    },
    selectedCategoryRAS2(state) {
      return state.selectedCategoryRAS2;
    },

    //-------------------------------------------
    selectedSubCategoryRA(state) {
      return state.selectedSubCategoryRA;
    },
    selectedSubCategoryRAKvks(state) {
      return state.selectedSubCategoryRAKvks;
    },
    selectedSubCategoryRAS2(state) {
      return state.selectedSubCategoryRAS2;
    },

    //-------------------------------------------
    benchmarksRA(state) {
      return state.benchmarksRA;
    },
    benchmarksRAKvks(state) {
      return state.benchmarksRAKvks;
    },
    benchmarksRAS2(state) {
      return state.benchmarksRAS2;
    },

    //-------------------------------------------
    categoriesRA(state) {
      return state.categoriesRA;
    },
    categoriesRAKvks(state) {
      return state.categoriesRAKvks;
    },
    categoriesRAS2(state) {
      return state.categoriesRAS2;
    },

    //-------------------------------------------
    subCategoriesRA(state) {
      return state.subCategoriesRA;
    },
    subCategoriesRAKvks(state) {
      return state.subCategoriesRAKvks;
    },
    subCategoriesRAS2(state) {
      return state.subCategoriesRAS2;
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
    setMediumLdbS2(state, payload) {
      state.mediumLdbS2 = payload;
    },
    setEasyLdbS2(state, payload) {
      state.easyLdbS2 = payload;
    },    
    setHardLdbKvks(state, payload) {
      state.hardLdbKvks = payload;
    },
    setMediumLdbKvks(state, payload) {
      state.mediumLdbKvks = payload;
    },
    setEasyLdbKvks(state, payload) {
      state.easyLdbKvks = payload;
    },

    //-------------------------------------------
    setSelectedBenchmarkRA(state, payload) {
      state.selectedBenchmarkRA = payload;
    },
    setSelectedBenchmarkRAS2(state, payload) {
      state.selectedBenchmarkRAS2 = payload;
    },
    setSelectedBenchmarkRAKvks(state, payload) {
      state.selectedBenchmarkRAKvks = payload;
    },

    //-------------------------------------------
    setSelectedCategoryRA(state, payload) {
      state.selectedCategoryRA = payload;
    },
    setSelectedCategoryRAS2(state, payload) {
      state.selectedCategoryRAS2 = payload;
    },
    setSelectedCategoryRAKvks(state, payload) {
      state.selectedCategoryRAKvks = payload;
    },
    
    //-------------------------------------------
    setSelectedSubCategoryRA(state, payload) {
      state.selectedSubCategoryRA = payload;
    },
    setSelectedSubCategoryRAS2(state, payload) {
      state.selectedSubCategoryRAS2 = payload;
    },
    setSelectedSubCategoryRAKvks(state, payload) {
      state.selectedSubCategoryRAKvks = payload;
    },
  },
  actions: {
    async fetchKvksLeaderboard(context, payload) {
      const { mode, season } = payload;
      console.log("mode: " + mode + ", season: " + season);

      let ldb = null;
      let fullBench = null;
      switch (mode) {
        case "hard":
          fullBench = S4HardKvks;
          break;
        case "medium":
          fullBench = S4MedKvks;
          break;
        case "easy":
          fullBench = S4EasyKvks;
          break;
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
              let bench = KVKScalculateBenchmark(playerList[i].taskResults, mode, "s4");
              playerList[i].benchResult = bench;
            }
          }

          playerList = playerList.sort((a, b) => b.overallPoints - a.overallPoints);
          console.log(mode);

          switch (mode) {
            case "hard":
              context.commit("setHardLdbKvks", playerList);
              break;
            case "medium":
              context.commit("setMediumLdbKvks", playerList);
              break;
            case "easy":
              context.commit("setEasyLdbKvks", playerList);
              break;
            default: 
              return;
          }
        }
      });
    },
    async fetchLeaderboard(context, payload) {
      const { mode, season } = payload;

      console.log("mode: " + mode + ", season: " + season);

      let ldb = null;
      let fullBench = null;
      switch (mode) {
        case "hard":
          fullBench = season == "s4" ? hardBench : hardBenchS2;
          break;
        case "medium":
          fullBench = season == "s4" ? mediumBench : mediumBenchS2;
          break;
        case "easy":
          fullBench =  season == "s4" ? easyBench : easyBenchS2;
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
                if(season == "s4") context.commit("setMediumLdb", ldb);
                else if(season == "s2") context.commit("setMediumLdbS2", ldb);
                break;
              case "easy":
                if(season == "s4") context.commit("setEasyLdb", ldb);
                else if(season == "s2") context.commit("setEasyLdbS2", ldb);
                break;
            }
          }
        };
        worker.postMessage(scenario);
      }
    },
  },
};
