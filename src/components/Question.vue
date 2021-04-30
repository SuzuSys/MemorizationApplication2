<template>
  <div>
    <vue-mathjax :formula="x"></vue-mathjax>
    <p>{{ x }}</p>
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
    x: String
  }
}
</script>

<style scoped>
@font-face {
  font-family: 'SevenSegment';
  src: url('../../font/7 Segment.ttf') format('truetype');
}
</style>
