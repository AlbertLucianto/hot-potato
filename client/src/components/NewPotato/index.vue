<template>
<div class="newPotatoPage__container">
  <transition
    enter-active-class="animated bounceIn potatoAnimate"
    leave-active-class="animated bounceOut">
    <potato-animate v-if="showPotato"/>
  </transition>
  <temperature-setting/>
</div>
</template>

<script>
import PotatoAnimate from './PotatoAnimate';
import TemperatureSetting from './TemperatureSetting';

export default {
  components: {
    PotatoAnimate,
    TemperatureSetting,
  },
  data() {
    return {
      showPotato: false,
    };
  },
  mounted() {
    this.showPotato = true;
  },
};
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.newPotatoPage__container {
  height: 100%;
  width: 100%;
  padding: 50px;
  background: #232222;
  display: flex;
  justify-content: center;
  align-items: center;
  .potatoAnimate {
    animation-duration: .6s;
  }
}
</style>
