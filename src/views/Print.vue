<template>
  <div id="app">
    <div id="top_left_ui">
      <el-button 
        icon="el-icon-notebook-2"
        @click="drawer = true">
          Create Document
      </el-button>
    </div>
    <div id="bottom_left_ui">
      <el-button
        econ="el-icon-d-arrow-left"
        @click="goTop">
          Top Page
      </el-button>
    </div>
    <div id="top_right_ui" v-show="exist_document">
      <div id="answer_switch">
        Answer:
        <el-switch v-model="show_answer"></el-switch>
      </div>
    </div>
    <div id="bottom_right_ui" v-show="exist_document">
      <el-button
        icon="el-icon-check"
        @click="documentPrint"
        type="primary">
          Print
      </el-button>
    </div>
    <el-drawer
      title="Create Document"
      :with-header="false"
      :visible.sync="drawer"
      :direction="'ltr'"
      size="50%">
        <div id="setting">
          <el-row>
            <el-col :span="24">
              <span class="section">Make Sheet</span>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form
                ref="making_sheet"
                :model="making_sheet"
                label-width="100px"
                size="medium">
                  <el-form-item label="Directory">
                    <el-cascader
                      placeholder="Select Directory"
                      :options="directory_tree"
                      :props="directory_tree_props"
                      :show-all-levels="false"
                      @change="handleChangeDirectory">
                    </el-cascader>
                  </el-form-item>
                  <el-form-item label="Test Mode">
                    <el-switch
                      :disabled="!(making_sheet.directory_label !== '')"
                      v-model="making_sheet.isextype"
                      inactive-text="word(x) test"
                      active-text="explanation(y) test"
                      @change="makeLayer">
                    </el-switch>
                  </el-form-item>
                  <el-form-item label="Layer">
                    <el-select
                      placeholder="Select"
                      v-model="making_sheet.layer_value"
                      :disabled="!making_sheet.show_layer">
                        <el-option
                          v-for="(item, index) in cell_layer"
                          :key="index"
                          :label="item.label"
                          :value="{label: item.label, cells: item.value}"
                          :disabled="item.disabled">
                        </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button
                      type="primary"
                      @click="addSheet"
                      icon="el-icon-plus"
                      :disabled="making_sheet.layer_value === ''">
                        Add Sheet
                    </el-button>
                  </el-form-item>
              </el-form>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <span class="section">Added Sheet</span>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-table :data="table" style="width:100%" empty-text="No Sheet" max-height="150">
                <el-table-column prop="directory" label="Directory"></el-table-column>
                <el-table-column prop="test_target" label="Test Target" width="120"></el-table-column>
                <el-table-column prop="label" label="Layer" width="70"></el-table-column>
                <el-table-column label="Operatioin" width="120">
                  <template slot-scope="scope">
                    <el-button
                      @click.native.prevent="deleteRow(scope.$index, table)"
                      size="small"
                      type="danger"
                      plain>
                        Remove
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <span class="section">Other Setting</span>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form
                ref="other_setting"
                :model="other_setting"
                label-width="80px"
                size="medium">
                  <el-form-item label="Title">
                    <el-input v-model="other_setting.title"></el-input>
                  </el-form-item>
                  <el-form-item label="Shuffle">
                    <el-switch v-model="other_setting.shuffle"></el-switch>
                  </el-form-item>
              </el-form>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8" :offset="16">
              <el-button
                :disabled="!can_create_document"
                icon="el-icon-arrow-right"
                @click="createDocument"
                type="primary">
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
        <div id="title"><code>{{ other_setting.title }}</code></div>
        <header>-Memorization Sheet-</header>
        <div class="information">
          <el-row type="flex" justify="center">
            <el-col :span="20" >
              <el-table :data="table" style="width:100%" empty-text="No Sheet">
                <el-table-column prop="directory" label="Directory"></el-table-column>
                <el-table-column prop="test_target" label="Test Target" width="140"></el-table-column>
                <el-table-column prop="label" label="Layer" width="70"></el-table-column>
              </el-table>
            </el-col>
          </el-row>
          <el-row type="flex" justify="center">
            <el-col :span="20">
              <code>Shuffle: {{ other_setting.shuffle }}</code>
            </el-col>
          </el-row>
        </div>
        <div id="main">
          <Question 
            v-for="(item, index) in questions"
            :key="index"
            :idx="index"
            :digit="String(questions.length).length"
            :x="item.x"
            :y="item.y"
            :x_class="item.x_class"
            :y_class="item.y_class"
            :isextype="item.isextype"
            :show_answer="show_answer"
            :alone="false"/>
          <el-divider></el-divider>
        </div>
        <div id="footer">
          <div id="logo_container">
            <img src="@/assets/logoprint.svg" width="250" height="250" alt="">
            <p>made with <span id="appname">Memorization Application</span></p>
            <p id="url">https://github.com/SuzuSys/MemorizationApplication2</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Database from '../apicreate'
