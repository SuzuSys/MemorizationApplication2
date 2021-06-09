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
          <el-col class="question" :span="24">
            <span v-for="(item, index) in (isextype ? formated_x : formated_y)" :key="index">
              <span v-html="item.sentence"></span>
              <vue-mathjax :formula="item.math"></vue-mathjax>
            </span>
          </el-col>
        </el-row>
        <el-row v-show="show_answer">
          <el-col class="answer" :span="24">
            <span v-for="(item, index) in (isextype ? formated_y : formated_x)" :key="index">
              <span v-html="item.sentence"></span>
              <vue-mathjax :formula="item.math"></vue-mathjax>
            </span>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-divider v-if="alone"></el-divider>
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
      formated_x: [],
      formated_y: []
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
    show_answer: Boolean,
    alone: Boolean
  },
  computed: {
    idxFormat: function() {
      let str = String(this.idx);
      for (let i = str.length; i < this.digit; i++) {
        str = '0' + str;
      }
      return str;
    }
  },
  created: function() {
    const wrap = [
      {input: this.x, output: this.formated_x},
      {input: this.y, output: this.formated_y}
    ];
    for (let i = 0; i < wrap.length; i++) {
      let target = wrap[i];
      let tempobj = {sentence: '', math: ''};
      let divider = 0;
      let out = true;
      let neglect = false;
      for (let j = 0; j < target.input.length; j++) {
        if (neglect) {
          neglect = false;
        }
        else if (target.input[j] === '$') {
          if (out) {
            if (divider !== j) {
              tempobj.sentence = target.input.slice(divider, j);
              divider = j;
            }
            out = false;
            neglect = true;
          }
          else {
            if (j === target.input.length - 1) {
              tempobj.math = target.input.slice(divider);
            }
            else if (target.input[j + 1] === '$') {
              if (j + 1 === target.input.length) {
                tempobj.math = target.input.slice(divider)
              }
              else {
                tempobj.math = target.input.slice(divider, j + 2);
                divider = j + 2;
                out = true;
              }
            }
            else {
              tempobj.math = target.input.slice(divider, j + 1);
              divider = j + 1;
              out = true;
            }
            target.output.push(tempobj);
            tempobj = {sentence: '', math: ''};
            neglect = true;
          }
        }
      }
      if (out) {
        tempobj.sentence = target.input.slice(divider);
        target.output.push(tempobj);
      }
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
  break-inside: avoid-page;
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
code {
  font-family: note monospace,SFMono-Regular,Consolas,Menlo,Courier,monospace;
  color: steelblue;
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
