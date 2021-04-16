<template>
  <div id="app">
    <div id="setting"></div>
    <Question formula="$x$"/>
  </div>
</template>

<script>
import Question from "./components/Question";

export default {
  name: "App",
  components: {
    Question
  }
};
</script>

<style>
#app {
}
</style>
