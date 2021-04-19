import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import linking from './assets/json/linking.json'
const store = new Vuex.Store({
  state: {
    linking: linking
  }
})

export default store