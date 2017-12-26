<template>
<div class="newPotatoPage__container" ref="container">
  <div class="account__notification" :class="{ show: notification }">{{ notification }}</div>
  <div class="heat__wrapper">
    <div class="heat__gradient" :style="gradientStyle"/>
  </div>
  <img class="drag__guide" v-if="!!selectedUser" src="../../assets/SVG/loading-bubbles.svg"/>
  <transition
    enter-active-class="animated bounceIn potatoAnimate">
    <potato-animate v-if="showPotato" :class="{ blur: searching }" :passPosition="passPosition"
      :send="deployAndPassPotato" :canSend="!!selectedUser" :remindInput="emphasizeSearchInput"/>
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
  <div class="input__wrapper" :class="{ searching, selected: !!selectedUser, emphasized, jerked: !!notification }">
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
const PASS_TRESHOLD = 100;
const NOTIFICATION_DURATION = 3000;

const temperatureToDuration = temp => parseInt((320 - temp) / 10, 10);

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
      passPosition: 0,
      emphasized: false,
      notification: '',
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
          console.log(data); // eslint-disable-line no-console
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
    deployAndPassPotato() {
      if (this.loading) return;
      this.loading += 1;
      this.$apollo.mutate({
        mutation: gql`mutation createPotato($duration: Int!) {
          deployPotato(duration: $duration) {
            id
          }
        }`,
        variables: {
          duration: temperatureToDuration(this.temperature),
        },
      }).then((resDeploy) => {
        this.loading -= 1;
        console.log(resDeploy);
        const potatoId = resDeploy.data.deployPotato.id;
        this.showPotato = false;
        this.$apollo.mutate({
          mutation: gql`mutation sendPotato($potatoId: ID!, $receiverId: ID!) {
            passPotato(potatoId: $potatoId, receiverId: $receiverId) {
              id
            }
          }`,
          variables: {
            potatoId,
            receiverId: this.selectedUser.id,
          },
        }).then((resPass) => {
          this.showPotato = true;
          this.notification = `New potato successfully sent to ${this.selectedUser.name}`;
          setTimeout(() => {
            this.notification = '';
          }, NOTIFICATION_DURATION);
          this.selectedUser = undefined;
          this.search = '';
          console.log(resPass);
        }).catch((passErr) => {
          console.log(passErr); // eslint-disable-line no-console
          const messageAr = passErr.message.split('error: ');
          this.notification = messageAr[2];
        });
      }).catch((deployErr) => {
        console.log(deployErr); // eslint-disable-line no-console
        this.loading -= 1;
        const messageAr = deployErr.message.split('error: ');
        this.notification = messageAr[2];
      });
    },
    emphasizeSearchInput() {
      this.emphasized = true;
      setTimeout(() => {
        this.emphasized = false;
      }, 200);
    },
  },
  mounted() {
    this.showPotato = true;
    this.$nextTick(() => {
      this.passPosition = this.$refs.container.getBoundingClientRect().top + PASS_TRESHOLD;
    });
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
  padding: 60px;
  background: #232222;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  flex-direction: column;
  .account__notification {
    position: absolute;
    top: -50px;
    padding: 20px;
    left: calc(50% - 150px);
    width: 300px;
    text-align: center;
    transition: all .5s ease;
    color: white;
    font-size: 1.1rem;
    text-shadow: 0 -5px 25px rgba(255,255,255,.5);
    font-weight: 600;
    &.show {
      top: 0;
    }
  }
  .heat__wrapper {
    animation: heat 5s ease alternate infinite;
    position: absolute;
    height: 100%;
    width: 100%;
    left: 0;
    top: 0;
    .heat__gradient {
      height: 100%;
      width: 100%;
      transition: opacity .8s ease;
      background: linear-gradient(10deg, #232222 20%, $pink 150%);
    }
  }
  .drag__guide {
    transform-origin: center;
    transform: rotate(-90deg);
    width: 180px;
    opacity: .2;
    user-select: none;
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
    &.emphasized {
      transition: transform .2s ease;
      box-shadow: 0 0 30px -5px $red;
      transform: scale(1.3) rotate(-2deg);
      input::placeholder {
        font-size: 1.2rem;
      }
    }
    &.jerked {
      margin-top: 50px;
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
    top: 0;
    left: 0;
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
