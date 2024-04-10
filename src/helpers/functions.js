"use strict";
import {
    hardSubPoints,
    hardPoints,
    hardSubRanks,
    hardRanks,
    mediumPoints,
    mediumRanks,
    mediumSubPoints,
    mediumSubRanks,
    easyPoints,
    easyRanks,
    easySubPoints,
    easySubRanks,
    hardBench,
    mediumBench,
    easyBench,
    categories,
    s4HardKvks,
} from "./revosectData";
import {
    hardSubPointsS2,
    hardPointsS2,
    hardSubRanksS2,
    hardRanksS2,
    mediumPointsS2,
    mediumRanksS2,
    mediumSubPointsS2,
    mediumSubRanksS2,
    easyPointsS2,
    easyRanksS2,
    easySubPointsS2,
    easySubRanksS2,
    hardBenchS2,
    mediumBenchS2,
    easyBenchS2,
    categoriesS2,
} from "./revosectDataS2";
import {
    APIFetch,
    API_ENDPOINT,
    GET_TASK_LEADERBOARD,
    GET_TASK_BY_ID,
    GET_USER_PLAYS_AGG,
} from "./queries.js";
import _ from "lodash";
import axios from "axios";

//UTILITY FUNCTIONS

export async function findWorkshopId(taskId) {
    const task = await APIFetch(GET_TASK_BY_ID, { slug: taskId });
    return task.aimlab.task.workshop_id;
}
export function taskDeepLink(workshopId) {
    return `https://go.aimlab.gg/v1/redirects?link=aimlab://workshop?id=${workshopId}&source=EEDCC708991834C0&link=steam://rungameid/714010`;
}
export function replayDeepLink(playId) {
    return `https://go.aimlab.gg/v1/redirects?link=aimlab%3a%2f%2fcompare%3fid%3d${playId}%26source%3d84966503A24BD515&link=steam%3a%2f%2frungameid%2f714010`;
}
export async function findReplay(playerName, taskId, weapon) {
    let limit = 100;
    let offset = 0;
    let playerFound = false;
    while (!playerFound) {
        let ldb = await APIFetch(GET_TASK_LEADERBOARD, {
            leaderboardInput: {
                clientId: "aimlab",
                limit: limit,
                offset: offset,
                taskId: taskId,
                taskMode: 0,
                weaponId: weapon,
            },
        });

        if (ldb?.aimlab.leaderboard) {
            let located = [...ldb.aimlab.leaderboard.data].filter(
                (entry) => entry.username == playerName
            );
            // console.log(located);
            if (_.isEmpty(located)) {
                // console.log("not found on page", offset / limit + 1);
                offset += limit;
                if (offset >= ldb.aimlab.leaderboard.metadata.totalRows) {
                    // console.log("Score not found");
                    return;
                }
                continue;
            } else {
                // console.log("found on page", offset / limit + 1);
                playerFound = true;
                return replayDeepLink(located[0].play_id);
            }
        } else continue;
    }
}

export function cleanUpUserTasks(taskList) {
    let data = taskList.map((task) => {
        return {
            name: task.group_by.task_name,
            id: task.group_by.task_id,
            count: task.aggregate.count,
            avgScore: task.aggregate.avg.score,
            avgAcc: task.aggregate.avg.accuracy,
            maxScore: task.aggregate.max.score,
            maxAcc: task.aggregate.max.accuracy,
        };
    });
    data = data
        .filter((task) => {
            if (task.name) return true;
            if (!task.id.includes(".")) return true;
        })
        .map((task) => {
            if (!task.name) {
                task.name = task.id;
            }
            return task;
        });
    data = data.sort((a, b) =>
        a.count > b.count ? -1 : b.count > a.count ? 1 : 0
    );
    return data;
}

