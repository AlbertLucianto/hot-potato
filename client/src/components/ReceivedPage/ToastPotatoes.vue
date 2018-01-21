<template>
<div class="toastPotatoes__container" v-if="holders.length" @click="popHolder">
  <detail-potato :potato="holders[0].potato" :selected="false"
    class="potato__card" :class="{ 'animated bounceIn': entering }"/>
  <div class="senderDetail">
    <div class="sender__description">Sent from</div>
    <div class="sender__name">{{ holders[0] && holders[0].passedFrom.name }}</div>
  </div>
</div>
</template>

<script>
import DetailPotato from '@/components/DetailPotato';

const ENTER_ANIMATE_TIME = 500;

export default {
  components: {
    DetailPotato,
  },
  props: {
    queue: Array,
  },
  data() {
    return {
      holders: [],
      entering: false,
    };
  },
  watch: {
    queue(list) {
      this.holders = [...(list || [])];
    },
  },
  methods: {
    popHolder() {
      this.entering = true;
      this.holders.shift();
      setTimeout(() => {
        this.entering = false;
      }, ENTER_ANIMATE_TIME);
    },
  },
};
</script>

<style lang="scss" scoped>
.toastPotatoes__container {
  box-sizing: border-box;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0,0,0,.8);
  z-index: 15;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  cursor: pointer;
  .potato__card {
    pointer-events: none;
    animation-duration: 500ms;
  }
  .senderDetail {
    color: white;
    margin: 25px;
    .sender__description {
      opacity: .8;
      font-weight: 500;
    }
    .sender__name {
      font-weight: 600;
      font-size: 36px;
      max-width: 200px;
      margin: auto;
      align-items: center;
    }
  }
}
</style>
