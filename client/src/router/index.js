import Vue from 'vue';
import Router from 'vue-router';
import LoginPage from '@/components/LoginPage';

Vue.use(Router);

const routes = [
  {
    path: '/account',
    name: 'Account',
    component: LoginPage,
  },
  {
    path: '/new',
    name: 'New Potato',
    component: LoginPage,
  },
  {
    path: '/received',
    name: 'Received',
    component: LoginPage,
  },
  {
    path: '/sent',
    name: 'Sent',
    component: LoginPage,
  },
];

routes.forEach((route, idx) => { routes[idx].props = { idx }; });

export { routes };

export default new Router({
  routes,
});
