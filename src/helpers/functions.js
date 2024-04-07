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
            console.log(filtered);
        }
        else if(season == "s4") {
            let clicking = subCategoryPointsList[0].concat(subCategoryPointsList[1]);
            let tracking = subCategoryPointsList[2].concat(subCategoryPointsList[3]).concat(subCategoryPointsList[4]);
            let switching = subCategoryPointsList[5].concat(subCategoryPointsList[6]).concat(subCategoryPointsList[7]);
        
            clicking = clicking.sort((a, b) => b - a).slice(0, 4);
            tracking = tracking.sort((a, b) => b - a).slice(0, 4);
            switching = switching.sort((a, b) => b - a).slice(0, 4);

            subCategoryPointsList = [clicking, tracking, switching];      
            
            //console.log(clicking);
        }

        //console.log("aggregateCategoryPoints: " + aggregateSubCategoryPoints);
    }

    aggregateSubCategoryPoints = subCategoryPointsList.map((category) => {
        return category.reduce((total, num) => total + num, 0);
    });

    //calculating overall points
    let overallPoints = aggregateSubCategoryPoints.reduce(
        (acc, curr) => acc + curr
    );

    overallPoints = Math.floor(overallPoints);

    //Check if player is valour/platinum to add excess points to the total
    if (mode != "hard") {
        let pointNormalizedData = checkExcessPoints(
            playerBenchmarks,
            subCategoryPointsList,
            mode,
            overallPoints,
            aggregateSubCategoryPoints
        );

        playerBenchmarks = pointNormalizedData.playerBench;
        overallPoints = pointNormalizedData.overallPoints;
        aggregateSubCategoryPoints =
            pointNormalizedData.aggregateSubCategoryPoints;
    }
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
            benchmarkPointsList = mediumPoints;
            benchmarkRankList = mediumRanks;
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

export function organizeLeaderboard(playerList, fullBench, mode) {
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
                    mode
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
