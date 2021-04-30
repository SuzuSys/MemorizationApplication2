<template>
  <div id="app">
    <div id="setting_button">
      <el-button 
        icon="el-icon-notebook-2"
        @click="drawer=true">
          Add Sheet
      </el-button>
    </div>
    <div id="answer_switch" v-show="exist_document">
      Answer:
      <el-switch @change="changedShowAnswer" v-model="show_answer" />
    </div>
    <el-drawer
      title="Add Sheet"
      :with-header="false"
      :visible.sync="drawer"
      :direction="direction"
      size="50%">
      <div id="setting">
        <el-divider content-position="left">Make Sheet</el-divider>
        <p>
          <el-switch
            v-model="temp.isextype"
            inactive-text="word test"
            active-text="explanation test"
            @change="show_label=false; disabled_add_button=true" />
        </p>
        <p>
          <el-cascader
            placeholder="Select Sheet"
            v-model="temp.sheet"
            :options="options"
            @change="browse_button=false; show_label=false; disabled_add_button=true" />
        </p>
        <p>
          <el-button 
            @click="makeLayer" 
            :disabled="browse_button" 
            size="mini"
            icon="el-icon-search"
            :loading="browse_loading">
              Browse available layers
          </el-button>
        </p>
        <div v-if="show_label">
          <el-row>
            <el-col :span="12">
              <el-select v-model="temp.layer" @change="disabled_add_button=false">
                <el-option
                  v-for="(item, index) in temp.available_layers"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                  :disabled="item.disabled" />
              </el-select>
            </el-col>
            <el-col :span="12" class="right">
              <el-button
                :disabled="disabled_add_button"
                icon="el-icon-bottom"
                @click="addSheet">
                  Add
              </el-button>
            </el-col>
          </el-row>
        </div>
        <el-divider content-position="left">Added Sheet</el-divider>
        <el-table :data="table_data" style="width:100%" empty-text="No Sheet" max-height="180">
          <el-table-column prop="content" label="Content" width="280" />
          <el-table-column prop="target" label="Target" width="100" />
          <el-table-column prop="layerlabel" label="Layer" width="70" />
          <el-table-column label="Operation" width="120">
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="deleteRow(scope.$index, table_data)"
                size="small"
                type="danger"
                plain>
                  Remove
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <p>
          Discriminated Title:
          <el-input v-model="title" placeholder="Type something" />
        </p>
        <el-row>
          <el-col :span="12">
            Shuffle: <el-switch v-model="shuffle" />
          </el-col>
          <el-col :span="12" class="right">
            <el-button
              icon="el-icon-right"
              @click="createDocument"
              v-loading.fullscreen.lock="fullscreen_loading"
              :disabled="disabled_create_button">
              Create Document
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-drawer>
    <div id="sheet">
      <div v-show="exist_document">
        <div id="sheet_type" :class="{sheet_type_answer: show_answer, sheet_type_question: !show_answer}">
          <code v-show="show_answer">Answer Sheet</code>
          <code v-show="!show_answer">Question Sheet</code>
        </div>
        <div id="title"><code>{{ title }}</code></div>
        <header>-Memorization Sheet-</header>
        <div class="information">
          <el-row>
            <el-col :span="3"><code>content:</code></el-col><el-col :span="21"><code>{{ first_content }}</code></el-col>
          </el-row>
          <el-row v-for="(item, index) in contents" :key="index">
            <el-col :offset="3" :span="21"><code>{{ item }}</code></el-col>
          </el-row>
          <el-row>
            <el-col :span="3"><code>shuffle:</code></el-col><el-col :span="21"><code>{{ shuffle }}</code></el-col>
          </el-row>
        </div>
        <div id="main" v-if="generate_questions">
          <Question v-for="(item, index) in questions" :key="index" :x="item.x" />
        </div>
      </div>
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
      direction: 'ltr',
      shuffle: false,
      temp: {
        sheet: [],
        url: '',
        isextype: false,
        available_layers: [],
        layer: "Select Layer"
      },
      browse_button: true,
      browse_loading: false,
      show_label: false,
      disabled_add_button: true,
      table_data: [],
      questions: [],
      exist_document: false,
      show_answer: false,
      fullscreen_loading: false,
      disabled_create_button: true,
      first_content: '',
      contents: [],
      title: '',
      generate_questions: false
    }
  },
  computed: {
    options () {
      return this.$store.state.linking
    }
  },
  methods: {
    makeLayer() {
      this.browse_loading = true;
      this.temp.available_layers = [];
      this.temp.layer = 'Select Layer';
      this.temp.url = '';
      for (let i = 0; i < this.temp.sheet.length; i++) {
        this.temp.url += this.temp.sheet[i].url + '/';
      }
      this.$store.dispatch('lookJson', this.temp.url).then(() => {
        let position = this.$store.state.temp.json;
        let history = [];
        let finish = false;
        let go_sibling = false;
        if (this.temp.isextype) {
          let exist_layer = [];
          while (!finish) {
            if (position.length !== 0 && !go_sibling) {
              history.push({arr: position, idx: 0});
              position = position[0].children;
              let endidx = history.length - 1;
              if (exist_layer.length - 1 < endidx) exist_layer.push(false);
              if (!exist_layer[endidx]) exist_layer[endidx] = !history[endidx].arr[0].isnumeric;
            }
            else {
              let end = history[history.length - 1]
              if (end.arr.length - 1 > end.idx) {
                end.idx++;
                position = end.arr[end.idx].children;
                let endidx = history.length - 1;
                if (!exist_layer[endidx]) {
                  exist_layer[endidx] = !(history[endidx].arr[history[endidx].idx].isnumeric);
                }
                go_sibling = false;
              }
              else {
                position = history.pop().arr;
                if (history.length === 0) finish = true;
                go_sibling = true;
              }
            }
          }
          for (let i = 0; i < exist_layer.length; i++) {
            this.temp.available_layers.push({
              value: i,
              label: 'Layer' + String(i + 1),
              disabled: !exist_layer[i]
            })
          }
        }
        else {
          let max_layer = 0;
          while (!finish) {
            if (position.length !== 0 && !go_sibling) {
              history.push({arr: position, idx: 0});
              position = position[0].children;
              if (max_layer < history.length) max_layer = history.length;
            }
            else {
              let end = history[history.length - 1]
              if (end.arr.length - 1 > end.idx) {
                end.idx++;
                position = end.arr[end.idx].children;
                go_sibling = false;
              }
              else {
                position = history.pop().arr;
                if (history.length === 0) finish = true;
                go_sibling = true;
              }
            }
          }
          for (let i = 0; i < max_layer; i++) {
            this.temp.available_layers.push({
              value: i,
              label: 'Layer' + String(i + 1),
              disabled: false
            });
          }
        }
        this.show_label = true;
        this.browse_loading = false;
      });
    },
    addSheet() {
      let layerlabel = 'Layer' + String(this.temp.layer + 1);
      this.table_data.push({
        content: this.temp.sheet[this.temp.sheet.length - 1].label,
        url: this.temp.url,
        target: this.temp.isextype ? 'explanation' : 'word',
        isextype: this.temp.isextype,
        layerlabel: layerlabel,
        layer: this.temp.layer
      });
      this.disabled_create_button = false;
    },
    deleteRow(index, rows) {
      rows.splice(index, 1);
      if (this.table_data.length === 0) {
        this.disabled_create_button = true;
      }
    },
    changedShowAnswer(show) {
      this.$store.commit('changedShowAnswer', show);
    },
    createDocument() {
      this.fullscreen_loading = true;
      this.drawer = false;
      this.first_content = this.table_data[0].content;
      this.contents = [];
      if (this.table_data.length > 1) {
        for (let i = 1; i < this.table_data.length; i++) {
          this.contents.push(this.table_data[i].content);
        }
      }
      this.generate_questions = false;
      this.$store.dispatch('createDocument', this.table_data).then(() => {
        this.$store.commit('shuffleQuestions');
        this.questions = this.$store.state.questions;
        this.exist_document = true;
        this.generate_questions = true;
        this.fullscreen_loading = false;
      });
    }
  }
};
</script>