//Revosect section
//Single function to handle all benchmark levels calculation
export function calculateRevosectBenchmarks(playerData, mode, season) {
    let benchData = null;
    switch (mode) {
        case "hard":
            if(season == "s4") benchData = hardBench;
            else if(season == "s2") benchData = hardBenchS2;
            break;
        case "medium":
            if(season == "s4") benchData = mediumBench;
            else if(season == "s2") benchData = mediumBenchS2;
            break;
        case "easy":
            if(season == "s4") benchData = easyBench;
            else if(season == "s2") benchData = easyBenchS2;
    }

    if(benchData == null) return;

    //Filtering out the benchmark scenarios the player has played from the provided full list of played scenarios
    let playedBenchmarks = playerData.tasks.filter((n) =>
        benchData.some((n2) => n.id == n2.id)
    );

    // console.log(JSON.parse(JSON.stringify(playedBenchmarks)));
    // console.log(JSON.parse(JSON.stringify(benchData)));
    //Computing the scores and ranks for each of the played benchm  ark scenarios
    let playerBenchmarks = getPlayerBenchmarkResults(
        playedBenchmarks,
        benchData,
        mode,
        season
    );

    playerBenchmarks.sort((a, b) => a.scenarioID - b.scenarioID);
    const allPointsList = playerBenchmarks.map((bench) => bench.points);

    //Grouping benchmark scenarios by subcategories
    const subCategoryGroupedBenchmarks = _.groupBy(
        playerBenchmarks,
        "categoryID"
    );
    let subCategoryPointsList = Object.entries(
        subCategoryGroupedBenchmarks
    ).map(([_, group]) => {
        return [...group.map(({ points }) => points)];
    });

    let aggregateSubCategoryPoints = null;
    //different point calculation between easy benchmarks and med/hard benchmarks
    if (mode == "easy") {
        aggregateSubCategoryPoints = subCategoryPointsList.map((item) => {
            return item.reduce((acc, curr) => acc + curr);
        });
    } else {
        if(season == "s2") {
            let filtered = [];
            for(let i=0;i<subCategoryPointsList.length;i++) {
                let top2 = subCategoryPointsList[i].sort((a, b) => b - a).slice(0, 2);
                filtered.push(top2);
            }
            subCategoryPointsList = filtered;
        }
        else if(season == "s4" && mode != "easy") {
            let clicking = subCategoryPointsList[0].concat(subCategoryPointsList[1]);
            let tracking = subCategoryPointsList[2].concat(subCategoryPointsList[3]).concat(subCategoryPointsList[4]);
            let switching = subCategoryPointsList[5].concat(subCategoryPointsList[6]).concat(subCategoryPointsList[7]);
        
            clicking = clicking.sort((a, b) => b - a).slice(0, 4);
            tracking = tracking.sort((a, b) => b - a).slice(0, 4);
            switching = switching.sort((a, b) => b - a).slice(0, 4);
            subCategoryPointsList = [clicking, tracking, switching];              
        }     
    }

    aggregateSubCategoryPoints = subCategoryPointsList.map((category) => {
        return category.reduce((total, num) => total + num, 0);
    });

    let overallPoints = aggregateSubCategoryPoints.reduce(
        (acc, curr) => acc + curr
    );
    overallPoints = Math.floor(overallPoints);

    //Check if player is valour/platinum to add excess points to the total
    /*if (mode != "hard") {
        let pointNormalizedData = checkExcessPoints(
            playerBenchmarks,
            subCategoryPointsList,
            mode,
            overallPoints,
            aggregateSubCategoryPoints
        );

        playerBenchmarks = pointNormalizedData.playerBench;
        overallPoints = pointNormalizedData.overallPoints;
        if(mode == "medium" && season == "s2") console.log("overallPoints: " + overallPoints);
        aggregateSubCategoryPoints = pointNormalizedData.aggregateSubCategoryPoints;
    }*/

    //finding the player's overall rank
    let benchmarkPointsList = null;
    let benchmarkRankList = null;
    let basePoints = 0;
    switch (mode) {
        case "hard":
            if(season == "s4") {
                benchmarkPointsList = hardPoints;
                benchmarkRankList = hardRanks;
            }
            else if(season == "s2") {
                benchmarkPointsList = hardPointsS2;
                benchmarkRankList = hardRanksS2;
            }           
            break;
        case "medium":
            if(season == "s4") {
                benchmarkPointsList = mediumPoints;
                benchmarkRankList = mediumRanks;
            }
            else if(season == "s2") {
                benchmarkPointsList = mediumPointsS2;
                benchmarkRankList = mediumRanksS2;
            }      
            break;
        case "easy":
            if(season == "s4") {
                benchmarkPointsList = easyPoints;
                benchmarkRankList = easyRanks;
            }
            else if(season == "s2") {
                benchmarkPointsList = easyPointsS2;
                benchmarkRankList = easyRanksS2;
            }      
            break;
    }

    benchmarkPointsList.forEach((point) => {
        if (overallPoints > point) {
            basePoints = point;
        }
    });

    const hasPlayedAllSubCategories = !aggregateSubCategoryPoints.includes(0);
    let overallRank = "Unranked";
    if (hasPlayedAllSubCategories) {
        overallRank = benchmarkRankList[basePoints];
    }
    //Checking for Divinity
    if (overallRank == "Divine") {
        if (checkDivinity(allPointsList)) {
            overallRank = "Divinity";
        }
    }
    else if(overallRank == "Omnipotent" && checkOmnipotency(allPointsList)) overallRank = "Omnipotence";

    return {
        overallPoints,
        overallRank,
        allPoints: allPointsList,
        subCategoryPoints: aggregateSubCategoryPoints,
        benchmarks: playerBenchmarks,
        detailsOpen: false,
    };
}
//Create a complete object with player scores, rank, points and scenario information
function getPlayerBenchmarkResults(playerTasks, benchData, mode, season) {
    // let currentPlayer = playerData.id;
    // let playerTasks = playerData;
    //Score Overrides section
    let benchmark = JSON.parse(JSON.stringify(benchData))
    benchmark.forEach((bench) => {
        bench.avgAcc = 0;
        bench.count = 0;
        bench.maxScore = 0;
        bench.avgScore = 0;
        bench.points = 0;
        bench.rank = "Unranked";
    });
    for (let i = 0; i < playerTasks.length; i++) {
        for (let j = 0; j < benchmark.length; j++) {
            if (playerTasks[i].id == benchmark[j].id) {
                let rankData = [0, 0, "Unranked"];
                if (playerTasks[i].count) {
                    //calculate rank and points for different modes
                    switch (mode) {
                        case "hard":
                            rankData = calculateRankRA(
                                benchmark[j],
                                playerTasks[i],
                                season == "s4" ? hardSubRanks : hardSubRanksS2,
                                season == "s4" ? hardSubPoints : hardSubPointsS2
                            );
                            break;
                        case "medium":
                            rankData = calculateRankRA(
                                benchmark[j],
                                playerTasks[i],
                                mediumSubRanks,
                                mediumSubPoints
                            );
                            break;
                        case "easy":
                            rankData = calculateRankRA(
                                benchmark[j],
                                playerTasks[i],
                                easySubRanks,
                                easySubPoints
                            );

                            break;
                    }
                }
                benchmark[j] = {
                    ...JSON.parse(JSON.stringify(benchmark[j])),
                    ...JSON.parse(JSON.stringify(playerTasks[i])),
                };
                benchmark[j].points = rankData[0];
                benchmark[j].progress = rankData[1];
                benchmark[j].rank = rankData[2];
            }
        }
    }

    return benchmark;
}

