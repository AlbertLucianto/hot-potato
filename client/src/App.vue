<template>
  <div id="app">
    <div class="routerComponent__container">
      <router-view :userId="loggedInUser ? loggedInUser.id : null"/>
      <revolver-nav/>
    </div>
  </div>
</template>

<script>
import 'animate.css';
import gql from 'graphql-tag';

import RevolverNav from '@/components/RevolverNav';

export default {
  name: 'app',
  components: {
    RevolverNav,
  },
  apollo: {
    loggedInUser() {
      return {
        query: gql`query isUserLoggedIn {
          loggedInUser {
            id
          }
        }`,
        result() {},
        fetchPolicy: 'cache-and-network',
      };
    },
  },
  methods: {
  },
};
</script>

<style lang="scss">
body {
  background-color: #445;
  margin: 0;
}
input, button {
  -webkit-appearance: none;
  outline: none;
  border: none;
  background: transparent;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.routerComponent__container {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  width: 414px;
  height: 736px;
  background: #FFF;
  border-radius: 15px;
  box-shadow: 0 20px 50px -25px rgba(0,0,0,.2);
  overflow: hidden;
  @media screen and (max-width: 414px) {
    border-radius: 0;
  }
}
</style>
