<template>
<div class="receivedList__container">
  <detail-potato v-for="potato in receivedPotato" v-if="!selected || selected === potato.potato.id"
    :key="potato.potato.id" :potato="potato.potato" :from="potato.passedFrom" :userId="userId"
    :selected="selected === potato.potato.id" :select="select" :deselect="deselect"/>
  <div class="gradient--botom" />
  <search-bar :setSearch="setSearch" :selectedUser="selectedUser" :selectUser="selectUser" v-if="selected"
    :jerked="!!notification" :cancel="cancelSearch" :setSearching="setSearching" :results="allUsers"/>
  <div class="sendButton" v-if="selectedUser && selected" @click="passPotato">SEND</div>
  <div class="new__notification" :class="{ show: notification, error }">{{ notification }}</div>
</div>
</template>

<script>
import gql from 'graphql-tag';
import DetailPotato from '../DetailPotato';
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
            currentlyHold: false,
            filterDropped: false,
          };
        },
        skip() {
          return !this.userId;
        },
        fetchPolicy: 'cache-and-network',
        result(data) {
          console.log(data); // eslint-disable-line no-console
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
  methods: {
    select(potatoId) { this.selected = potatoId; },
    deselect() { this.selected = ''; },
    setSearch(word) { this.search = word; },
    setSearching(val) { this.searching = val; },
    cancelSearch() { this.selectedUser = undefined; },
    selectUser(user) { this.selectedUser = user; },
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
        this.notification = `New potato successfully sent to ${this.selectedUser.name}`;
        this.error = false;
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
  padding: 50px 0 120px 0;
  height: 100%;
  overflow: scroll;
  background: #F8F8FE;
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
    z-index: 2;
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
    background: #F8F8FE;
    box-shadow: 0 0 35px -5px rgba(150,78,78,.2);
  }
  .sendButton {
    position: absolute;
    bottom: 180px;
    padding: 10px 20px;
    border-radius: 10px;
    box-shadow: 0 5px 30px -5px rgba(0,0,0,.3);
    background: white;
    transition: all .1s ease;
    font-weight: 600;
    color: #333;
    &:hover {
      box-shadow: 0 2.5px 5px rgba(0,0,0,.3);
      cursor: pointer;
    }
  }
}
</style>