function calculateRankRA(bench, userTask, benchRanks, benchPoints) {
    const arrSize = bench.scores.length - 1;
    let points = 0;
    let progress = 0;
    let rank = "Unranked";

    if (userTask.maxScore < bench.scores[0]) {
        points = 0;
        progress = Math.floor((userTask.maxScore * 100) / bench.scores[0]);
    } else if (userTask.maxScore >= bench.scores[arrSize]) {
        points = benchPoints[arrSize];
        let playerDiff = userTask.maxScore - bench.scores[arrSize];
        let perPoint =
            (benchPoints[arrSize] - benchPoints[arrSize - 1]) /
            (bench.scores[arrSize] - bench.scores[arrSize - 1]);
        rank = benchRanks[points];
        points += Math.floor(playerDiff * perPoint);
        progress = 100;
    } else {
        let i = 0;
        bench.scores.forEach((score, index) => {
            if (userTask.maxScore >= score) {
                i = index;
            }
        });
        points = benchPoints[i];
        rank = benchRanks[points];
        let playerDiff = userTask.maxScore - bench.scores[i];
        let perPoint =
            (benchPoints[i + 1] - benchPoints[i]) /
            (bench.scores[i + 1] - bench.scores[i]);
        points += Math.floor(playerDiff * perPoint);
        progress = Math.floor(
            (playerDiff * 100) / (bench.scores[i + 1] - bench.scores[i])
        );
    }
    return [points, progress, rank];
}

