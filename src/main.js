import Vue from 'vue'
import App from './App.vue';
import router from './router'
import store from './store.js'
import ElementUI from 'element-ui';
require('element-ui/lib/theme-chalk/index.css');

Vue.config.productionTip = false;
Vue.use(ElementUI);

let vm = new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');

document.body.onbeforeprint = function() {
  if (vm.$route.fullPath === '/print') {
    window.alert('ドキュメントを下までスクロールしてしばらく待たないと数式が読み込まれない可能性があります。\nまた、印刷設定では品質維持のため次の設定をユーザが行う必要があります。\n - 用紙はA4で、拡大率を100%に設定する。(規定値)\n - 各ページの余白を左右0mm,上下5mmに設定する。\n - 背景のグラフィックスを表示する。');
  }
}