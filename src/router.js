import Vue from 'vue';
import VueRouter from 'vue-router';
import Print from './views/Print.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/print', component: Print }
];

const router = new VueRouter({
  routes,
  mode: 'history'
});

export default router;