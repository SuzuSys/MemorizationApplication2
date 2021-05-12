import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

import linking from './assets/linking.json'
import Methods from './api/methods'
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
    },
    emptyDocument (state) {
      state.questions = [];
    },
    shuffleQuestions (state) {
      let array = state.questions;
      for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
  },
  actions: {
    async lookJson (ctx, url) {
      await axios.get(url).then(res => ctx.commit('setTempJson', res.data));
    },
    async createDocument (ctx, table_data) {
      ctx.commit('emptyDocument');
      for (let i = 0; i < table_data.length; i++) {
        let td = table_data[i];
        await ctx.dispatch('createQuestion', {url: td.url, isextype: td.isextype, layer: td.layer});
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
                y: position.y,
                img: position.img,
                isextype: payload.isextype,
                x_class: position.x_class,
                y_class: position.y_class
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
    },
    async getData () {
      return await Methods.getNamesData();
    },
    async postData (ctx, data) {
      return await Methods.postNamesData(data);
    },
    async deleteData (ctx, id_obj) {
      return await Methods.deleteNamesData(id_obj);
    }
  }
})

export default store