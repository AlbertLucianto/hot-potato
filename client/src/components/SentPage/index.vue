<template>
<div class="sentList__container">
  <detail-potato v-for="potato in allHolders" :key="potato.id"
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
    allHolders() {
      return {
        query: gql`query sent($userId: ID!) {
          allHolders(
            filter: {
              passedFrom: { id: $userId },
            }
          ) {
            potato {
              id
              droppedDate
            }
          }
        }`,
        variables() {
          return {
            userId: this.userId,
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
.sentList__container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}
</style>
