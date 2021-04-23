<template>
  <div id="app">
    <div id="setting_button">
      <el-button 
        icon="el-icon-notebook-2"
        @click="drawer=true">
          Add Sheet
      </el-button>
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
        <el-table :data="table_data" style="width:100%" empty-text="No Sheet">
          <el-table-column prop="content" label="Content" width="300" />
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
        <el-row>
          <el-col :span="12">
            Shuffle: <el-switch v-model="shuffle" />
          </el-col>
          <el-col :span="12" class="right">
            <el-button icon="el-icon-right">
              Create Document
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-drawer>
    <div id="sheet">
      <Question formula="$x$"/>
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
      table_data: []
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
        type: this.temp.isextype,
        layerlabel: layerlabel,
        layer: this.temp.layer
      });
    },
    deleteRow(index, rows) {
      rows.splice(index, 1);
    }
  }
};
</script>

<style>
#app {
  margin: 0px;
}
#sheet {
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
#setting {
  padding: 0px 20px;
  color: #505050;
}
.el-row {
  margin-top: 10px;
}
.right {
  text-align: right;
}
@media print {
  #setting_button {
    display: none;
  }
  #setting {
    display: none;
  }
}
</style>
