<template>
  <div class="revolver__container">
    <div class="revolver__inner">
      <div class="nav__item" v-for="(route, idx) in routes" :key="idx"
        :style="itemStyle(idx)" :class="{ active: idx === active }">
        <svg viewBox="0 0 500 500">
          <path id="curve" d="M 0 250 A 500 500 0 0 1 500 250" fill="transparent"/>
          <text text-anchor="middle" class="item__text">
            <textPath xlink:href="#curve" startOffset="50%">
              {{ route.name }}
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { routes } from '../router';

export default {
  data() {
    return {
      routes,
      active: -1,
    };
  },
  computed: {
    itemStyle() {
      return (idx) => {
        const deg = (idx - this.active) * (200 / this.routes.length);
        const offset = (10 * Math.abs(idx - this.active)) - 260;
        return {
          transform: `rotate(${deg}deg) translateY(${offset}px) `,
        };
      };
    },
  },
  watch: {
    $route(route) {
      this.active = route.matched[0].props.default.idx;
    },
  },
  mounted() {
    console.log(this.routes, this.$route.matched[0].props.default.idx);
    this.active = this.$route.matched[0].props.default.idx;
  },
};
</script>

<style lang="scss" scoped>
.revolver__container {
  width: 100%;
  height: 50px;
  padding-top: 100px;
  bottom: 0;
  position: absolute;
  .revolver__inner {
    position: relative;
    width: 100%;
    height: 400px;
    border-radius: 50%;
    background-color: rgb(255,149,0);
    .nav__item {
      transition: transform .3s ease, font-weight .2s ease, font-size .2s ease;
      position: absolute;
      text-align: center;
      width: 200px;
      left: calc(50% - 100px);
      top: 180px;
      .item__text {
        fill: rgb(250,140,0);
        font-weight: 600;
        font-size: 2.5rem;
      }
      &.active .item__text {
        font-weight: 900;
        font-size: 4rem;
        height: 100px;
      }
    }
  }
}
</style>
