<template>
  <div>
    <vue-mathjax :formula="formula"></vue-mathjax>
  </div>
</template>

<script>
import { VueMathjax } from 'vue-mathjax'
export default {
  components: {
    'vue-mathjax': VueMathjax
  },
  name: 'Question',
  data () {
    return {
      
    }
  },
  props: {
    formula: {
      type: String
    }
  }
}
</script>

<style scoped>
</style>
