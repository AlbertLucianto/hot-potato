<template>
<div class="receivedList__container">
  <detail-potato v-for="potato in receivedPotato" v-if="!selected || selected === potato.potato.id"
    :key="potato.potato.id" :potato="potato.potato" :from="potato.passedFrom" :userId="userId"
    :selected="selected === potato.potato.id" :select="select" :deselect="deselect"/>
  <div class="gradient--botom" />
  <search-bar :setSearch="setSearch" :selectedUser="selectedUser" :selectUser="selectUser" v-if="selected"
    :jerked="!!notification" :cancel="cancelSearch" :setSearching="setSearching" :results="allUsers"/>
  <div class="sendButton" v-if="selectedUser && selected">SEND</div>
</div>
</template>

<script>
import gql from 'graphql-tag';
import DetailPotato from '../DetailPotato';
import SearchBar from '../SearchBar';

const SEARCH_PAGE_SIZE = 5;

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
        mutation: gql``,
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
    bottom: 200px;
    padding: 10px 20px;
    border-radius: 10px;
    box-shadow: 0 5px 30px -5px rgba(0,0,0,.3);
    background: white;
    transition: all .1s ease;
    &:hover {
      box-shadow: 0 2.5px 5px rgba(0,0,0,.3);
      cursor: pointer;
    }
  }
}
</style>
