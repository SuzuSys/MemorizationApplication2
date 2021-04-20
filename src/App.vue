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
            v-model="temp.extype"
            inactive-text="word test"
            active-text="explanation test" />
        </p>
        <p>
          <el-cascader
            placeholder="Select Sheet"
            v-model="temp.url"
            :options="options"
            @change="browse_button=false" />
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
        <div v-show="show_label">

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
        layer: []
      },
      browse_button: true,
      browse_loading: false,
      show_label: false,
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
      this.$store.dispatch('lookJson', this.temp.url.join(''));
      this.browse_loading = false;
    },
    add_sheet() {

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
@media print {
  #setting_button {
    display: none;
  }
  #setting {
    display: none;
  }
}
</style>
