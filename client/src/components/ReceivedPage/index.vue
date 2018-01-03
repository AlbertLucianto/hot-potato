<template>
<div class="receivedList__container">
  <div v-for="(potato, idx) in receivedPotato" :key="potato.id" class="received__item">
    <div v-if="categoryByDate(potato.potato) === category.dropped.name" class="received__content">
      <img class="potatoIcon" src="../../assets/SVG/list_dropped.svg"/>
      <div class="content__text">{{ displayText(potato.potato).value }}</div>
      <div class="content__text">{{ displayText(potato.potato).scale }}</div>
    </div>
    <div v-else-if="categoryByDate(potato.potato) === category.relax.name" class="received__content">
      <img class="potatoIcon" src="../../assets/SVG/list_relax.svg"/>
      <div class="content__text">{{ displayText(potato.potato).value }}</div>
      <div class="content__text">{{ displayText(potato.potato).scale }}</div>
    </div>
    <div v-else-if="categoryByDate(potato.potato) === category.medium.name" class="received__content">
      <img class="potatoIcon" src="../../assets/SVG/list_medium.svg"/>
      <div class="content__text">{{ displayText(potato.potato).value }}</div>
      <div class="content__text">{{ displayText(potato.potato).scale }}</div>
    </div>
    <div v-else-if="categoryByDate(potato.potato) === category.urgent.name" class="received__content">
      <img class="potatoIcon" src="../../assets/SVG/list_urgent.svg"/>
      <div class="content__text">{{ displayText(potato.potato).value }}</div>
      <div class="content__text">{{ displayText(potato.potato).scale }}</div>
    </div>
  </div>
</div>
</template>

<script>
import gql from 'graphql-tag';

const calcDiffTime = (ISODate) => (new Date(ISODate).getTime() - new Date().getTime()) / 1000;

export default {
  props: {
    userId: String,
  },
  data() {
    return {
      loading: 0,
      category: {
        dropped: { name: 'DROPPED', limit: 0 },
        relax: { name: 'RELAX', limit: 7 * 24 * 3600 },
        medium: { name: 'MEDIUM', limit: 24 * 3600 },
        urgent: { name: 'URGENT', limit: 2 * 3600 },
      },
    };
  },
  computed: {
    categoryByDate() {
      return (potato) => {
        const time = calcDiffTime(potato.droppedDate);
        if (time < 0) return this.category.dropped.name;
        if (time > this.category.relax.limit) return this.category.relax.name;
        if (time > this.category.medium.limit) return this.category.medium.name;
        else return this.category.urgent.name;
      };
    },
    displayText() {
      return (potato) => {
        const time = calcDiffTime(potato.droppedDate);
        if (time < 0) return { value: `Dropped at ${new Date(potato.droppedDate).toDateString()}` };
        if (time > 24 * 3600) {
          const value = Math.floor(time / 24 / 3600);
          return { value, scale: `day${value > 1 ? 's' : ''}` };
        } else if (time > 3600) {
          const value = Math.floor(time / 3600);
          return { value, scale: `hour${value > 1 ? 's' : ''}` };
        } else if (time > 60) {
          const value = Math.floor(time / 60);
          return { value, scale: `minute${value > 1 ? 's' : ''}` };
        } else {
          const value = Math.floor(time);
          return { value, scale: `second${value > 1 ? 's' : ''}` };
        }
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
