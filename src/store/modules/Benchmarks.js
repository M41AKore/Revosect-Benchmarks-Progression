import {
  calculateRevosectBenchmarks,
  getKvksData,
} from "../../helpers/functions";
import _ from "lodash";

export default {
  state() {
    return {
      RAHard: {
        overallPoints: 0,
        overallRank: "Unranked",
        subCategoryPoints: [],
        benchmarks: [],
        detailsOpen: false,
      },
      RAMedium: {
        overallPoints: 0,
        overallRank: "Unranked",
        subCategoryPoints: [],
        benchmarks: [],
        detailsOpen: false,
      },
      RAEasy: {
        overallPoints: 0,
        overallRank: "Unranked",
        subCategoryPoints: [],
        benchmarks: [],
        detailsOpen: false,
      },
      RAHardS2: {
        overallPoints: 0,
        overallRank: "Unranked",
        subCategoryPoints: [],
        benchmarks: [],
        detailsOpen: false,
      },
      RAMediumS2: {
        overallPoints: 0,
        overallRank: "Unranked",
        subCategoryPoints: [],
        benchmarks: [],
        detailsOpen: false,
      },
      RAEasyS2: {
        overallPoints: 0,
        overallRank: "Unranked",
        subCategoryPoints: [],
        benchmarks: [],
        detailsOpen: false,
      },
      kvksBenchHard: {
        overallPoints: 0,
        overallRank: "Unranked",
        allPoints: [],
        subCategoryPoints: [],
        benchmarks: [],
        detailsOpen: false,
      },
      kvksBenchMedium: {
        overallPoints: 0,
        overallRank: "Unranked",
        allPoints: [],
        subCategoryPoints: [],
        benchmarks: [],
        detailsOpen: false,
      },
      kvksBenchEasy: {
        overallPoints: 0,
        overallRank: "Unranked",
        allPoints: [],
        subCategoryPoints: [],
        benchmarks: [],
        detailsOpen: false,
      },
    };
  },
  getters: {
    RAHard(state) {
      return state.RAHard;
    },
    RAMedium(state) {
      return state.RAMedium;
    },
    RAEasy(state) {
      return state.RAEasy;
    },
    RAHardS2(state) {
      return state.RAHardS2;
    },
    RAMediumS2(state) {
      return state.RAMediumS2;
    },
    RAEasyS2(state) {
      return state.RAEasyS2;
    },
    RAKvksHard(state) {
      return state.kvksBenchHard;
    },
    RAKvksMedium(state) {
      return state.kvksBenchMedium;
    },
    RAKvksEasy(state) {
      return state.kvksBenchEasy;
    },
  },
  mutations: {
    setRAHard(state, payload) {
      state.RAHard = payload;
    },
    setRAMedium(state, payload) {
      state.RAMedium = payload;
    },
    setRAEasy(state, payload) {
      state.RAEasy = payload;
    },
    setRAHardS2(state, payload) {
      state.RAHardS2 = payload;
    },
    setRAMediumS2(state, payload) {
      state.RAMediumS2 = payload;
    },
    setRAEasyS2(state, payload) {
      state.RAEasyS2 = payload;
    },
    setRAKVksHard(state, payload) {
      state.kvksBenchHard = payload;
    },
    setRAKVksMedium(state, payload) {
      state.kvksBenchMedium = payload;
    },
    setRAKVksEasy(state, payload) {
      state.kvksBenchEasy = payload;
    },
  },
  actions: {
    setRABenchesS2(context) {
      let RAHardS2 = calculateRevosectBenchmarks(
        {
          tasks: context.rootGetters.currentPlayerTasks,
          id: context.rootGetters.currentPlayerInfo.id,
        },
        "hard",
        "s2",
      );
      let RAMediumS2 = calculateRevosectBenchmarks(
        {
          tasks: context.rootGetters.currentPlayerTasks,
          id: context.rootGetters.currentPlayerInfo.id,
        },
        "medium",
        "s2",
      );
      let RAEasyS2 = calculateRevosectBenchmarks(
        {
          tasks: context.rootGetters.currentPlayerTasks,
          id: context.rootGetters.currentPlayerInfo.id,
        },
        "easy",
        "s2",
      );
      context.commit("setRAEasyS2", RAEasyS2);
      context.commit("setRAMediumS2", RAMediumS2);
      context.commit("setRAHardS2", RAHardS2);
    },
    async setRABenches(context) {
      let RAHard = calculateRevosectBenchmarks(
        {
          tasks: context.rootGetters.currentPlayerTasks,
          id: context.rootGetters.currentPlayerInfo.id,
        },
        "hard",
        "s4",
      );
      let RAMedium = calculateRevosectBenchmarks(
        {
          tasks: context.rootGetters.currentPlayerTasks,
          id: context.rootGetters.currentPlayerInfo.id,
        },
        "medium",
        "s4",
      );
      let RAEasy = calculateRevosectBenchmarks(
        {
          tasks: context.rootGetters.currentPlayerTasks,
          id: context.rootGetters.currentPlayerInfo.id,
        },
        "easy",
        "s4",
      );

      let kvksHard = await getKvksData("hard", "s4");
      let KVksMedium = await getKvksData("medium", "s4");
      let KVksEasy = await getKvksData("easy", "s4");

      context.commit("setRAEasy", RAEasy);
      context.commit("setRAMedium", RAMedium);
      context.commit("setRAHard", RAHard);
      context.commit("setRAKVksHard", kvksHard);
      context.commit("setRAKVksMedium", KVksMedium);
      context.commit("setRAKVksEasy", KVksEasy);
    },
  },
};
