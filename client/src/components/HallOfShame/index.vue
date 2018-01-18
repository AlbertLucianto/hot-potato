<template>
  <div class="hallOfShame__container">
    <div class="hallOfShame__background" :class="{ mounted: curtainUp }"/>
    <div v-for="(user, idx) in hallOfShame" :key="idx"
      class="list__item" :class="{ 'top--rank': idx < 3, show, 'animated bounceIn': show }"
      :style="animate(idx)">
      <div class="item__rank" :class="{ [`rank--${idx + 1}`]: idx < 3 }">{{ idx + 1 }}</div>
      <div class="item__userDetails">
        <div class="userDetail__name">{{ user.name }}</div>
        <div class="userDetail__email">{{ user.email }}</div>
      </div>
      <div class="item__count"><div class="count__value">{{ user.count }}</div><div class="count__times">x</div></div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';

const PAGE_SIZE = 5;
const CURTAIN_UP_DELAY = 50;
const SHOW_DELAY = 200;

export default {
  data() {
    return {
      curtainUp: false,
      show: false,
    };
  },
  watch: {
    hallOfShame() {
      setTimeout(() => { this.show = true; }, SHOW_DELAY);
    },
  },
  apollo: {
    $loadingKey: 'loading',
    hallOfShame() {
      return {
        query: gql`query leaderBoard($length: Int!) {
          hallOfShame(length: $length) {
            id
            email
            name
            count
          }
        }`,
        variables: {
          length: PAGE_SIZE,
        },
        fetchPolicy: 'cache-first',
      };
    },
  },
  computed: {
    mocked() {
      const { hallOfShame } = this;
      return hallOfShame ? [...hallOfShame, ...hallOfShame,
        ...hallOfShame, ...hallOfShame, ...hallOfShame] : [];
    },
    animate() {
      return idx => ({
        'transition-delay': `${idx}00ms`,
        'animation-delay': `${idx}00ms`,
      });
    },
  },
  mounted() {
    setTimeout(() => { this.curtainUp = true; }, CURTAIN_UP_DELAY);
  },
};
</script>

<style lang="scss" scoped>
$pink: rgb(255,45,85);
$red: rgb(255,59,48);
$purple: rgb(88,86,214);
$orange: rgb(255,149,0);
$darkOrange: rgb(245,140,0);

.hallOfShame__container {
  box-sizing: border-box;
  padding: 90px 10px 20px 10px;
  height: 100%;
  background-color: #FAFAFE;
  .list__item {
    display: flex;
    padding: 10px 20px;
    margin: 5px;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(120,120,200,.1);
    box-shadow: 0 5px 25px -10px rgba(0,0,0,.2);
    border-radius: 5px;
    background-color: white;
    animation-duration: 1.2s;
    &:not(.show) {
      opacity: 0;
    }
    .item__rank {
      box-sizing: border-box;
      font-weight: 600;
      font-size: 28px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      &.rank--1 { background-image: url('../../assets/SVG/medal_gold.svg'); }
      &.rank--2 { background-image: url('../../assets/SVG/medal_silver.svg'); }
      &.rank--3 { background-image: url('../../assets/SVG/medal_bronze.svg'); }
    }
    .item__userDetails {
      text-align: left;
      flex-grow: 1;
      max-width: calc(100% - 120px);
      margin-left: 20px;
      padding-bottom: 5px;
      .userDetail__name {
        font-weight: 600;
        font-size: 18px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow:hidden
      }
      .userDetail__email {
        font-size: 12px;
        color: #888;
        text-overflow: ellipsis;
      }
    }
    .item__count {
      font-family: 'Francois One', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #AAA;
      .count__value {
        font-size: 24px;
        margin-right: 5px;
      }
      .count__times {
        transform: scaleX(1.3);
      }
    }
    &.top--rank {
      border-width: 2px;
      .item__rank {
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        color: white;
        align-items: flex-start;
        padding-top: 10px;
        width: 70px;
        height: 90px;
        margin: -5px;
      }
      .item__userDetails {
        .userDetail__name {
          color: $darkOrange;
          font-size: 24px;
        }
      }
      .item__count {
        transform: rotate(2deg);
        color: #333;
        .count__value {
          font-size: 32px;
          font-weight: 600;
          margin-right: 10px;
        }
        .count__times {
          font-weight: 600;
          font-size: 21px;
          opacity: .8;
        }
      }
    }
  }
  .hallOfShame__background {
    position: absolute;
    width: calc(100% + 100px);
    top: -20px;
    left: -50px;
    height: 500px;
    background-image: url('../../assets/SVG/hall_of_shame_bg.svg');
    background-size: contain;
    background-repeat: no-repeat;
    &.mounted {
      animation: curtain 3s forwards ease .2s;
    }
  }
}

@keyframes curtain {
  30% {
    transform: scale(1.2) translateY(5px);
  }
  100% {
    transform: scale(1.3) translateY(30px);
  }
}
</style>
