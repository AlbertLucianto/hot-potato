<template>
<div class="newPotatoPage__container">
  <div class="heat__wrapper">
    <div class="heat__gradient" :style="gradientStyle"/>
  </div>
  <transition
    enter-active-class="animated bounceIn potatoAnimate"
    leave-active-class="animated bounceOut">
    <potato-animate v-if="showPotato" :class="{ blur: searching }"/>
  </transition>
  <temperature-setting :setTemperature="setTemperature" :class="{ blur: searching }"/>
  <div class="overlaySearching" v-if="searching">
    <div class="searchResults" v-if="search">
      <div class="result__item" v-for="resultItem in allUsers" :key="resultItem.id" @click="selectUser(resultItem)">
        <div class="resultItem resultItem__name">{{ resultItem.name }}</div>
        <div class="resultItem resultItem__email">{{ resultItem.email }}</div>
      </div>
      <img class="loadingIcon" src="../../assets/SVG/loading-cylon.svg" v-if="loading"/>
    </div>
  </div>
  <div class="input__wrapper" :class="{ searching, selected: !!selectedUser  }">
    <img class="cancel__button" src="../../assets/SVG/cross_dark.svg" v-if="searching" @click="cancelSearch"/>
    <input v-model="search" placeholder="Whom to pass?" :class="{ searching }" @focus="setSearching"/>
    <div class="selectedUser__email" v-if="selectedUser && !searching">{{ selectedUser.email }}</div>
  </div>
</div>
</template>

<script>
import gql from 'graphql-tag';

import PotatoAnimate from './PotatoAnimate';
import TemperatureSetting from './TemperatureSetting';

const SEARCH_PAGE_SIZE = 5;
const TYPING_TIMEOUT_TIME = 300;

export default {
  components: {
    PotatoAnimate,
    TemperatureSetting,
  },
  data() {
    return {
      showPotato: false,
      temperature: 0,
      searching: false,
      search: '',
      loading: 0,
      typing: false,
      typingTimeout: undefined,
      selectedUser: undefined,
    };
  },
  computed: {
    gradientStyle() {
      return {
        opacity: this.temperature / 200,
      };
    },
  },
  watch: {
    search() {
      clearTimeout(this.typingTimeout);
      this.typing = true;
      this.typingTimeout = setTimeout(() => {
        this.typing = false;
      }, TYPING_TIMEOUT_TIME);
    },
  },
  apollo: {
    $loadingKey: 'loading',
    allUsers() {
      return {
        query: gql`query getUser($contain: String!, $pageSize: Int!) {
          allUsers(
            filter: { name_contains: $contain },
            first: $pageSize
          ) {
            id
            name
            email
          }
        }`,
        variables() { // Using function for reactive search attribute
          return {
            contain: this.search,
            pageSize: SEARCH_PAGE_SIZE,
          };
        },
        skip() {
          return !this.search || this.typing;
        },
        fetchPolicy: 'cache-first', // Because user results is unlikely to change
        result(data) {
          /* eslint-disable no-console */
          console.log(data);
        },
      };
    },
  },
  methods: {
    setTemperature(val) { this.temperature = val; },
    setSearching() { this.searching = true; },
    cancelSearch() {
      this.searching = false;
      this.search = '';
      this.selectedUser = undefined;
    },
    selectUser(user) {
      this.selectedUser = user;
      this.search = user.name;
      this.searching = false;
    },
  },
  mounted() {
    this.showPotato = true;
  },
};
</script>

<style lang="scss" scoped>
$pink: rgb(255,45,85);
$red: rgb(255,59,48);
$purple: rgb(88,86,214);
$orange: rgb(255,149,0);
$darkOrange: rgb(245,140,0);

div {
  box-sizing: border-box;
}
.newPotatoPage__container {
  height: 100%;
  width: 100%;
  padding: 50px;
  background: #232222;
  display: flex;
  justify-content: center;
  align-items: center;
  .heat__wrapper {
    animation: heat 5s ease alternate infinite;
    position: absolute;
    height: 100%;
    width: 100%;
    .heat__gradient {
      height: 100%;
      width: 100%;
      transition: opacity .8s ease;
      background: linear-gradient(10deg, #232222 20%, $pink 150%);
    }
  }
  .potatoAnimate {
    animation-duration: .6s;
  }
  .input__wrapper {
    position: absolute;
    width: 60%;
    height: 50px;
    top: 60px;
    left: 20%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    border-radius: 5px;
    transition: all .1s ease;
    user-select: none;
    &.searching {
      top: 0;
      height: 75px;
      width: 100%;
      left: 0;
      border-top-left-radius: 15px;
      border-top-right-radius: 15px;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
      user-select: unset;
    }
    &.selected {
      box-shadow: 0 0 20px -5px $orange;
      input {
        color: $darkOrange;
      }
    }
    input {
      text-align: center;
      width: 60%;
      flex-grow: 1;
      margin-top: -2.5px;
      height: 30px;
      font-size: 1.5rem;
      font-weight: 300;
      &.searching {
        margin-right: 60px;
        margin-top: 0;
      }
      &::placeholder {
        font-size: 1rem;
        user-select: none;
      }
    }
    .cancel__button {
      width: 17.5px;
      margin: 0 20px;
      opacity: .8;
      transition: opacity .2s ease;
      &:hover {
        opacity: .9;
        cursor: pointer;
      }
    }
    .selectedUser__email {
      position: absolute;
      bottom: -30px;
      font-size: .9rem;
      font-weight: 300;
      color: white;
    }
  }
  .overlaySearching {
    position: absolute;
    height: 100%;
    width: 100%;
    border-radius: 15px;
    background-color: rgba(255,255,255,.8);
  }
  .blur {
    filter: blur(20px);
  }
  .searchResults {
    margin-top: 100px;
    .result__item {
      margin: 0 10px;
      padding: 10px;
      text-align: left;
      border: 1px solid rgba(0,0,0,0);
      border-bottom: 1px solid rgba(0,0,0,.1);
      transition: border .2s ease;
      .resultItem {
        margin: 5px;
        &__name {
          font-weight: 600;
        }
        &__email {
          color: $darkOrange;
        }
      }
      &:hover {
        border: 1px solid $orange;
        border-radius: 5px;
        box-shadow: 0 5px 20px -5px rgba(0,0,0,.1);
        background-color: rgba(255,255,255,.8);
        cursor: pointer;
        &:active {
          background: white;
        }
      }
    }
    .loadingIcon {
      margin-top: 30px;
      width: 100px;
    }
  }
}

@keyframes heat {
  100% {
    opacity: .5;
  }
}
</style>
