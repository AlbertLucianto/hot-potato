<template>
  <div id="app">
    <div class="routerComponent__container">
      <div class="fork__tag" @click="openGithub">
        <img :src="githubIcon" class="github__icon"/>
        <div class="fork__description">Fork me on GitHub</div>
      </div>
      <router-view :userId="loggedInUser ? loggedInUser.id : null"/>
      <revolver-nav/>
    </div>
  </div>
</template>

<script>
import 'animate.css';
import gql from 'graphql-tag';

import RevolverNav from '@/components/RevolverNav';

const GITHUB_REPO = 'https://github.com/AlbertLucianto/hot-potato';
const GITHUB_ICON = 'https://image.flaticon.com/icons/svg/25/25231.svg';

export default {
  name: 'app',
  components: {
    RevolverNav,
  },
  data() {
    return {
      githubIcon: GITHUB_ICON,
    };
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
    openGithub() {
      window.open(GITHUB_REPO);
    },
  },
};
</script>

<style lang="scss">
body {
  background-color: #556;
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
  .fork__tag {
    position: fixed;
    z-index: 100;
    top: 20px;
    right: -35px;
    width: 150px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 2px;
    background-color: #AAB;
    box-shadow: 0 5px 15px -5px rgba(0,0,0,.5);
    transform: rotate(45deg);
    transition: background-color .5s ease;
    .github__icon {
      width: 20px;
    }
    @media screen and (max-width: 414px) {
      top: 5px;
      right: -52.5px;
      .fork__description {
        display: none;
      }
    }
    @media screen and (min-width: 414px) {
      .fork__description {
        position: absolute;
        bottom: -20px;
        color: white;
        opacity: 0;
        font-weight: 500;
        transition: all .2s ease;
        pointer-events: none;
        z-index: 0;
      }
      &:hover {
        transition: background-color .2s ease;
        background-color: #CCD;
        cursor: pointer;
        .fork__description {
          opacity: .7;
          bottom: -30px;
        }
      }
    }
  }
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
