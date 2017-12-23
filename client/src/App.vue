<template>
  <div id="app">
    <div class="routerComponent__container">
      <router-view/>
      <revolver-nav/>
    </div>
  </div>
</template>

<script>
import RevolverNav from '@/components/RevolverNav';

export default {
  name: 'app',
  components: {
    RevolverNav,
  },
  methods: {
  },
};
</script>

<style lang="scss">
body {
  background-color: #445;
  margin: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.routerComponent__container {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  width: 414px;
  height: 733px;
  background: #FFF;
  border-radius: 15px;
  box-shadow: 0 20px 50px -25px rgba(0,0,0,.2);
  overflow: hidden;
  @media screen and (max-width: 414px) {
    border-radius: 0;
  }
}
</style>
