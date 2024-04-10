/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mainCyan: "#68c7c3",
        alBlue: "#263258",
        alDarkBlue: "#202151",
        //
        iron: "#afafaf",
		iron_opposite: "#000",
        bronze: "#ff9900",
		bronze_opposite: "#000",
        silver: "#cbd9e6",
		silver_opposite: "#000",
        gold: "#d8bf52",
		gold_opposite: "#000",
        platinum: "#2fcfc2",
		platinum_opposite: "#000",
        
		
		//vt
		diamond: "#b9f2ff",
        jade: "#85fa85",
        master: "#ff66e9",
        grandmaster: "#ffd700",
        nova: "#7d4ac5",
        astra: "#ff1761",
        celestial: "#ffffff",
		
        //ra colors
        mythic: "#ffd700",
		mythic_opposite: "#000",
        immortal: "#c36eff",
		immortal_opposite: "#000",
        archon: "#ff0000",
		archon_opposite: "#000",
        ethereal: "#91d7e4",
		ethereal_opposite: "#000",
        divine: "#fff",
		divine_opposite: "#000",
		omnipotent: "#00ff96",
		omnipotent_opposite: "#000",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        oswald: ["Oswald", "sans-serif"],
      },
    },
  },
  plugins: [],
};
