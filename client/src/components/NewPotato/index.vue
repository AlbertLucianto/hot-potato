<template>
<div class="newPotatoPage__container">
  <potato-animate/>
</div>
</template>

<script>
import PotatoAnimate from './PotatoAnimate';

export default {
  components: {
    PotatoAnimate,
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
}
</style>
