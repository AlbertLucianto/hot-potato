<template>
  <div class="hallOfShame__container">
    <div v-for="(user, idx) in mocked" :key="idx" class="list__item" :class="{ 'top--rank': idx < 3 }">
      <div class="item__rank" :class="{ [`rank--${idx + 1}`]: idx < 3 }">{{ idx + 1 }}</div>
      <div class="item__userDetails">
        <div class="userDetail__name">{{ user.name }}</div>
        <div class="userDetail__email">{{ user.email }}</div>
      </div>
      <div>{{ user.count }}</div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';

const PAGE_SIZE = 10;

export default {
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
      return hallOfShame ? [...hallOfShame, ...hallOfShame, ...hallOfShame, ...hallOfShame, ...hallOfShame] : [];
    },
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
  padding: 20px 10px;
  .list__item {
    display: flex;
    padding: 5px 20px;
    align-items: center;
    justify-content: space-between;
    .item__rank {
      box-sizing: border-box;
      font-weight: 600;
      font-size: 28px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      &.rank--1 { background-image: url('../../assets/SVG/medal_gold.svg'); }
      &.rank--2 { background-image: url('../../assets/SVG/medal_silver.svg'); }
      &.rank--3 { background-image: url('../../assets/SVG/medal_bronze.svg'); }
    }
    .item__userDetails {
      text-align: left;
      flex-grow: 1;
      margin-left: 20px;
      padding-bottom: 5px;
      .userDetail__name {
        font-weight: 600;
        font-size: 18px;
      }
      .userDetail__email {
        font-size: 12px;
        color: #888;
      }
    }
    &.top--rank {
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
    }
  }
}
</style>
