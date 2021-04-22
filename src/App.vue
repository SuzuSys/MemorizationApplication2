<template>
  <div id="app">
    <div id="setting_button">
      <el-button 
        icon="el-icon-notebook-2" @click="drawer=true">Add Sheet</el-button>
    </div>
    <el-drawer
      title="Add Sheet"
      :visible.sync="drawer"
      :direction="direction">
      <div id="setting">
        <p>Shuffle: <el-switch v-model="shuffle" /></p>
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
            v-model="temp.url"
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
          <el-select v-model="temp.layer" @change="disabled_add_button=false">
            <el-option
              v-for="(item, index) in temp.available_layers"
              :key="index"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled" />
          </el-select>
          <p id="add_button">
            <el-button
              :disabled="disabled_add_button"
              icon="el-icon-bottom"
              @click="addSheet">
                Add
            </el-button>
          </p>
        </div>

        <el-divider content-position="left">Added Sheet</el-divider>
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
        isextype: false,
        url: [],
        available_layers: [],
        layer: "Select Layer"
      },
      browse_button: true,
      browse_loading: false,
      show_label: false,
      disabled_add_button: true
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
      this.$store.dispatch('lookJson', this.temp.url.join('')).then(() => {
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
      console.log(this.temp.layer);
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
#add_button {
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
