<template>
  <div>
    <p>{{ x }}</p>
    <vue-mathjax :formula="x"></vue-mathjax>
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
      x: '$x$'
    }
  }
}
</script>

<style scoped>
@font-face {
  font-family: 'SevenSegment';
  src: url('../../font/7 Segment.ttf') format('truetype');
}
</style>
