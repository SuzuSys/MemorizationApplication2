<template>
  <div id="app">
    <div id="setting_button">
      <el-button icon="el-icon-notebook-2" @click="drawer = true">Add Sheet</el-button>
    </div>
    <el-drawer
      title="Add Sheet"
      :visible.sync="drawer"
      :direction="direction">
      <div id="setting">
        <p>Shuffle: <el-switch v-model="shuffle" /></p>
        <el-divider content-position="left">Make Sheet</el-divider>
        <el-switch
            v-model="temp_isextype"
            inactive-text="word test"
            active-text="explanation test" />
      </div>
    </el-drawer>
    <div id="sheet">
      <Question formula="$x$"/>
    </div>
  </div>
</template>

<script>
import Question from "./components/Question";
import linking from "./assets/json/linking.json"

export default {
  name: "App",
  components: {
    Question
  },
  data() {
    return {
      drawer: false,
      direction: 'ltr',
      linking: linking,
      shuffle: false,
      temp_isextype: false,
      layer: 0
    }
  },
  methods: {
    add_sheet() {

    }
  }
};
</script>

<style>
#app {
  margin: 0px;
}
#sheet {
  width: 793px;
  margin: auto;
  background-color: white;
  padding: 10mm;
}
#setting_button {
  position: fixed;
  top: 20px;
  left: 20px;
}
#setting {
  padding: 0px 20px;
  color: #505050;
}
@media print {
  #setting_button {
    display: none;
  }
  #setting {
    display: none;
  }
}
</style>
