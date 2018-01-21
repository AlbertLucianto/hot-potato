<template>
<div class="newPotatoPage__container" ref="container">
  <div class="new__notification" :class="{ show: notification }">{{ notification }}</div>
  <div class="heat__wrapper">
    <div class="heat__gradient" :style="gradientStyle"/>
  </div>
  <img class="drag__guide" v-if="!!selectedUser" src="../../assets/SVG/loading-bubbles.svg"/>
  <transition enter-active-class="animated bounceIn potatoAnimate">
    <potato-animate v-if="showPotato" :class="{ blur: searching }" :passPosition="passPosition"
      :send="deployAndPassPotato" :canSend="!!selectedUser" :remindInput="emphasizeSearchInput"/>
  </transition>
  <temperature-setting :setTemperature="setTemperature" :class="{ blur: searching }"/>
  <div class="duration__container" :class="{ blur: searching }">
    <div class="description">This potato will be dropped in</div>
    <div class="value">{{ duration }}</div>
    <div class="scale">hours</div>
  </div>
  <search-bar :setSearch="setSearch" :emphasized="emphasized" :selectedUser="selectedUser" :selectUser="selectUser"
    :jerked="!!notification" :cancel="cancelSearch" :setSearching="setSearching" :results="allUsers"/>
</div>
</template>

<script>
import gql from 'graphql-tag';

import PotatoAnimate from './PotatoAnimate';
import TemperatureSetting from './TemperatureSetting';
import SearchBar from '../SearchBar';

const SEARCH_PAGE_SIZE = 5;
const PASS_TRESHOLD = 150;
const NOTIFICATION_DURATION = 3000;

const temperatureToDuration = temp => parseInt((320 - temp) / 10, 10);

export default {
  components: {
    PotatoAnimate,
    TemperatureSetting,
    SearchBar,
  },
  props: {
    userId: String,
  },
  data() {
    return {
      showPotato: false,
      temperature: 0,
      searching: false,
      search: '',
      loading: 0,
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
    duration() {
      return temperatureToDuration(this.temperature);
    },
  },
  apollo: {
    $loadingKey: 'loading',
    allUsers() {
      return {
        query: gql`query getUser($contain: String!, $pageSize: Int!, $userId: ID!) {
          allUsers(
            filter: { name_contains: $contain, id_not: $userId },
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
            userId: this.userId,
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
    setSearch(word) { this.search = word; },
    setSearching(val) { this.searching = val; },
    cancelSearch() { this.selectedUser = undefined; },
    selectUser(user) { this.selectedUser = user; },
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
        const potatoId = resDeploy.data.deployPotato.id;
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
        }).then(() => {
          this.refreshPotato();
          this.notification = `New potato successfully sent to ${this.selectedUser.name}`;
          this.selectedUser = undefined;
          this.search = '';
          this.clearNotification();
        }).catch((passErr) => {
          console.log(passErr); // eslint-disable-line no-console
          const messageAr = passErr.message.split('error: ');
          this.notification = messageAr[2];
          this.refreshPotato();
          this.clearNotification();
        });
      }).catch((deployErr) => {
        console.log(deployErr); // eslint-disable-line no-console
        this.loading -= 1;
        const messageAr = deployErr.message.split('error: ');
        this.notification = messageAr[2];
        this.refreshPotato();
        this.clearNotification();
      });
    },
    emphasizeSearchInput() {
      this.emphasized = true;
      setTimeout(() => {
        this.emphasized = false;
      }, 200);
    },
    clearNotification(ms = NOTIFICATION_DURATION) {
      setTimeout(() => {
        this.notification = '';
      }, ms);
    },
    refreshPotato() {
      this.showPotato = false;
      setTimeout(() => {
        this.showPotato = true;
      });
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
  padding: 90px 40px 60px 120px;
  background: #232222;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .new__notification {
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
    z-index: 5;
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
    width: 90px;
    opacity: .5;
    user-select: none;
  }
  .potatoAnimate {
    animation-duration: .6s;
  }
  .blur {
    filter: blur(20px);
  }
  .duration__container {
    color: white;
    margin-top: 5%;
    user-select: none;
    z-index: 5;
    .description {
      font-size: 14px;
      opacity: .8;
    }
    .value {
      margin-top: 10px;
      color: $orange;
      font-weight: 600;
      font-size: 46px;
    }
    .scale {
      font-weight: 500;
      font-size: 20px;
    }
  }
}

@keyframes heat {
  100% {
    opacity: .5;
  }
}
</style>
