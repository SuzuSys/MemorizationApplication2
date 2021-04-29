import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

import linking from './assets/linking.json'
const store = new Vuex.Store({
  state: {
    linking: linking,
    temp: {
      json: []
    },
    questions: [],
    show_answer: false,
    interior_temp: {
      json: []
    }
  },
  mutations: {
    setTempJson (state, payload) {
      state.temp.json = payload;
    },
    changedShowAnswer (state, show_answer) {
      state.show_answer = show_answer;
    },
    setInteriorTempJson (state, payload) {
      state.interior_temp.json = payload;
    },
    appendDocument (state, payload) {
      state.questions.push(payload);
    }
  },
  actions: {
    async lookJson (ctx, url) {
      await axios.get(url).then(res => ctx.commit('setTempJson', res.data));
    },
    async createDocument (ctx, table_data) {
      for (let i = 0; i < table_data.length; i++) {
        let td = table_data[i]
        await ctx.dispatch('createQuestion', {url: td.url, isextype: td.isextype, layer: td.layer});
        console.log(i)
      }
    },
    async createQuestion (ctx, payload) {
      await ctx.dispatch('returnJson', payload.url).then(() => {
        let position = ctx.state.interior_temp.json[0];
        let history = [{arr: ctx.state.interior_temp.json, idx: 0},]
        let finish = false;
        let move = false;
        let go_sibling = false;
        while (!finish) {
          if (history.length - 1 === payload.layer && !move) {
            if (!(position.isnumeric && payload.isextype)) {
              ctx.commit('appendDocument', {
                x: position.x,
                explanation: position.explanation,
                img: position.img,
                isextype: payload.isextype
              });
            }
            move = true;
          }
          else {
            if (history.length - 1 < payload.layer && position.children.length > 0 && !go_sibling) {
              history.push({arr: position.children, idx: 0});
              position = position.children[0]
            }
            else {
              let lastelem = history[history.length - 1];
              if (lastelem.arr.length - 1 !== lastelem.idx) {
                lastelem.idx++;
                position = lastelem.arr[lastelem.idx];
                go_sibling = false;
              }
              else {
                history.pop();
                if (history.length === 0) break;
                position = history[history.length - 1].arr[history[history.length - 1].idx];
                go_sibling = true;
              }
            }
            move = false;
          }
        }
      });
    },
    async returnJson (ctx, url) {
      await axios.get(url).then(res => ctx.commit('setInteriorTempJson', res.data));
    }
  }
})

export default store