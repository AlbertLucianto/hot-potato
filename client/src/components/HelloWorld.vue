<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>{{ Potato }}</h2>
    <h2>Essential Links</h2>
    <ul>
      <li><a href="https://vuejs.org" target="_blank">Core Docs</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank">Forum</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank">Community Chat</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank">Twitter</a></li>
      <br>
      <li><a href="http://vuejs-templates.github.io/webpack/" target="_blank">Docs for This Template</a></li>
    </ul>
    <h2>Ecosystem</h2>
    <ul>
      <li><a href="http://router.vuejs.org/" target="_blank">vue-router</a></li>
      <li><a href="http://vuex.vuejs.org/" target="_blank">vuex</a></li>
      <li><a href="http://vue-loader.vuejs.org/" target="_blank">vue-loader</a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank">awesome-vue</a></li>
    </ul>
  </div>
</template>

<script>
import gql from 'graphql-tag';

export default {
  name: 'HelloWorld',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
    };
  },
  apollo: {
    $client: 'main',
    Potato() {
      return {
        query: gql`query receivers {
          Potato(id: "cjbf58s4v00v501276z3h384k") {
            droppedDate
            holders {
              id
              sequence
            }
          }
        }`,
        headers() {
          return {
            Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1MTM3NTg5NTcsImNsaWVudElkIjoiY2piOHlkOXF1MDAwMDAxMDRrNHdtdWs2OSIsInByb2plY3RJZCI6ImNqYmVzenMwdTAwMDIwMTI3djV4MTV1dWMiLCJwZXJtYW5lbnRBdXRoVG9rZW5JZCI6ImNqYmVzenl6ajAwMmowMTI3M25vdzZhdmcifQ.600UcD18Z0bWB2l52f6JHwd2XLRDI2mQJ0sObbWAH5w',
          };
        },
        result(result) {
          console.log(result);
        },
        fetchPolicy: 'cache-and-network',
      };
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