function checkDivinity(pointsList) {
    return (
        pointsList.filter((point) => {
            return point >= hardSubPoints[3];
        }).length == 18
    );
}
function checkOmnipotency(pointsList) {
    return (
        pointsList.filter((point) => {
            return point >= hardSubPoints[4];
        }).length == 18
    );
}

function checkExcessPoints(
    playerBench,
    categoryPointsList,
    mode,
    overallPoints,
    aggregateSubCategoryPoints
) {
    // console.log(
    //   playerBench,
    //   categoryPointsList,
    //   mode,
    //   overallPoints,
    //   categoryPoints
    // );
    let pointLimit = 0;
    let rankPoints = 0;
    if (mode == "easy") {
        pointLimit = easySubPoints[3];
        rankPoints = easyPoints[3];
    } else {
        pointLimit = mediumSubPoints[3];
        rankPoints = mediumPoints[3];
    }
    let fixedPointsList = [];
    categoryPointsList.forEach((category) => {
        fixedPointsList.push(
            category.map((point) => {
                if (point > pointLimit) return pointLimit;
                return point;
            })
        );
    });
    let fixedAggregatePoints = null;
    if (mode == "easy") {
        fixedAggregatePoints = fixedPointsList.map((item) => {
            return item.reduce((acc, curr) => acc + curr);
        });
    } else {
        fixedAggregatePoints = fixedPointsList.map((item) => {
            return item.reduce((acc, curr) => acc + curr) - Math.min(...item);
        });
    }
    let totalPoints = fixedAggregatePoints.reduce((acc, curr) => acc + curr);
    let fixedBench = playerBench.map((bench) => {
        if (bench.points > pointLimit) {
            return {
                ...bench,
                points: pointLimit,
            };
        }
        return bench;
    });
    if (!(totalPoints > rankPoints)) {
        return {
            playerBench: fixedBench,
            overallPoints: totalPoints,
            aggregateSubCategoryPoints: fixedAggregatePoints,
        };
    }
    return { playerBench, overallPoints, aggregateSubCategoryPoints };
}

export function organizeLeaderboard(playerList, fullBench, mode, season) {
    for (let task of fullBench) {
        let index = playerList[task.id].length;
        for (let i = 0; i < playerList[task.id].length; i++) {
            if (playerList[task.id][i]?.score < task.scores[0]) {
                index = i;
                break;
            }
            playerList[task.id] = playerList[task.id].slice(0, index);
        }

        let allPlayers = [];
        Object.entries(playerList).forEach((task) => {
            allPlayers.push(...task[1]);
        });

        let uniquePlayers = [
            ...new Map(
                allPlayers.map((item) => [item["user_id"], item])
            ).values(),
        ].map((player) => {
            return {
                id: player.user_id,
                username: player.username,
                scores: [],
            };
        });
        uniquePlayers.forEach((player) => {
            Object.entries(playerList).forEach((task) => {
                let foundPlay = task[1].find(
                    (task) => task.user_id == player.id
                );
                if (foundPlay) {
                    player.scores.push({
                        id: foundPlay.task_id,
                        maxScore: foundPlay.score,
                        count: 1,
                    });
                }
            });
        });
        let leaderboard = [];
        uniquePlayers.forEach((player) => {
            leaderboard.push({
                username: player.username,
                ...calculateRevosectBenchmarks(
                    { tasks: player.scores, id: player.id },
                    mode,
                    season,
                ),
            });
        });
        leaderboard.forEach((player) => {
            let points = {};
            player.subCategoryPoints.forEach((item, index) => {
                points[categories[index]] = item;
            });
            player.subCategoryPoints = points;
        });
        leaderboard = leaderboard.sort(
            (a, b) => b.overallPoints - a.overallPoints
        );
        // localStorage.setItem(mode, JSON.stringify(leaderboard));
        return leaderboard;
    }
}

