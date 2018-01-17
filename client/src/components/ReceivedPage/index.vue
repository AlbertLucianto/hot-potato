<template>
<div class="receivedList__container">
  <div class="toggles__container">
    <div class="toggle__wrapper" :class="{ active: holdingOnly }">
      <div class="label">Holding Only</div>
      <div class="toggle" @click="toggleHolding">
        <div class="toggle__handle" />
      </div>
    </div>
    <div class="toggle__wrapper" :class="{ active: activeOnly }">
      <div class="label">Active Only</div>
      <div class="toggle" @click="toggleActive">
        <div class="toggle__handle" />
      </div>
    </div>
  </div>
  <div class="empty__info" v-if="isEmpty">Search Empty Results</div>
  <transition enter-active-class="animated bounceIn">
    <div class="login__info" v-if="!userId && mounted && !loading">Signup / Login<div class="small">to see your</div><div class="small">Potato Inbox</div></div>
  </transition>
  <!-- <transition-group
    name="custom-classes-transition"
    enter-active-class="animated bounceIn"
  > -->
  <detail-potato v-for="potato in sortedPotato" v-if="!selected || selected === potato.potato.id"
    :key="potato.potato.id" :potato="potato.potato" :from="potato.passedFrom" :userId="userId"
    :selected="selected === potato.potato.id" :select="select" :deselect="deselect" :class="{ blur: searching }"/>
  <!-- </transition-group> -->
  <div class="gradient--botom" />
  <search-bar :setSearch="setSearch" :selectedUser="selectedUser" :selectUser="selectUser" v-if="selected"
    :jerked="!!notification" :cancel="cancelSearch" :setSearching="setSearching" :results="allUsers"/>
  <div class="sendButton" v-if="selectedUser && selected" @click="passPotato">SEND</div>
  <div class="new__notification" :class="{ show: notification, error }">{{ notification }}</div>
</div>
</template>

<script>
import gql from 'graphql-tag';
import DetailPotato, { calcDiffTime } from '../DetailPotato';
import SearchBar from '../SearchBar';

const SEARCH_PAGE_SIZE = 5;
const NOTIFICATION_DURATION = 3000;

