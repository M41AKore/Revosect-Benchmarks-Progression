<template>
  <div>
    <!-- Popup component -->
    <div v-if="showPopup" class="popup">
      <div class="popup-content">
        <!-- Input fields -->
        <p>Aimlabs Username:</p>
        <input id="user_input" style="color: black;" type="text" v-model="username" placeholder="...">

        <p>SteamID64:</p>
        <input id="id_input" style="color: black;" type="text" v-model="steamid64" placeholder="...">

        <!-- Button to submit -->
        <button @click="submit">Submit</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as functionos from "../helpers/functions.js";

export default {
  data() {
    /*let cookiefiedName = functionos.getCookie('aimlabsusername');
    let cookiefiedSteamID = functionos.getCookie('steamid64');

    document.getElementById('user_input').innerText = cookiefiedName;
    document.getElementById('id_input').innerText = cookiefiedSteamID;*/

    return {
      username: '',
      steamid64: '',
      showPopup: true,
    };
  },
  mounted() {
    let cookiefiedName = functionos.getCookie('aimlabsusername');
    let cookiefiedSteamID = functionos.getCookie('steamid64');

    this.username = cookiefiedName || '';
    this.steamid64 = cookiefiedSteamID || '';
  },
  methods: {
    submit() {
      console.log('Submitted:', this.username, this.steamid64);
      functionos.setCookie('aimlabsusername', this.username);
      functionos.setCookie('steamid64', this.steamid64);

      let cookiefiedName = functionos.getCookie('aimlabsusername');
      let cookiefiedSteamID = functionos.getCookie('steamid64');

      console.log('user: ' + cookiefiedName + ", id: " + cookiefiedSteamID);
      this.showPopup = false;
    }
  }
};
</script>

<style>
.popup {
  position: fixed;
  top: 20%;
  left: 70%;
  transform: translate(-50%, -50%);
  background-color: #111;
  border: 1px solid black;
  padding: 20px;
}

.popup-content {
  display: flex;
  flex-direction: column;
}

input, button {
  margin-bottom: 10px;
}
</style>