// function fetchAimlabLeaderboard(variables) {
//     const query = `
//       query getAimlabLeaderboard($leaderboardInput: LeaderboardInput!) {
//         aimlab {
//           leaderboard(input: $leaderboardInput) {
//             id
//             source
//             metadata {
//               offset
//               rows
//               totalRows
//             }
//             schema {
//               id
//               fields
//             }
//             data
//           }
//         }
//       }
//     `;

//     // wrap the variables object in another object with a property named
//     // after the variable in the query (in this case, "leaderboardInput")
//     const body = JSON.stringify({
//         query,
//         variables: {
//             leaderboardInput: variables,
//         },
//     });

//     return axios.post("https://api.aimlab.gg/graphql", body, {
//         headers: {
//             "Content-Type": "application/json",
//         },
//     });
// }

// const leaderboardData = [];

// hardBench.forEach((benchmark) => {
//     const benchmarkData = [];
//     let offset = 0;
//     // initialize a variable to store the last score
//     let lastScore = null;
//     // create a function to make an API request and update the lastScore variable
//     const fetchLeaderboardData = async () => {
//         const variables = {
//             clientId: "aimlab",
//             limit: 100,
//             offset,
//             taskId: benchmark.id,
//             taskMode: 0,
//             weaponId: benchmark.weapon,
//         };
//         const response = await fetchAimlabLeaderboard(variables);
//         // save the response data in the leaderboardData array
//         benchmarkData.push(response.data);
//         console.log(response.data.data.aimlab.leaderboard);
//         // update the lastScore variable with the score of the last item in the response data
//         lastScore =
//             response.data.data.aimlab.leaderboard.data[
//                 response.data.data.aimlab.leaderboard.data.length - 1
//             ].score;
//     };
//     // make the initial API request to get the first batch of data
//     fetchLeaderboardData().then(() => {
//         // while the last score is greater than or equal to the first entry in the scores array
//         // and the last score is not null (this is to prevent infinite looping)
//         while (lastScore >= benchmark.scores[0] && lastScore !== null) {
//             // increment the offset and make another API request
//             offset += 100;
//             fetchLeaderboardData();
//         }
//     });
//     console.log(benchmarkData);
//     leaderboardData.push(benchmarkData);
// });



export async function getKvksData() {
    let kvksScores = [];

    let cookiefiedSteamID = getCookie('steamid64');
    //console.log("steamid from cookies: " + cookiefiedSteamID);
        if(!isNullOrEmpty(cookiefiedSteamID)) {
          if(s4HardKvks != null) {
            for(let i=0;i<s4HardKvks.length;i++) {
              let kvksScore = await kvksAPIcall(cookiefiedSteamID, s4HardKvks[i].leaderboardID, s4HardKvks[i].name);
              if(kvksScore != null) kvksScores.push(kvksScore);
            }

            if(kvksScores.length > 0) {
              const results = KVKScalculateBenchmark(kvksScores, "hard", "s4");
              //console.log(results);
              return results;
            }
          }
        }
        //else console.log("no steamid in cookies!");
}

