<template>
<div class="thermo__container"
  @mousedown="startDrag" @touchstart="startDrag"
  @mousemove="onDrag" @touchmove="onDrag"
  @mouseup="onRelease" @touchend="onRelease">
  <div class="thermo__stick" ref="stick">
    <div class="thermo__level" :style="levelStyle">
      <div class="glare"/>
    </div>
  </div>
  <div class="thermo__circle"/>
  <div class="thermo__value">
    {{ temperature }}<sup>o</sup>
  </div>
</div>
</template>

<script>
const INIT_HEIGHT = 56;
const MIN_HEIGHT = 20;
const LEFTOVER = 20;
const MIN_TEMPERATURE = 50;
const MAX_TEMPERATURE = 200;

export default {
  props: {
    setTemperature: Function,
  },
  data() {
    return {
      height: INIT_HEIGHT,
      stickHeight: 0,
      start: 0,
      dragging: false,
    };
  },
  computed: {
    temperature() {
      return (MIN_TEMPERATURE + (
        ((this.height - MIN_HEIGHT) / (this.stickHeight - LEFTOVER - MIN_HEIGHT))
        * (MAX_TEMPERATURE - MIN_TEMPERATURE)))
        .toFixed(0);
    },
    levelStyle() {
      return {
        height: `${this.height}px`,
      };
    },
  },
  methods: {
    startDrag(e) {
      const evt = e.changedTouches ? e.changedTouches[0] : e;
      this.dragging = true;
      this.start = -evt.pageY - this.height;
      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.onRelease);
      window.addEventListener('touchmove', this.onDrag);
      window.addEventListener('touchend', this.onRelease);
    },
    onDrag(e) {
      if (this.dragging) {
        const evt = e.changedTouches ? e.changedTouches[0] : e;
        this.height = Math.max(
          Math.min(-evt.pageY - this.start, this.stickHeight - LEFTOVER),
          MIN_HEIGHT);
      }
    },
    onRelease() {
      if (this.dragging) {
        this.dragging = false;
        this.setTemperature(this.temperature);
        window.removeEventListener('mousemove', this.onDrag);
        window.removeEventListener('mouseup', this.onRelease);
        window.removeEventListener('touchmove', this.onDrag);
        window.removeEventListener('touchend', this.onRelease);
      }
    },
  },
  mounted() {
    this.stickHeight = this.$refs.stick.getBoundingClientRect().height;
    this.$nextTick(() => {
      this.setTemperature(this.temperature);
    });
  },
};
</script>

<style lang="scss" scoped>
$pink: rgb(255,45,85);
$red: rgb(255,59,48);
$purple: rgb(88,86,214);
$orange: rgb(255,149,0);
$darkOrange: rgb(245,140,0);

.thermo__container {
  position: absolute;
  bottom: 35%;
  left: calc(20px + 5%);
  height: 35%;
  width: 50px;
  cursor: -webkit-grab;
  &:hover .thermo__stick {
    box-shadow: 0 5px 30px -5px $pink;
  }
  .thermo__circle {
    position: absolute;
    width: 40px;
    height: 40px;
    bottom: 0;
    background-color: $darkOrange;
    border: 5px solid $darkOrange;
    border-radius: 50%;
    box-shadow: 0 5px 30px -5px rgba(0,0,0,.5);
  }
  .thermo__stick {
    position: absolute;
    width: 20px;
    height: calc(100% - 40px);
    left: 12.5px;
    background-color: rgba(255,255,255,.75);
    border: 2.5px solid $darkOrange;
    border-radius: 30px;
    box-shadow: 0 5px 30px -5px rgba(0,0,0,.5);
    transition: all .2s ease;
    .thermo__level {
      position: absolute;
      bottom: 0;
      height: 25%;
      width: 20px;
      background-color: $darkOrange;
      border-top: 8px solid $pink;
      box-shadow: 10px 0 30px -10px $red inset;
      .glare {
        position: absolute;
        background-color: white;
        width: 4px;
        height: calc(100% - 10px);
        border-radius: 5px;
        right: 0;
        bottom: 0;
        opacity: .3;
      }
    }
  }
  .thermo__value {
    position: absolute;
    width: 60px;
    left: 0;
    bottom: -50px;
    font-size: 1.6rem;
    font-weight: 600;
    color: white;
    user-select: none;
    text-align: center;
  }
}
</style>
