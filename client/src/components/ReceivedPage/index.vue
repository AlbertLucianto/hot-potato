<template>
<div class="receivedList__container">
  <div v-for="(potato, idx) in receivedPotato" :key="potato.id" class="received__item">
    <div v-if="categoryByDate(potato.droppedDate) === category.dropped" class="received__content">
      <img class="potatoIcon" src="../../assets/SVG/list_dropped.svg"/>
      <div class="content__text">{{ displayText(potato.droppedDate).value }}</div>
    </div>
    <div v-else-if="categoryByDate(potato.droppedDate) === category.relax" class="received__content">
      <img class="potatoIcon" src="../../assets/SVG/list_relax.svg"/>
      <div class="content__text">{{ displayText(potato.droppedDate).value }}</div>
    </div>
    <div v-else-if="categoryByDate(potato.droppedDate) === category.medium" class="received__content">
      <img class="potatoIcon" src="../../assets/SVG/list_medium.svg"/>
      <div class="content__text">{{ displayText(potato.droppedDate).value }}</div>
    </div>
    <div v-else-if="categoryByDate(potato.droppedDate) === category.urgent" class="received__content">
      <img class="potatoIcon" src="../../assets/SVG/list_urgent.svg"/>
      <div class="content__text">{{ displayText(potato.droppedDate).value }}</div>
    </div>
  </div>
</div>
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
      category: {
        dropped: 'DROPPED',
        relax: 'RELAX',
        medium: 'MEDIUM',
        urgent: 'URGENT',
      },
    };
  },
  computed: {
    categoryByDate() {
      return (ISODate) => {
        if (new Date(ISODate) < new Date()) return this.category.dropped;
        else return this.category.medium;
      };
    },
    displayText() {
      return (ISODate) => {
        if (new Date(ISODate) < new Date()) return {
          value: `Dropped on ${new Date(ISODate).toDateString()}`,
        };
        const dayDiff = Math.floor((new Date(ISODate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        if (dayDiff >= 1) return {
          value: dayDiff,
          scale: `day${dayDiff > 1 ? 's' : ''}`,
        };
        const hourDiff = new Date(ISODate).getHours() - new Date().getHours();
        if (hourDiff >= 1) return {
          value: hourDiff,
          scale: `hour${hourDiff > 1 ? 's' : ''}`,
        };
        const minDiff = new Date(ISODate).getMinutes() - new Date().getMinutes();
        if (minDiff >= 0) return {
          value: minDiff,
          scale: `minute${minDiff > 1 ? 's' : ''}`,
        };
      };
    }
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
  .received__item {
    width: 120px;
    height: 120px;
    margin: 30px;
    .potatoIcon {
      max-height: 100px;
      max-width: 100px;
    }
  }
}
</style>
