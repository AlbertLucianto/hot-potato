import Vue from 'vue';
import Router from 'vue-router';
import AccountPage from '@/components/AccountPage';
import NewPotato from '@/components/NewPotato';
import ReceivedPage from '@/components/ReceivedPage';
import SentPage from '@/components/SentPage';
import HallOfShame from '@/components/HallOfShame';

Vue.use(Router);

const mainRoutes = [
  {
    path: '/account',
    name: 'Account',
    component: AccountPage,
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
  {
    path: '/leaderboard',
    name: 'Hall of Shame',
    component: HallOfShame,
  },
];

const redirects = [
  {
    path: '/',
    redirect: '/account',
  },
];

mainRoutes.forEach((route, idx) => { mainRoutes[idx].props = { idx }; });

const routes = [...redirects, ...mainRoutes];

export { mainRoutes as routes };

export default new Router({
  routes,
});