export default {
  components: {
    DetailPotato,
    SearchBar,
  },
  props: {
    userId: String,
  },
  data() {
    return {
      loading: 0,
      selected: '',
      searching: false,
      search: '',
      selectedUser: undefined,
      notification: '',
      error: false,
      holdingOnly: true,
      activeOnly: true,
      sortedPotato: [],
      mounted: false,
    };
  },
  apollo: {
    $loadingKey: 'loading',
    receivedPotato() {
      return {
        query: gql`query received($currentlyHold: Boolean!, $filterDropped: Boolean!) {
          receivedPotato(
            currentlyHold: $currentlyHold,
            filterDropped: $filterDropped,
          ) {
            potato
            passedFrom
          }
        }`,
        variables() {
          return {
            currentlyHold: this.holdingOnly,
            filterDropped: this.activeOnly,
          };
        },
        skip() {
          return !this.userId;
        },
        fetchPolicy: 'cache-and-network',
        result(data) {
          console.log(data); // eslint-disable-line no-console
          this.sortPotato();
        },
      };
    },
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
  computed: {
    isEmpty() {
      const empty = this.receivedPotato ? !this.receivedPotato.length : false;
      return empty && !this.loading;
    },
  },
  methods: {
    select(potatoId) { this.selected = potatoId; },
    deselect() { this.selected = ''; },
    setSearch(word) { this.search = word; },
    setSearching(val) { this.searching = val; },
    cancelSearch() { this.selectedUser = undefined; },
    selectUser(user) { this.selectedUser = user; },
    toggleHolding() { this.holdingOnly = !this.holdingOnly; },
    toggleActive() { this.activeOnly = !this.activeOnly; },
    sortPotato() {
      this.sortedPotato = this.receivedPotato ? [...this.receivedPotato] : [];

      this.sortedPotato.sort((a, b) => {
        const timeA = calcDiffTime(a.potato.droppedDate);
        const timeB = calcDiffTime(b.potato.droppedDate);

        if (timeA < 0) return timeB < 0 ? timeA - timeB : 1;
        return timeB < 0 ? -1 : timeA - timeB;
      });
    },
    passPotato() {
      this.$apollo.mutate({
        mutation: gql`mutation pass($receiverId: ID!, $potatoId: ID!) {
          passPotato(receiverId: $receiverId, potatoId: $potatoId) {
            id
            droppedDate
            sequence
          }
        }`,
        variables: {
          receiverId: this.selectedUser.id,
          potatoId: this.selected,
        },
      }).then(() => {
        this.notification = `Successfully pass to ${this.selectedUser.name}`;
        this.error = false;
        this.$apollo.queries.receivedPotato.refetch();
        this.selected = '';
        setTimeout(() => {
          this.notification = '';
        }, NOTIFICATION_DURATION);
      }).catch((passErr) => {
        console.log(passErr); // eslint-disable-line no-console
        const messageAr = passErr.message.split('error: ');
        this.notification = messageAr[2];
        this.error = true;
        setTimeout(() => {
          this.notification = '';
        }, NOTIFICATION_DURATION);
      });
    },
  },
  mounted() {
    this.mounted = true;
  },
};
</script>

<style lang="scss" scoped>
$pink: rgb(255,45,85);
$red: rgb(255,59,48);
$purple: rgb(88,86,214);
$orange: rgb(255,149,0);
$darkOrange: rgb(245,140,0);

.receivedList__container {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 20px 0 120px 0;
  height: 100%;
  overflow: scroll;
  background: #FAFAFE;
  .blur {
    filter: blur(20px);
  }
  .toggles__container {
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 50px;
    padding: 10px 50px 20px 50px;
    margin: 10px 20px;
    border-bottom: 1px solid rgba(0,0,0,.1);
    .toggle__wrapper {
      padding: 10px 20px;
      display: flex;
      align-items: center;
      .label {
        font-size: 14px;
        color: #777;
        font-weight: 500;
        transition: color .1s ease;
      }
      .toggle {
        width: 60px;
        height: 30px;
        background: #DDD;
        box-shadow: 0 2px 6px -1.5px rgba(0,0,0,.3) inset;
        border-radius: 20px;
        position: relative;
        transition: background-color .2s ease;
        cursor: pointer;
        .toggle__handle {
          position: absolute;
          width: 25px;
          height: 25px;
          background: #F8F8F8;
          border-radius: 50%;
          left: 2.5px;
          top: 1.5px;
          box-shadow: 0 2px 10px rgba(0,0,0,.3);
          transition: left .1s ease;
        }
      }
      &.active {
        .label {
          color: $darkOrange;
        }
        .toggle {
          background: $orange;
          justify-content: flex-end;
          .toggle__handle {
            background: white;
            left: calc(100% - 25px - 2.5px);
          }
        }
      }
    }
  }
  .empty__info {
    font-weight: 600;
    color: #BBB;
  }
  .login__info {
    width: 50%;
    height: 100px;
    padding: 15px;
    background: $darkOrange;
    font-weight: 500;
    font-size: 1.5rem;
    line-height: 2.1rem;
    color: #FFF;
    border-radius: 20px;
    box-shadow: 0 10px 40px -10px $orange;
    .small {
      font-size: 1.2rem;
    }
  }
  .new__notification {
    position: absolute;
    box-sizing: border-box;
    top: -50px;
    padding: 20px;
    left: calc(50% - 150px);
    width: 300px;
    text-align: center;
    transition: all .5s ease;
    color: #333;
    font-size: 1.1rem;
    text-shadow: 0 -5px 25px rgba(255,255,255,.5);
    font-weight: 600;
    z-index: 5;
    &.show {
      top: -5px;
    }
    &.error {
      color: $darkOrange;
    }
  }
  .gradient--botom {
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 120px;
    background: #FCFCFE;
    box-shadow: 0 0 35px -5px rgba(150,78,78,.2);
    border-top: 1px solid rgba(0,0,0,.1);
  }
  .sendButton {
    position: absolute;
    bottom: 120px;
    padding: 10px 20px;
    border-radius: 10px;
    box-shadow: 0 2px 30px -5px $darkOrange;
    border: 1px solid $orange;
    background: white;
    transition: all .1s ease;
    font-weight: 600;
    color: #333;
    z-index: 30;
    &:hover {
      box-shadow: 0 1px 5px $darkOrange;
      cursor: pointer;
    }
  }
}
</style>