export async function kvksAPIcall(steamID64, leaderboardID, scenarioName) {
    //leaderboardID = '666';
    //steamID64 = '76561197983102874';
    const postData = {
        leaderboard_id: leaderboardID,
        steam_id: steamID64,
        steam_ids: [steamID64]
    };
    const apiUrl = 'https://kovaaks.com/sa_leaderboard_scores_steam_ids_get';
    const response = await axios.post(apiUrl, postData, {
        headers: {
            'Accept': '*/*',
            'User-Agent': 'X-UnrealEngine-Agent',
            'Authorization': 'Bearer 140000007407386b2c618e1e3eb4425b01001001a9a90b66180000000100000002000000f15b782a2e4453214f67070001000000b200000032000000040000003eb4425b01001001ce930c00c30e5fae0138a8c000000000aba90b662b5927660100b62e080000000000c9f0e8dc401c8594ca19563a6a6989c4d0d865d8538663ff4329600d3bcbc221ef3223dd25966fb3ccb71fd2a3ee94a8331ed3373c77b3fe4eab5aca10f564e4f9b9fa9e2808581ec851b9966dc30f204f6a43865979ab316c097e27109dcd87b15d72acf74e61511abbb8973c414dba51331987af9815d626367076bfd5f574',
            'GSTVersion': '3.4.2.2024-02-28-14-22-08-791139f13a',
            'Content-Type': 'application/json'
        }
    });

    if(response != null) {
        //console.log(response);
        const results = {
            scenario: scenarioName,
            id: leaderboardID,
            score: response.data[0] == null ? 0 : (response.data[0].score / 100).toFixed(2),
            placement: response.data[0] == null ? "unranked" : response.data[0].rank,
        };
        //console.log(results);
        return results;
    }
}

