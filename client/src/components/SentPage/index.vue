<template>
<div class="sentList__container">
  <detail-potato v-for="potato in allHolders"  v-if="!selected || selected === potato.potato.id"
    :key="potato.id" :potato="potato.potato" :from="potato.passedFrom"
    :selected="selected === potato.potato.id" :select="select" :deselect="deselect"/>
  <div class="gradient--botom" :class="{ hidden: selected }"/>
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
  methods: {
    select(potatoId) { this.selected = potatoId; },
    deselect() { this.selected = ''; },
  },
};
</script>

<style lang="scss" scoped>
.sentList__container {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 50px 0 120px 0;
  height: 100%;
  overflow: scroll;
  background: #333;
  .gradient--botom {
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 120px;
    background: #333;
    box-shadow: 0 0 50px -5px rgba(0,0,0,.5);
    &.hidden {
      background: unset;
    }
  }
}
</style>
