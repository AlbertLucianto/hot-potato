<template>
<div class="receivedList__container">
  <detail-potato v-for="potato in receivedPotato" :key="potato.id"
    :potato="potato.potato" :from="potato.passedFrom" />
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
};
</script>

<style lang="scss" scoped>
.receivedList__container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}
</style>
