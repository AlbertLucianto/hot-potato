<template>
<div class="receivedList__container">
  <detail-potato v-for="potato in receivedPotato" v-if="!selected || selected === potato.potato.id"
    :key="potato.id" :potato="potato.potato" :from="potato.passedFrom"
    :selected="selected === potato.potato.id" :clickTrigger="select"/>
  <div class="gradient--botom" />
</div>
</template>

<script>
import gql from 'graphql-tag';
import DetailPotato from '../DetailPotato';

export default {
  components: {
    DetailPotato,
  },
  props: {
    userId: String,
  },
  data() {
    return {
      loading: 0,
      selected: '',
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
  },
  methods: {
    select(potatoId) {
      console.log(potatoId);
      this.selected = potatoId;
    },
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
    bottom: 0;
    left: 0;
    width: 100%;
    height: 120px;
    background: linear-gradient(to top, #F8F8FE, #F5F5FD00)
  }
}
</style>
