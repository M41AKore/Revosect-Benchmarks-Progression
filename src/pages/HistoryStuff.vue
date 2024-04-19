<template>
  <div style="display: flex;-ms-flex-align: center;flex-direction: column;margin-left: 5%;margin-right: 5%;margin-top: 2%;">

    <div style="display:flex;flex-direction: row;">
      <div>
      <div style="display: flex; flex-direction: row;">
        <div>
        <p>From:</p>
        <p style="color:white;">{{ startDate }}</p>
      </div>
      <div style="margin-left: 20px;">
        <p>To:</p>
        <p style="color:white;">{{ endDate }}</p>
      </div>
      </div>
      
      <input type="range" style="color:black;" min="0" :max="steps" v-model="currentStep" @input="updateBars">
      <p>Current: {{ this.currentDate }}</p>
    </div>
    
    <div style="margin-left: 5%;margin-top: 1%;">
      <div>
      <button class="raceCharButton" @click="startRace">Start</button>
      <button class="raceCharButton" @click="stopRace">Stop</button>
      <button class="raceCharButton" @click="resetRace">Reset</button>
    </div>
      <div>
      <p>Speed: {{ speed }} ms per day</p>
      <input type="range" style="color:black;" min="50" max="2000" step="50" v-model="speed" @input="updateSpeed">
    </div>
    </div>
    </div>
    
    <!-- ********************************* -->
    <!--          Chart Race Bars          -->
    <!-- ********************************* -->
    <div style="display:flex;flex-direction: row;">

      <div class="chart">
      <transition-group name="slide-fade">
        <div class="bar-container" v-for="(bar, index) in sortedVisibleBars" :key="bar.label">
          <div class="label" :style="{ width: '30px'}">#{{ index+1 }}</div>
          <div class="label" :style="{ width: '100px'}">{{ bar.label }}</div>
          <img :style="{ width: '40px', height: '40px', 'margin-right': '10px' }" :src="getImagePath(bar.values[currentStep >= bar.values.length ? bar.values.length-1 : this.currentStep].rank)" alt="Unranked" />
          <div class="bar" :style="{ width: ((bar.values[this.currentStep >= bar.values.length ? bar.values.length-1 : this.currentStep].points) * 0.2) + 'px', backgroundColor: bar.color }">
            {{ bar.values[this.currentStep >= bar.values.length ? bar.values.length-1 : this.currentStep].points }}
          </div>
        </div>
      </transition-group>
    </div>

    <div class="chat-sidebar">
      <div class="messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" :key="index" class="message">
          <span v-for="(part, partIndex) in message.parts" :key="partIndex" :style="{ color: part.color }">{{ part.text }}</span>
        </div>
      </div>
    </div>
    </div>
    

  </div> 
</template>

<script>
import barDataFile from "../helpers/barData.json";
import eventDataFile from "../helpers/events.json";

export default {
  data() {
    return {
      bars: barDataFile.data,
      startDate: barDataFile.startDate,
      endDate: barDataFile.endDate,
      currentStep: 0,
      intervalId: null,
      speed: 500, // ms tick
      barHeight: 50,
      racing: false,
      scoreEvents: eventDataFile.events,
      messages: [],
      //totalPosts: 0,
    };
  },
  computed: {
    steps() {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
      return diff + 1;
    },
    sortedVisibleBars() {
      let sorted = this.visibleBars.sort((a, b) => {
        let currentStep = Math.min(this.currentStep, Math.max(a.values.length, b.values.length) - 1);
        return b.values[currentStep].points - a.values[currentStep].points;
      });
      return sorted.slice(0, 20);
    },
    visibleBars() {
      this.bars.forEach(bar => {
        bar.color = '#a22'; //red
      });

      return this.bars;    
    },
    currentDate() {
      const startDate = new Date(this.startDate);
      const currentDate = new Date(startDate.getTime() + (this.currentStep * 24 * 60 * 60 * 1000));
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1; // Adding 1 because getMonth() returns zero-based month index
      const year = currentDate.getFullYear();
      return `${year}/${month}/${day}`;
    },
  },
  methods: {
    updateSpeed() {
      clearInterval(this.intervalId);
      if(this.racing) this.startRace();
    },
    getImagePath(rank) {
      if(rank != null) return `../../rank-img/ra/s2/${rank.toLowerCase()}.png`;
      else return `../../rank-img/ra/s2/unranked.png`
    },
    startRace() {
      this.stopRace();
      this.intervalId = setInterval(this.moveBars, this.speed);
      this.racing = true;
      //this.updateBars();
    },
    stopRace() {
      clearInterval(this.intervalId);
      this.racing = false;
    },
    resetRace() {
      this.stopRace();
      this.currentStep = 0;
    },
    moveBars() {
      if (this.currentStep < this.steps - 1) {
        this.currentStep++;
        this.bars.forEach(bar => {
          if (this.currentStep < bar.values.length) {
            bar.value = bar.values[this.currentStep];
          }
        });
        this.sortedVisibleBars;

        //console.log("step " + this.currentStep);
        this.checkEvents();
      } 
      else this.stopRace();
    },
    updateBars() {
      //console.log("Visible Bars:", this.visibleBars);
    },
    checkEvents() {
      let start = new Date(this.startDate);
      let curr = new Date(start.getTime() + (this.currentStep * 24 * 60 * 60 * 1000));
 
      let toPost = [];
      for (let i = 0; i < this.scoreEvents.length; i++) {
        let d = new Date(this.scoreEvents[i].date);
        let yesterday = new Date(curr); // yesterday's date
        yesterday.setDate(curr.getDate() - 1);

        if(curr > d && d > yesterday) {
          console.log(this.scoreEvents[i].eventMessage); 
          toPost.push(this.scoreEvents[i].eventMessage);
        }   
      }
            
      if(toPost.length > 0) {
        let c = `${curr.getFullYear()}/${(curr.getMonth() + 1)}/${curr.getDate()}`;
        this.addMessage({ parts: [{ text: "--- " + c + " ---", color: 'white' }] });

        for (let i = 0; i < toPost.length; i++) {
          this.addMessage({ parts: [{ text: toPost[i], color: 'white' }] });
          //this.totalPosts += 1;
          //console.log("total available: " + this.scoreEvents.length + ", posted: " + this.totalPosts);
        }

        this.$nextTick(() => { this.scrollToBottom(); });
      }
    },
    addMessage(message) {
      //let msg =  { parts: [{ text: 'Hello', color: 'blue' }, { text: " world!", color: 'red' }] },
      this.messages.push(message);
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    },
  },
};
</script>

<style scoped>

/* transition effect for bar movement */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: transform 0.1s ease;
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(0);
}

.slide-fade-enter-to, .slide-fade-leave {
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
  transition: transform 0.5s ease; /* transition effect to bar movement */
}

.bar {
  height: 20px; /* bar height */
  transition: width 0.5s ease; /* animation speed */
}

.label {
  margin-left: 10px; /* spacing between bar and label */
}

.raceCharButton {
  border: 2px solid #000; 
  border-color: #555; 
  background-color: transparent; 
  color: #fff; 
  padding: 5px 10px; 
  font-size: 16px;
}


.chat-sidebar {
  background-color: #111;
  position: fixed;
  top: 10%;
  right: 0;
  height: 80%;
  width: 300px; /* Adjust width as needed */
  overflow-y: auto; /* Enable scrollbar if content exceeds height */
}
.messages {
  overflow-y: scroll;
  height: calc(100% - 0px);
}
.message {
  margin-bottom: 5px;
  padding: 10px;
  background-color: #333;
  color: #fff;
  border-radius: 5px;
}
</style>