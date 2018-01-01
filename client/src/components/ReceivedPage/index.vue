<template>
<div>{{ receivedPotato }}</div>  
</template>

<script>
import gql from 'graphql-tag';

export default {
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
            id
            droppedDate
          }
        }`,
        variables() {
          return {
            currentlyHold: false,
            filterDropped: true,
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

</style>
