<template>
  <div id="entire">
    <el-divider></el-divider>
    <el-row>
      <el-col :span="digit + 1">
        <span class="digital"><span v-for="(char, index) in idxFormat" :key="index" class="digital_number">{{char}}</span>.</span>
      </el-col>
      <el-col :span="23 - digit">
        <code>question: {{ isextype ? x_class : y_class }}, answer: {{ isextype ? y_class : x_class }}</code>
      </el-col>
    </el-row>
    <el-row>
      <el-col :offset="1" :span="23">
        <el-row>
          <el-col class="question" :span="24">
            <span v-for="(item, index) in (isextype ? formated_x : formated_y)" :key="index">
              <span v-if="item.sentence.if" v-html="item.sentence.content"></span>
              <vue-mathjax v-if="item.math.if" :formula="item.math.content"></vue-mathjax>
              <div v-if="item.img.if" :style="imgFormat(item.img.position)">
                <img :src="item.img.url" :style="{width: (item.img.width + 'px')}">
              </div>
            </span>
          </el-col>
        </el-row>
        <el-row v-show="show_answer">
          <el-col class="answer" :span="24">
            <span v-for="(item, index) in (isextype ? formated_y : formated_x)" :key="index">
              <span v-if="item.sentence.if" v-html="item.sentence.content"></span>
              <vue-mathjax v-if="item.math.if" :formula="item.math.content"></vue-mathjax>
              <div v-if="item.img.if" :style="imgFormat(item.img.position)">
                <img :src="item.img.url" :style="{width: (item.img.width + 'px')}">
              </div>
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
import Database from '../apicreate'
export default {
  components: {
    'vue-mathjax': VueMathjax
  },
  name: 'Question',
  data () {
    return {
      formated_x: [],
      formated_y: [],
      blobUrl: {}
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
    alone: Boolean,
    carryImg: Boolean,
    id: String,
    img: Array,
    blob: Object
  },
  computed: {
    idxFormat: function() {
      let str = String(this.idx);
      for (let i = str.length; i < this.digit; i++) {
        str = '0' + str;
      }
      return str;
    },
    imgFormat: function() {
      return function(pos) {
        const obj = {};
        if (pos === 1 || pos === 2 || pos === 3) {
          obj.display = 'block';
          const rcl = ['left', 'center', 'right'];
          obj['text-align'] = rcl[pos-1];
        }
        else {
          obj.display = 'inline';
        }
        return obj;
      }
    }
  },
  created: async function() {
    if (this.carryImg) {
      let key, result;
      const obj = {id: this.id};
      for (let i = 0; i < this.img.length; i++) {
        key = 'F_' + this.img[i].split('.')[0];
        obj.filename = this.img[i];
        result = await Database.Blob().get('/getImage', {params: obj});
        this.blobUrl[key] = window.URL.createObjectURL(result.data);
      }
    }
    else {
      this.blobUrl = this.blob;
    }
    let splited, cmd, urlkey, width, temp;
    const re = /(%{.+?\|\d+?}|\$\$.+?\$\$|\$.+?\$)/;
    const mathre = /(\$\$.+?\$\$|\$.+?\$)/;
    const imgre = /%{.+?\|\d+?}/;
    const wrap = [
      {input: this.x, output: this.formated_x},
      {input: this.y, output: this.formated_y}
    ];
    for (let i = 0; i < wrap.length; i++) {
      wrap[i].input = wrap[i].input.replace(/\r?\n/g, '');
      splited = wrap[i].input.split(re);
      for (let j = 0; j < splited.length; j++) {
        if (splited[j] !== '') {
          temp = {
            img: {if: false, url: '', width: '', position: 0},
            math: {if: false, content: ''},
            sentence: {if: false, content: ''}
          };
          if (mathre.test(splited[j])) {
            temp.math.if = true;
            temp.math.content = splited[j];
          }
          else if (imgre.test(splited[j])) {
            temp.img.if = true;
            cmd = splited[j].slice(2, -1).split('|');
            [urlkey, width] = cmd;
            temp.img.url = this.blobUrl[urlkey];
            temp.img.width = width.slice(0, -1);
            temp.img.position = Number(width.slice(-1));
          }
          else {
            temp.sentence.if = true;
            temp.sentence.content = splited[j];
          }
          wrap[i].output.push(temp);
        }
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
