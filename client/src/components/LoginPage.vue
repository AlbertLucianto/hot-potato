<template>
  <button @click="authenticateUser">Login</button>
</template>

<script>
import gql from 'graphql-tag';

export default {
  methods: {
    authenticateUser() {
      this.$apollo.mutate({
        mutation: gql`mutation ($email: String!, $password: String!) {
          authenticateUser(email: $email, password: $password) {
            id
            token
          }
        }`,
        variables: {
          email: 'albe0011@e.ntu.edu.sg',
          password: 'password',
        },
      }).then(res => console.log(res));
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