export function KVKScalculateBenchmark(scenarioData, tier, season) {
    let scenarioRanks = [];
    let scenarioPointRewards = [];
    let benchmarkRanks = [];
    let benchmarkScenarios = [];

    switch(season) {
        case "s4":
            switch(tier) {
                case "hard":
                    scenarioRanks = hardSubRanks;
                    scenarioPointRewards = hardSubPoints;
                    benchmarkRanks = hardRanks;
                    benchmarkScenarios = s4HardKvks;
                    break;
            }
            break;
    }

    let totalPoints = 0;
    let finalRank = 'Unranked';
    let calculatedScens = [];
    let aggregateSubCategoryPoints = [];
    let scenPointsList = [];

    if(scenarioPointRewards != null &&  benchmarkRanks != null && benchmarkScenarios != null) {
        //calculate scen points   
        const plainArray = [...scenarioData];
        for(let i=0;i<plainArray.length;i++) {
            let plainData = { ...plainArray[i] };


            if(plainData.scenario == "S4 Threeshot Hard") {
                console.log("'" + plainData.scenario + "'" + " doesn't equal '" + benchmarkScenarios[0].name + "'");
            }


            let matchingScen = benchmarkScenarios.find(s => s.name === plainData.scenario);
            if(matchingScen != null && plainData.score >= matchingScen.scores[0]) {
                let baseRankIndex = -1;
                for (let i = 0; i < matchingScen.scores.length; i++)
                    if (matchingScen.scores[i] <= plainData.score) 
                        baseRankIndex = i;

                if(baseRankIndex >= 0) {
                    let basePoints = getEntryAtIndex(hardSubRanks, baseRankIndex)[0];
                    //calculate partial points till next rank
                    let partialPoints = 0;
                    let prog = 0;

                    let nextRankIndex = baseRankIndex+1;
                    if(nextRankIndex < hardSubRanks.size) {
                        let pointsDiff = getEntryAtIndex(hardSubRanks, nextRankIndex)[0] - basePoints;
                        let scoreDiff = matchingScen.scores[nextRankIndex] - matchingScen.scores[baseRankIndex];
                        let pointsPerScore = pointsDiff / scoreDiff;
                        let scoreOver = plainData.score - matchingScen.scores[baseRankIndex];
                        partialPoints = scoreOver * pointsPerScore;
                        prog = Math.floor((scoreOver / scoreDiff) * 100);
                    }
                    else { //already max rank, take previous dist * 2/3
                        let pointsDiff = getEntryAtIndex(hardSubRanks, baseRankIndex)[0] - getEntryAtIndex(hardSubRanks, baseRankIndex-1)[0];
                        let scoreDiff = matchingScen.scores[baseRankIndex] - matchingScen.scores[baseRankIndex-1];
                        let scoreOver = plainData.score - matchingScen.scores[baseRankIndex];
                        partialPoints = ((scoreOver * (pointsDiff / scoreDiff)) / 3) * 2;
                        prog = 100;
                    }

                    let finalPts = parseFloat(basePoints) + parseFloat(partialPoints);
                    calculatedScens.push({
                        name: matchingScen.name,
                        category: matchingScen.category,
                        maxScore: plainData.score,
                        points: finalPts,
                        progress: prog,
                        rank: getEntryAtIndex(hardSubRanks, baseRankIndex)[1],
                        scores: matchingScen.scores,
                        rankList: hardSubRanks,
                        detailsOpen: false,
                    });
                    scenPointsList.push(finalPts);
                }
            }
            //else console.log("no matching scen found for " + plainData.scenario);
        }

        //select counted scens
        let clicking = calculatedScens.filter(s => s.category === "Clicking");
        let tracking = calculatedScens.filter(s => s.category === "Tracking");
        let switching = calculatedScens.filter(s => s.category === "Switching");
        //console.log("clicking: " + clicking.length + ", tracking: " + tracking.length + ", switching: " + switching.length);

        let countedClicking = clicking.sort((a, b) => b.points - a.points).slice(0, 4);
        let countedTracking = tracking.sort((a, b) => b.points - a.points).slice(0, 4);
        let countedSwitching = switching.sort((a, b) => b.points - a.points).slice(0, 4);
        let subCategoryPointsList = [countedClicking, countedTracking, countedSwitching];

        for (let i = 0; i < subCategoryPointsList.length; i++) {
            if(subCategoryPointsList[i] != null && subCategoryPointsList.length > 0) {
                let subCatTotal = 0;

                for(let j=0;j<subCategoryPointsList[i].length;j++) {
                    let scenPts = parseFloat(subCategoryPointsList[i][j].points);
                    subCatTotal += scenPts
                    totalPoints += scenPts;             
                }

                aggregateSubCategoryPoints.push(subCatTotal);
            }       
        }
        totalPoints = Math.floor(totalPoints);

        //calculate final rank
        let keyValuePairs = Object.entries(hardRanks);
        let firstKey = keyValuePairs[0] ? parseInt(keyValuePairs[0][0]) : null;
        let isAtLeastAsLarge = firstKey ? totalPoints >= firstKey : false;
        if(isAtLeastAsLarge) {     
            let filteredPairs = keyValuePairs.filter(([key, value]) => parseInt(key) < totalPoints);
            let lastPair = filteredPairs[filteredPairs.length - 1];
            let lastStringProperty = lastPair ? lastPair[1] : null;
    
            //console.log("Achieved Benchmark Rank: " + lastStringProperty + ", with " + totalPoints + " points!");
            finalRank = lastStringProperty ?? "Unranked";
        }
        else {
            //console.log("user is unranked with points: " + totalPoints + " (min rank: " + firstKey + ")");
        }      
    }

    return {
        overallPoints: totalPoints,
        overallRank: finalRank,   
        allPoints: scenPointsList,
        subCategoryPoints: aggregateSubCategoryPoints,
        benchmarks: calculatedScens,
        detailsOpen: false,
    };
}

const getEntryAtIndex = (map, index) => {
    let currentIndex = 0;
    for (const entry of map.entries()) {
      if (currentIndex === index) {
        return entry;
      }
      currentIndex++;
    }
    return null; // Return null if index is out of range
  };
  
export function setCookie(name, value) {
    document.cookie = name + "=" + value + "; path=/";
}

export function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}

export function isNullOrEmpty(str) {
    return !str || str.trim() === '';
}