<style>
@font-face {
  font-family: 'SevenSegment';
  src: url('../font/7 Segment.ttf') format('truetype');
}
header {
  text-align: center;
  font-family: SevenSegment;
  font-size: 5em;
}
#app {
  margin: 0px;
}
#sheet {
  position: relative;
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
#answer_switch {
  position:fixed;
  top: 20px;
  right: 20px;
  background-color: white;
  border-radius: 4px;
  padding: 9px 18px;
  color: #505050;
  font-size: 0.9em;
}
#setting {
  padding: 0px 20px;
  color: #505050;
}
.el-row:not(.information .el-row) {
  margin-top: 10px;
}
.right {
  text-align: right;
}
code {
  font-family: note monospace,SFMono-Regular,Consolas,Menlo,Courier,monospace;
  color: steelblue;
}
#sheet_type {
  position: absolute;
  top: 5px;
  right: 10px;
  display: inline-block;
  border-radius: 5px;
  padding: 3px 10px;
}
.sheet_type_question {
  background-color: #409EFF;
}
.sheet_type_answer {
  background-color: #67C23A;
}
#sheet_type code {
  color: white;
}
#title {
  position: absolute;
  top: 10px;
  left: 0px;
  width: 868px;
  text-align: center;
}
#title code {
  border-left: double black 10px;
  border-right: double black 10px;
  padding: 0px 10px;
  color: black;
}
@media print {
  #setting_button {
    display: none;
  }
  #setting {
    display: none;
  }
  #answer_switch {
    display: none;
  }
}
</style>