import Question from '../components/Question'
export default {
  name: 'Print',
  components: {
    Question
  },
  data() {
    return {
      drawer: false,
      exist_document: false,
      show_answer: false,

      directory_tree: [],
      cell_layer: [],
      table: [],
      can_create_document: false,
      questions: [],
      directory_tree_props: {
        label: 'label',
        children: 'children',
        disabled: 'isnotleaf',
        checkStrictly: true
      },
      making_sheet: {
        directory_id: '',
        directory_label: '',
        isextype: false,
        show_layer: false,
        layer_value: ''
      },
      other_setting: {
        title: '',
        shuffle: false
      }
    }
  },
  methods: {
    handleChangeDirectory(data) {
      let obj = data[data.length - 1];
      this.making_sheet.directory_id = obj._id;
      this.making_sheet.directory_label = obj.name;
      this.makeLayer();
    },
    makeLayer() {
      this.making_sheet.show_layer = false;
      this.making_sheet.layer_value = '';
      const obj = { 
        parentDirectory: this.making_sheet.directory_id,
        isextype: this.making_sheet.isextype
      };
      Database.Base().get('/getCellLayer', {params: obj}).then(result => {
        this.cell_layer = result.data;
        this.making_sheet.show_layer = true;
      });
    },
    addSheet() {
      let obj = {
        cells: this.making_sheet.layer_value.cells,
        directory: this.making_sheet.directory_label,
        isextype: this.making_sheet.isextype,
        test_target: (this.making_sheet.isextype ? 'explanation(y)' : 'word(x)'),
        label: this.making_sheet.layer_value.label
      };
      this.table.push(obj);
      this.can_create_document = true;
    },
    deleteRow(index, rows) {
      rows.splice(index, 1);
      if (this.table.length === 0) {
        this.can_create_document = false;
      }
    },
    createDocument() {
      let arr = [];
      for (let i = 0; i < this.table.length; i++) {
        for (let j = 0; j < this.table[i].cells.length; j++) {
          this.table[i].cells[j].isextype = this.table[i].isextype;
          arr.push(this.table[i].cells[j]);
        }
      }
      if (this.other_setting.shuffle) {
        for (let i = arr.length - 1; i >= 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      this.questions = arr;
      this.drawer = false;
      this.exist_document = true;
    },
    goTop() {
      if (this.exist_document) {
        if (window.confirm('ドキュメント内容は保存されませんがよろしいですか？')) {
          this.$router.push({ path: '/' });
        }
      }
      else {
        this.$router.push({ path: '/' });
      }
    },
    documentPrint() {
      window.print();
    }
  },
  created: async function() {
    this.directory_tree = (await Database.Base().get('/getDirectoryTree')).data;
  }
}
</script>

<style scoped>
@font-face {
  font-family: 'SevenSegment';
  src: url('../../font/7 Segment.ttf') format('truetype');
}
#app {
  margin: 8px 0px;
}
#top_left_ui {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 140px;
  text-align: center;
}
#top_right_ui {
  position:fixed;
  top: 20px;
  right: 20px;
  width: 140px;
  text-align: center;
}
#answer_switch {
  background-color: white;
  border-radius: 4px;
  padding: 10px 18px;
  color: #505050;
  font-size: 0.9em;
}
#bottom_left_ui {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 140px;
  text-align: center;
}
#bottom_right_ui {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 140px;
  text-align: center;
}
#answer_switch {
  background-color: white;
  border-radius: 4px;
  padding: 10px 18px;
  color: #505050;
  font-size: 0.9em;
}
#setting {
  padding: 10px 20px;
  color: #505050;
}
.section {
  font-size: 1.3em;
}
.el-form-item {
  margin-bottom: 5px;
}
.el-row:not(#main .el-row) {
  margin-bottom: 10px;
}
#sheet {
  position: relative;
  width: calc(793px - 2 * 10mm);
  margin: auto;
  background-color: white;
  padding: 10mm;
}
#sheet_type {
  position: absolute;
  top: 5px;
  right: 20px;
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
  top: 5px;
  left: 0px;
  width: 630px;
  text-align: center;
}
#title code {
  border-left: double black 10px;
  border-right: double black 10px;
  padding: 0px 10px;
  color: black;
}
header {
  text-align: center;
  font-family: SevenSegment;
  font-size: 4.5em;
  margin-top: 15px;
}
code {
  font-family: note monospace,SFMono-Regular,Consolas,Menlo,Courier,monospace;
  color: steelblue;
}
.information .el-table-column {
  font-family: note monospace,SFMono-Regular,Consolas,Menlo,Courier,monospace;
}
.information code {
  display: block;
  width: 100%;
  text-align: center;
  color: #606266;
}
#logo_container {
  display: inline-block;
  position: relative;
  width: calc(793px - 2 * 10mm);
  height: 140px;
}
#logo_container img {
  position: absolute;
  top: -50px;
  left: 0px;
}
#logo_container p:not(#url) {
  position: absolute;
  top: 25px;
  left: 250px;
  font-size: 1.5em;
  font-family: serif;
}
#logo_container #appname {
  font-size: 1.2em;
  font-variant: small-caps;
  font-weight: bold;
}
#logo_container #url {
  position: absolute;
  top: 70px;
  left: 250px;
  font-family: note monospace,SFMono-Regular,Consolas,Menlo,Courier,monospace;
  font-size: 1em;
  text-decoration: underline;
}
@media print {
  #app {
    margin: 0px;
    padding: 0px;
  }
  #top_left_ui {
    display: none;
  }
  #top_right_ui {
    display: none;
  }
  #bottom_left_ui {
    display: none;
  }
  #bottom_right_ui {
    display: none;
  }
}
</style>