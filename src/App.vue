<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <div>
      <button v-on:click="switchImg()">switch image</button>
      <button v-on:click="biggerCanvas(true)">++ canvas</button>
      <button v-on:click="biggerCanvas(false)">-- canvas</button>
    </div>
    <div class="test">
      <Vr360 v-bind:imgSrc="testImg" :customCanvasDimensions="{width:dimension, height:dimension}" />
    </div>
  </div>
</template>

<script>
import Vr360 from "./components/VR360/Vr360.vue";

export default {
  name: "app",
  components: {
    Vr360
  },
  data: function() {
    return {
      testImg: {
        type: String
      },
      dimension: Number
    };
  },
  methods: {
    biggerCanvas(more) {
      if (more) {
        this.dimension += 10;
      } else {
        this.dimension -= 10;
      }
    },
    switchImg() {
      if (
        this.testImg ===
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Castle_Church_of_Lutherstadt_Wittenberg_%28interior%2C_full_spherical_panoramic_image%2C_equirectangular_projection%29.jpg/1280px-Castle_Church_of_Lutherstadt_Wittenberg_%28interior%2C_full_spherical_panoramic_image%2C_equirectangular_projection%29.jpg"
      ) {
        this.testImg =
          "https://live.staticflickr.com/5001/5235804194_2a4e651c08_b.jpg";
      } else {
        this.testImg =
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Castle_Church_of_Lutherstadt_Wittenberg_%28interior%2C_full_spherical_panoramic_image%2C_equirectangular_projection%29.jpg/1280px-Castle_Church_of_Lutherstadt_Wittenberg_%28interior%2C_full_spherical_panoramic_image%2C_equirectangular_projection%29.jpg";
      }
    }
  },
  created() {
    this.testImg =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Castle_Church_of_Lutherstadt_Wittenberg_%28interior%2C_full_spherical_panoramic_image%2C_equirectangular_projection%29.jpg/1280px-Castle_Church_of_Lutherstadt_Wittenberg_%28interior%2C_full_spherical_panoramic_image%2C_equirectangular_projection%29.jpg";
    this.dimension = 80;
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.test {
  display: flex;
  justify-content: center;
}
</style>
