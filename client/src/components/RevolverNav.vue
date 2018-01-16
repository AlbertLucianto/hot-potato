<template>
  <div class="revolver__container" 
    @mousedown="startDrag" @touchstart="startDrag"
    @mousemove="onDrag" @touchmove="onDrag"
    @mouseup="onRelease" @touchend="onRelease">
    <div class="revolver__inner">
      <svg class="arrowNavigations" viewBox="0 0 300 300">
        <polygon class="arrow arrow__left" points="0,15 15,30 15,0" @click="prevPage"/>
        <polygon class="arrow arrow__right" points="300,15 285,30 285,0" @click="nextPage"/>
      </svg>
      <div class="nav__item" v-for="(route, idx) in routes" :key="idx"
        :style="itemStyle(idx)" :class="{ active: idx === active, animated }">
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
import dynamics from 'dynamics.js';
import { routes } from '../router';

const DRAG_DAMP = 10;
const CHANGE_ROUTE_TRESHOLD = 15;
const DYNAMICS_DURATION = 1000;

// Problem with negative mod in JavaScript
const mod = (number, by) => ((number % by) + by) % by;

export default {
  data() {
    return {
      routes,
      active: -1,
      round: 0,
      start: 0,
      dragged: 0,
      dragging: false,
      animated: true,
      animatedTimeout: undefined,
    };
  },
  computed: {
    itemStyle() {
      return (idx) => {
        const deg = ((idx - this.active) * (360 / this.routes.length)) - (360 * this.round);
        const offset = (10 * Math.abs(idx - this.active)) - 260;
        return {
          transform: `rotate(${deg + this.dragged}deg) translateY(${offset}px) `,
        };
      };
    },
  },
  watch: {
    $route() { this.updateActive(); },
  },
  methods: {
    updateActive() {
      const match = this.$route.matched[0];
      if (match) {
        this.active = this.$route.matched[0].props.default.idx;
      }
    },
    nextPage() {
      const { length } = this.routes;
      if (this.active === length - 1) this.round += 1;
      const newActive = mod(this.active + 1, length);
      this.$router.push(routes[newActive].path);
    },
    prevPage() {
      const { length } = this.routes;
      if (this.active === 0) this.round -= 1;
      const newActive = mod(this.active - 1, length);
      this.$router.push(routes[newActive].path);
    },
    startDrag(e) {
      const evt = e.changedTouches ? e.changedTouches[0] : e;
      clearTimeout(this.animatedTimeout);
      dynamics.stop(this);
      this.animated = false;
      this.dragging = true;
      this.start = evt.pageX - this.dragged;
      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.onRelease);
      window.addEventListener('touchmove', this.onDrag);
      window.addEventListener('touchend', this.onRelease);
    },
    onDrag(e) {
      if (this.dragging) {
        const evt = e.changedTouches ? e.changedTouches[0] : e;
        this.dragged = (evt.pageX - this.start) / DRAG_DAMP;
      }
    },
    onRelease() {
      if (this.dragging) {
        this.dragging = false;
        window.removeEventListener('mousemove', this.onDrag);
        window.removeEventListener('mouseup', this.onRelease);
        window.removeEventListener('touchmove', this.onDrag);
        window.removeEventListener('touchend', this.onRelease);
        if (Math.abs(this.dragged) > CHANGE_ROUTE_TRESHOLD) {
          this.animated = true;
          if (this.dragged > 0) this.prevPage();
          else this.nextPage();
          this.dragged = 0;
        } else {
          this.animatedTimeout = setTimeout(() => { this.animated = true; }, DYNAMICS_DURATION);
          dynamics.animate(this, {
            dragged: 0,
          }, {
            type: dynamics.spring,
            duration: DYNAMICS_DURATION,
            frequency: 500,
            friction: 500,
          });
        }
      }
    },
  },
  mounted() {
    this.updateActive();
    // window.addEventListener('click', this.nextPage);
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
  z-index: 20;
  cursor: grab;
  .revolver__inner {
    position: relative;
    width: 100%;
    height: 400px;
    border-radius: 50%;
    background-color: rgb(255,149,0);
    .nav__item {
      position: absolute;
      text-align: center;
      width: 200px;
      left: calc(50% - 100px);
      top: 180px;
      user-select: none;
      .item__text {
        fill: rgb(250,140,0);
        font-weight: 600;
        font-size: 2.5rem;
      }
      &.animated {
        transition: transform .3s ease, font-weight .2s ease, font-size .2s ease;
      }
      &.active .item__text {
        font-weight: 900;
        font-size: 4rem;
        height: 100px;
      }
    }
    .arrowNavigations {
      width: 300px;
      height: auto;
      transform: translateY(-15px);
      .arrow {
        fill: transparent;
        stroke: rgb(250,140,0);
        stroke-width: 3px;
        stroke-linejoin: round;
        transition: stroke-width .2s .1s;
        &:hover {
          stroke-width: 5px;
          cursor: pointer;
          transition: stroke-width .1s;
        }
        &__left {
          transform-origin: 50% 50%;
          transform: translate(20px, 10px) rotate(-25deg);
          &:hover {
            animation: arrow__left-hovered .5s alternate infinite;
          }
        }
        &__right {
          transform-origin: 50% 50%;
          transform: translate(-20px, 10px) rotate(25deg);
          &:hover {
            animation: arrow__right-hovered .5s alternate infinite;
          }
        }
      }
    }
  }
}

@keyframes arrow__left-hovered {
  100% {
    transform: translate(21px, 9.5px) rotate(-22.5deg);
  }
}
@keyframes arrow__right-hovered {
  100% {
    transform: translate(-21px, 9.5px) rotate(22.5deg);
  }
}
</style>
