<template>
  <div>
    <div id="top" v-if="show_top">
      <h1>Memorization Application</h1>
      <div id="logo">
        <div id="img_container">
          <img src="@/assets/logo.svg" width="400" height="400">
        </div>
      </div>
      <div id="math">
        <div>
          <vue-mathjax :formula="expression"></vue-mathjax>
        </div>
      </div>
      <ol>
        <li><a href="/print" @click.stop.prevent="goPrint">Print Document</a></li>
        <li><a href="/create" @click.stop.prevent="goCreate">Create Sheet</a></li>
      </ol>
      <footer>
        <div>
          <img src="@/assets/user_icon.svg" alt="?">
        </div>
      </footer>
    </div>
    <router-view>
    </router-view>
  </div>
</template>

<script>
import { VueMathjax } from 'vue-mathjax'
export default ({
  name: 'App',
  components: {
    'vue-mathjax': VueMathjax
  },
  data() {
    return {
      expression: '\\begin{split}x(t)&=0.8\\left(\\cos\\frac{\\displaystyle |t|-\\left|t-0.8\\cdot\\frac{\\pi}{6}\\right|-\\left|t-0.8\\left(\\frac{5\\pi}{6}+2\\left(1-\\cos\\frac{\\pi}{6}\\right)\\right)-2\\cdot0.3\\right|+\\left|t-0.8\\left(\\pi+2\\left(1-\\cos\\frac{\\pi}{6}\\right)\\right)-2\\cdot0.3\\right|}{\\displaystyle \\phantom{\\frac{0}{0}}2\\cdot0.8\\phantom{\\frac{0}{0}}}+\\sin\\frac{\\displaystyle\\frac{\\displaystyle\\left|t-0.8\\left(\\frac{\\pi}{6}+1-\\cos\\frac{\\pi}{6}\\right)-0.3\\right|+\\left|t-0.8\\left(\\frac{5\\pi}{6}+1-\\cos\\frac{\\pi}{6}\\right)-0.3\\right|}{2}-\\left|t-0.8\\left(\\frac{\\pi}{2}+1-\\cos\\frac{\\pi}{6}\\right)-0.3\\right|}{\\displaystyle\\phantom{\\frac{0}{0}}0.8\\phantom{\\frac{0}{0}}}-1\\right)+\\frac{\\displaystyle \\left|t-0.8\\cdot\\frac{\\pi}{6}\\right|-\\left|t-0.8\\left(\\frac{\\pi}{6}+1-\\cos\\frac{\\pi}{6}\\right)-0.3\\right|-\\left|t-0.8\\left(\\frac{5\\pi}{6}+1-\\cos\\frac{\\pi}{6}\\right)-0.3\\right|+\\left|t-0.8\\left(\\frac{5\\pi}{6}+2\\left(1-\\cos\\frac{\\pi}{6}\\right)\\right)-2\\cdot0.3\\right|}{\\displaystyle\\phantom{\\frac{0}{0}}2\\phantom{\\frac{0}{0}}} \\\\ y(t)&=0.8\\left(\\sin\\frac{\\displaystyle\\frac{\\displaystyle|t|-\\left|t-0.8\\cdot\\frac{\\pi}{6}\\right|}{0.8}+\\frac{\\pi}{6}}{\\displaystyle\\phantom{\\frac{0}{0}}2\\phantom{\\frac{0}{0}}}+\\sin\\frac{\\displaystyle\\frac{\\displaystyle\\left|t-0.8\\left(\\frac{5\\pi}{6}+2\\left(1-\\cos\\frac{\\pi}{6}\\right)\\right)-2\\cdot0.3\\right|-\\left|t-0.8\\left(\\pi+2\\left(1-\\cos\\frac{\\pi}{6}\\right)\\right)-2\\cdot0.3\\right|}{0.8}-\\frac{\\pi}{6}}{\\displaystyle\\phantom{\\frac{0}{0}}2\\phantom{\\frac{0}{0}}}+\\cos\\left(\\frac{\\displaystyle\\left|t-0.8\\left(\\frac{\\pi}{6}+1-\\cos\\frac{\\pi}{6}\\right)-0.3\\right|-\\left|t-0.8\\left(\\frac{\\pi}{2}+1-\\cos\\frac{\\pi}{6}\\right)-0.3\\right|}{\\displaystyle\\phantom{\\frac{0}{0}}2\\cdot0.8\\phantom{\\frac{0}{0}}}+\\frac{\\pi}{6}\\right)-\\cos\\left(\\frac{\\displaystyle\\left|t-0.8\\left(\\frac{5\\pi}{6}+1-\\cos\\frac{\\pi}{6}\\right)-0.3\\right|-\\left|t-0.8\\left(\\frac{\\pi}{2}+1-\\cos\\frac{\\pi}{6}\\right)-0.3\\right|}{\\displaystyle\\phantom{\\frac{0}{0}}2\\cdot0.8\\phantom{\\frac{0}{0}}}+\\frac{\\pi}{6}\\right)\\right)\\end{split}',
      show_top: false
    }
  },
  methods: {
    goPrint: function() {
      this.$router.push({ path: '/print' });
    },
    goCreate: function() {
      this.$router.push({ path: '/create' });
    },
    goHistory: function() {
      if (this.$route.path === '/') this.show_top = true;
      else this.show_top = false;
    }
  },
  watch: {
    '$route' : 'goHistory'
  },
  created: function() {
    if (this.$route.fullPath === '/') this.show_top = true;
  }
})
</script>

<style scoped>
#logo {
  text-align: center;
}
#img_container {
  display: inline-block;
  position: relative;
  width: 400px;
  height: 200px;
}
#img_container img {
  position: absolute;
  top: -150px;
  left: 0px;
}
#top {
  position: relative;
}
#top h1 {
  text-align: center;
  color: white;
  font-variant: small-caps;
  font-size: 4em;
  font-family: serif;
}
#math {
  overflow-x: scroll;
  overflow-y: hidden;
  width: 90%;
  margin: auto;
  margin-bottom: 100px;
}
#math div {
  color: white;
  min-width: 3300px;
  margin-bottom: 5px;
}
#math::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
#math::-webkit-scrollbar-thumb {
  background-color: white;
  border-radius: 5px;
}
#math::-webkit-scrollbar-track {
  background-color: #282828;
  border-radius: 5px;
}
#math::-webkit-scrollbar-corner {
  display: none;
}
ol {
  list-style-type: none;
  text-align: center;
  padding-left: 0px;
  font-family: serif;
}
ol a {
  color: white;
  display: inline-block;
  width: 30%;
  font-size: 40px;
  font-weight: bold;
  border-left: solid white 5px;
  border-right: solid white 5px;
  text-decoration: none;
  padding: 4px 8px;
  transition: 0.4s;
}
ol a:visited {
  color: white;
}
ol a:hover {
  background-color: white;
  color: steelblue;
}
footer {
  text-align: center;
  font-size: 15px;
  border-top: 2px solid white;
  padding: 40px;
}
footer img {
  width: 120px;
}
</style>