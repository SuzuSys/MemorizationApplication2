<template>
  <div id="entire">
    <el-divider></el-divider>
    <el-row>
      <el-col :span="digit + 1">
        <span class="digital"><span v-for="(char, index) in idxFormat" :key="index" class="digital_number">{{char}}</span>.</span>
      </el-col>
      <el-col :span="23 - digit">
        <p><code>question: {{ isextype ? x_class : y_class }}, answer: {{ isextype ? y_class : x_class }}</code></p>
      </el-col>
    </el-row>
    <el-row>
      <el-col :offset="1" :span="23">
        <el-row>
          <el-col class="question" :span="23"><vue-mathjax :formula="x"></vue-mathjax></el-col>
        </el-row>
        <el-row>
          <el-col class="answer" :span="23" v-show="show_answer"><vue-mathjax :formula="y"></vue-mathjax></el-col>
        </el-row>
      </el-col>
    </el-row>
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
    idx: Number,
    digit: Number,
    x: String,
    y: String,
    x_class: String,
    y_class: String,
    isextype: Boolean,
    show_answer: Boolean
  },
  computed: {
    idxFormat: function() {
      let str = String(this.idx);
      for (let i = str.length; i < this.digit; i++) {
        str = '0' + str;
      }
      return str;
    }
  }
}
</script>

<style scoped>
@font-face {
  font-family: 'SevenSegment';
  src: url('../../font/7 Segment.ttf') format('truetype');
}
#entire {
  margin: 10px;
}
p {
  margin: 0px;
}
.digital {
  font-family: SevenSegment;
  font-size: 3em;
  margin-right: 10px;
}
.digital_number {
  display: inline-block;
  width: 25px;
  text-align: right;
}
.el-divider {
  margin-top: 5px;
  margin-bottom: 5px;
}
.qa {
  font-family: SevenSegment;
  font-size: 2em;
}
.el-row {
  margin-top: 0px;
}
.question {
  border-left: solid #409EFF 4px;
  border-radius: 4px;
  padding-left: 5px;
}
.answer {
  border-left: solid #67C23A 4px;
  border-radius: 4px;
  padding-left: 5px;
}
</style>
