<template>
<svg class="potato" viewBox="0 0 30 45" :style="potatoStyle" :class="{ inFront: canSend }">
  <linearGradient id="linear-gradient" x1="14.94" y1="11.74" x2="14.94" y2="53.93" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#845c28"/>
    <stop offset="1" stop-color="#ff3b30"/>
  </linearGradient>
  <path class="body" @mousedown="startDrag" @touchstart="startDrag" :class="{ dragging }"
    d="M13.16,42.24C-2,41.88-.21,29.07.39,20.9S7.67.23,15,0,28.19,4.89,28,13.86s3.34,11.69,1.31,21.34S17.93,42.36,13.16,42.24Z"/>
  <g class="spots__group">
    <circle class="spot" cx="5" cy="20" r="0.8"/>
    <circle class="spot" cx="25.09" cy="26.59" r="1.01"/>
    <circle class="spot" cx="14.94" cy="23.35" r="0.79"/>
    <circle class="spot" cx="20.98" cy="17.99" r="1.49"/>
    <circle class="spot" cx="20.18" cy="8.93" r="0.79"/>
  </g>
</svg>
</template>

<script>
import dynamics from 'dynamics.js';

const START_POTATO_WIDTH = 150;
const DRAGGING_POTATO_WIDTH = 120;
const DAMP_POSITIVE_Y_DRAG = 4;
const DAMP_NEGATIVE_Y_DRAG = 1.5;
const DAMP_X_DRAG = 10;
const EXIT_POSITION = 600;

export default {
  props: {
    passPosition: Number,
    send: Function,
    canSend: Boolean,
    remindInput: Function,
  },
  data() {
    return {
      start: { x: 0, y: 0 },
      pos: { x: 0, y: 0 },
      dragging: false,
    };
  },
  computed: {
    potatoStyle() {
      const x = this.pos.x / DAMP_X_DRAG;
      const posY = this.pos.y;
      const dampY = this.canSend ? 1 : DAMP_NEGATIVE_Y_DRAG;
      const y = posY > 0 ? posY / DAMP_POSITIVE_Y_DRAG : posY / dampY;
      return {
        transform: `translate(${x}px, ${y}px)`,
        width: `${this.dragging ? DRAGGING_POTATO_WIDTH : START_POTATO_WIDTH}px`,
        'margin-right': `${this.dragging ? 30 : 0}px`,
      };
    },
  },
  methods: {
    startDrag(e) {
      const evt = e.changedTouches ? e.changedTouches[0] : e;
      dynamics.stop(this.pos);
      this.dragging = true;
      this.start.x = evt.pageX - this.pos.x;
      this.start.y = evt.pageY - this.pos.y;
      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.onRelease);
      window.addEventListener('touchmove', this.onDrag);
      window.addEventListener('touchend', this.onRelease);
    },
    onDrag(e) {
      e.stopPropagation();
      if (this.dragging) {
        const evt = e.changedTouches ? e.changedTouches[0] : e;
        this.pos.x = evt.pageX - this.start.x;
        this.pos.y = evt.pageY - this.start.y;
      }
    },
    onRelease(e) {
      e.stopPropagation();
      if (this.dragging) {
        const evt = e.changedTouches ? e.changedTouches[0] : e;
        this.dragging = false;
        if (evt.pageY > this.passPosition || !this.canSend) { // Does not send
          if (!this.canSend) this.remindInput();
          dynamics.animate(this.pos, {
            x: 0,
            y: 0,
          }, {
            type: dynamics.spring,
            duration: 1000,
            frequency: 300,
            friction: 300,
          });
        } else {
          dynamics.animate(this.pos, {
            x: 0,
            y: this.pos.y - EXIT_POSITION,
          }, {
            type: dynamics.spring,
            duration: 1000,
            frequency: 300,
            friction: 300,
          });
          this.send();
        }
        window.removeEventListener('mousemove', this.onDrag);
        window.removeEventListener('mouseup', this.onRelease);
        window.removeEventListener('touchmove', this.onDrag);
        window.removeEventListener('touchend', this.onRelease);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.potato {
  transition: width .5s ease, margin-right .5s ease;
  margin-top: 20px;
  &.inFront { z-index: 5; }
  .body {
    fill: url(#linear-gradient);
    cursor: grab;
    transform-origin: center;
    transition: transform .25s ease;
    &.dragging {
      animation: potato-dragging .15s linear alternate infinite;
    }
    &:hover {
      transform: scale(.95);
    }
  }
  .spot{
    fill: #e5901a;
  }
  .spots__group {
    animation: spots 5s ease alternate infinite;
  }
}

@keyframes spots {
  100% {
    transform: translateX(2.5px);
  }
}
@keyframes potato-dragging {
  0% {
    transform: scale(.95) rotate(-2.5deg);
  }
  100% {
    transform: scale(.95) rotate(2.5deg);
  }
}
</style>
