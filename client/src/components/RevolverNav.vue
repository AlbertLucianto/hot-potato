<template>
  <div class="revolver__container">
    <div class="revolver__inner">
      <div class="nav__item" v-for="(route, idx) in routes" :key="idx"
        :style="itemStyle(idx)">
        {{ route.name }}
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
        const deg = (idx - this.active) * (360 / this.routes.length);
        return {
          transform: `rotate(${deg}deg) translateY(-200px) `,
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
      transition: transform .2s ease;
      position: absolute;
      text-align: center;
      width: 100px;
      left: calc(50% - 50px);
      top: 180px;
    }
  }
}
</style>
