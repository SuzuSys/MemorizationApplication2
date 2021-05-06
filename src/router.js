import Vue from 'vue';
import VueRouter from 'vue-router';
import Print from './views/Print.vue';
import Create from './views/Create.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/print',
    component: Print
  },
  {
    path: '/create',
    component: Create,
  }
];

const router = new VueRouter({
  routes,
  mode: 'history',
  scrollBehavior () {
    return { x: 0, y: 0 }
  }
});

export default router;