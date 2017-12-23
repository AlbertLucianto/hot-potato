import Vue from 'vue';
import Router from 'vue-router';
import LoginPage from '@/components/LoginPage';
import NewPotato from '@/components/NewPotato';
import ReceivedPage from '@/components/ReceivedPage';
import SentPage from '@/components/SentPage';

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
    component: NewPotato,
  },
  {
    path: '/received',
    name: 'Received',
    component: ReceivedPage,
  },
  {
    path: '/sent',
    name: 'Sent',
    component: SentPage,
  },
];

routes.forEach((route, idx) => { routes[idx].props = { idx }; });

export { routes };

export default new Router({
  routes,
});
