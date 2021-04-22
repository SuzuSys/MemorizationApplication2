import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

import linking from './assets/linking.json'
const store = new Vuex.Store({
  state: {
    linking: linking,
    temp: {
      json: {}
    }
  },
  mutations: {
    setTempJson (state, payload) {
      state.temp.json = payload;
    }
  },
  actions: {
    async lookJson (ctx, url) {
      await axios.get(url).then(res => ctx.commit('setTempJson', res.data));
    }
  }
})

export default store