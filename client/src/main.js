// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';

import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import VueApollo from 'vue-apollo';

import App from './App';
import router from './router';
import configs from '../config/apollo.config';

Vue.config.productionTip = false;

const httpLink = createHttpLink(configs);

const middlewareLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('AUTH_TOKEN');
  operation.setContext({
    headers: {
      Authorization: token ? `Bearer ${token}` : null,
    },
  });
  return forward(operation);
});

const link = middlewareLink.concat(httpLink);

const apolloClient = new ApolloClient({
  link,
  /* eslint-disable no-underscore-dangle */
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
  connectToDevTools: true,
});

Vue.use(VueApollo);

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  clients: {
    main: apolloClient,
  },
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  apolloProvider,
  router,
  template: '<App/>',
  components: { App },
});
