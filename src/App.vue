<template>
  <div id="app">
    <div id="setting">
      <el-button icon="el-icon-notebook-2" @click="drawer = true">Add sheet</el-button>
    </div>
    <el-drawer
      title="Add Sheet"
      :visible.sync="drawer"
      :direction="direction">
      <span>Hi, there!</span>
    </el-drawer>
    <div id="sheet">
      <Question formula="$x$"/>
    </div>
  </div>
</template>

<script>
import Question from "./components/Question";

export default {
  name: "App",
  components: {
    Question
  },
  data() {
    return {
      drawer: false,
      direction: 'ltr'
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
#setting {
  position: fixed;
  top: 20px;
  left: 20px;
}
@media print {
  #setting {
    display: none;
  }
}
</style>
