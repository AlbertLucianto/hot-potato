<template>
<div class="receivedList__container">
  <detail-potato v-for="potato in receivedPotato" v-if="!selected || selected === potato.potato.id"
    :key="potato.potato.id" :potato="potato.potato" :from="potato.passedFrom"
    :selected="selected === potato.potato.id" :select="select" :deselect="deselect"/>
  <div class="gradient--botom" />
  <search-bar :setSearch="setSearch" :selectedUser="selectedUser" :selectUser="selectUser" v-if="selected"
    :jerked="!!notification" :cancel="cancelSearch" :setSearching="setSearching" :results="allUsers"/>
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
  },
};
</script>

<style lang="scss" scoped>
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
}
</style>
