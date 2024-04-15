<template>
  <div>
    <div>
      <div style="display: flex; flex-direction: row;">
        <div>
        <p>From:</p>
        <input type="date" style="color:black;" v-model="startDate" @change="updateBars">
      </div>
      <div>
        <p>To:</p>
        <input type="date" style="color:black;" v-model="endDate" @change="updateBars">
      </div>
      </div>
      
      <input type="range" style="color:black;" min="0" :max="steps" v-model="currentStep" @input="updateBars">
      <p>{{ this.currentDate }}</p>
    </div>
    
    <div>
      <button class="raceCharButton" @click="startRace">Start</button>
      <button class="raceCharButton" @click="stopRace">Stop</button>
      <button class="raceCharButton" @click="resetRace">Reset</button>
    </div>

    <div>
      <!-- Speed slider -->
      <p>Speed: {{ speed }} ms per day</p>
      <input type="range" style="color:black;" min="50" max="2000" step="50" v-model="speed" @input="updateSpeed">
    </div>

    <div class="chart">
      <transition-group name="slide-fade">
        <div class="bar-container" v-for="(bar, index) in sortedVisibleBars" :key="bar.label">
          <div class="label" :style="{ width: '30px'}">#{{ index+1 }}</div>
          <div class="label" :style="{ width: '100px'}">{{ bar.label }}</div>
          <img :style="{ width: '40px', height: '40px'}" :src="getImagePath(bar.values[currentStep >= bar.values.length ? bar.values.length-1 : this.currentStep].rank)" alt="Unranked" />
          <div class="bar" :style="{ width: ((bar.values[this.currentStep >= bar.values.length ? bar.values.length-1 : this.currentStep].points) * 0.2) + 'px', backgroundColor: bar.color }">
            {{ bar.values[this.currentStep >= bar.values.length ? bar.values.length-1 : this.currentStep].points }}
          </div>
        </div>
      </transition-group>
    </div>
    
    <!--<div class="chart">
      <div class="bar-container" v-for="(bar, index) in sortedVisibleBars" :key="bar.label" style="background-color: aquamarine;">
        <div class="label">{{ bar.label }}</div>
        <img :style="{ width: '40px', height: '40px'}" :src="getImagePath(bar.values[currentStep >= bar.values.length ? bar.values.length-1 : this.currentStep].rank)" alt="Unranked" />
        <div class="bar" :style="{ width: ((bar.values[this.currentStep >= bar.values.length ? bar.values.length-1 : this.currentStep].points) * 0.2) + 'px', backgroundColor: bar.color }">
          {{ bar.values[this.currentStep >= bar.values.length ? bar.values.length-1 : this.currentStep].points }}</div>
      </div>
    </div>-->
    
    <!--<div class="chart">
      <div class="bar-container" v-for="(bar, index) in visibleBars" :key="index" :style="{ transform: 'translateY(' + index * barHeight + 'px)' }">
        <div class="label" :style="{ width: '100px'}" >{{ bar.label }}</div>
        <img :style="{ width: '40px', height: '40px'}" :src="getImagePath(bar.values[this.currentStep >= bar.values.length ? bar.values.length-1 : this.currentStep].rank)" alt="Unranked" />
        <div class="bar" :style="{ width: ((bar.values[this.currentStep >= bar.values.length ? bar.values.length-1 : this.currentStep].points) * 0.2) + 'px', backgroundColor: bar.color }">
          {{ bar.values[this.currentStep >= bar.values.length ? bar.values.length-1 : this.currentStep].points }}</div>   
      </div>
    </div>-->
  </div>
</template>

<script>
import barDataFile from "../helpers/barData.json";

export default {
  data() {
    return {
      bars: barDataFile.data,
      startDate: barDataFile.startDate,
      endDate: barDataFile.endDate,
      currentStep: 0,
      intervalId: null,
      speed: 500, // ms tick
      barHeight: 50 // Adjust the height as needed
    };
  },
  computed: {
    steps() {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
      return diff + 1; // Including both start and end dates
    },
    sortedVisibleBars() {
      // Sort visible bars based on points
      return this.visibleBars.sort((a, b) => b.values[this.currentStep].points - a.values[this.currentStep].points);
    },
    visibleBars() {
      //return this.bars.filter(bar => bar.dateIndex <= this.currentStep);
      //let filteredBars = this.bars.sort((a, b) => b.values[this.currentStep].points - a.values[this.currentStep].points);

      this.bars.forEach(bar => {
        bar.color = '#a22';
      });

      return this.bars;    
    },
    currentDate() {
      const startDate = new Date(this.startDate);
      const currentDate = new Date(startDate.getTime() + (this.currentStep * 24 * 60 * 60 * 1000));
      return currentDate.toLocaleDateString(); // Format the date as needed
    },
  },
  methods: {
    updateSpeed() {
      // Clear existing interval and start a new one with updated speed
      clearInterval(this.intervalId);
      this.startRace();
    },
    getImagePath(rank) {
            if(rank != null) return `../../rank-img/ra/s2/${rank.toLowerCase()}.png`;
            else return `../../rank-img/ra/s2/unranked.png`
        },

    startRace() {
      this.intervalId = setInterval(this.moveBars, this.speed);
      //this.updateBars();
    },
    stopRace() {
      clearInterval(this.intervalId);
    },
    resetRace() {
      this.stopRace();
      this.currentStep = 0;
      // Reset bars to initial values
    },
    moveBars() {
      if (this.currentStep < this.steps - 1) {
        this.currentStep++;
        // Update values of bars to simulate race
        // Sort the bars after updating their values
        this.bars.forEach(bar => {
          // Check if currentStep is within the range of values for the bar
          if (this.currentStep < bar.values.length) {
            bar.value = bar.values[this.currentStep];
          }
        });
        // Sort the bars after updating their values
        this.sortedVisibleBars;
      } else {
        this.stopRace();
      }
    },
    updateBars() {
      // Update bars based on current step
      // Example: filter bars that have a dateIndex less than or equal to the current step
      console.log("Visible Bars:", this.visibleBars);
    }
  },
  
};
</script>

<style scoped>

/* Define transition effect for bar movement */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: transform 0.1s ease;
}

.slide-fade-enter, .slide-fade-leave-to /* .slide-fade-leave-active in <2.1.8 */ {
  transform: translateY(0);
}

.slide-fade-enter-to, .slide-fade-leave /* .slide-fade-enter-active in <2.1.8 */ {
  transform: translateY(100%);
}

.chart {
  display: flex;
  flex-direction: column; /* Stack bars vertically */
  align-items: flex-start; /* Align bars to the left */
}

.bar-container {
  display: flex;
  align-items: center;
  margin-bottom: 10px; /* Adjust spacing between bars */
  transition: transform 0.5s ease; /* Apply transition effect to bar movement */
}

.bar {
  height: 20px; /* Adjust bar height as needed */
  transition: width 0.5s ease; /* Adjust animation speed as needed */
}

.label {
  margin-left: 10px; /* Adjust spacing between bar and label */
}

.raceCharButton {
  border: 2px solid #000; /* Sets the border to be 2px wide and solid */
  border-color: #555; /* Sets the border color to blue */
  background-color: transparent; /* Makes the background transparent */
  color: #fff; /* Sets the text color */
  padding: 5px 10px; /* Adds padding to the button */
  font-size: 16px; /* Sets the font size */
}

</style>