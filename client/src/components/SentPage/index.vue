<template>
<div class="sentList__container">
  <transition enter-active-class="animated bounceIn">
    <div class="login__info" v-if="!userId && mounted && !loading">Signup / Login<div class="small">to see your</div><div class="small">Potato Outbox</div></div>
  </transition>
  <div class="empty__info" v-if="isEmpty">Search Empty Results</div>
  <detail-potato v-for="potato in sortedPotato" v-if="!selected || selected === potato.potato.id"
    :key="potato.id" :potato="potato.potato" :from="potato.passedFrom" :to="potato.user"
    :selected="selected === potato.potato.id" :select="select" :deselect="deselect"/>
  <div class="gradient--botom" :class="{ hidden: selected }"/>
</div>
</template>

<script>
import gql from 'graphql-tag';
import DetailPotato, { calcDiffTime } from '../DetailPotato';

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
      sortedPotato: [],
      mounted: false,
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
            passedFrom {
              id
              name
            }
            user {
              id
              name
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
          this.sortPotato();
        },
      };
    },
  },
  computed: {
    isEmpty() {
      const empty = this.allHolders ? !this.allHolders.length : false;
      return empty && !this.loading;
    },
  },
  methods: {
    select(potatoId) { this.selected = potatoId; },
    deselect() { this.selected = ''; },
    sortPotato() {
      this.sortedPotato = this.allHolders ? [...this.allHolders] : [];

      this.sortedPotato.sort((a, b) => {
        const timeA = calcDiffTime(a.potato.droppedDate);
        const timeB = calcDiffTime(b.potato.droppedDate);

        return timeB - timeA;
      });
    },
  },
  mounted() { this.mounted = true; },
};
</script>

<style lang="scss" scoped>
$pink: rgb(255,45,85);
$red: rgb(255,59,48);
$purple: rgb(88,86,214);
$orange: rgb(255,149,0);
$darkOrange: rgb(245,140,0);

.sentList__container {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 50px 0 120px 0;
  height: 100%;
  overflow: scroll;
  background: #333;
  .login__info {
    width: 50%;
    height: 100px;
    padding: 15px;
    background: $pink;
    font-weight: 500;
    font-size: 1.5rem;
    line-height: 2.1rem;
    color: #FFF;
    border-radius: 20px;
    box-shadow: 0 10px 40px -10px $pink;
    .small {
      font-size: 1.2rem;
    }
  }
  .empty__info {
    font-weight: 600;
    color: #BBB;
  }
  .gradient--botom {
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 120px;
    background: #333;
    box-shadow: 0 0 50px -5px rgba(0,0,0,.5);
    &.hidden {
      // background: unset;
    }
  }
}
</style>
