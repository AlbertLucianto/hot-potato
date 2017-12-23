<template>
  <div class="loginPage__container" :class="{ loading }">
    <div class="flame__container">
      <loading-flame/>
    </div>
    <div class="formBox">
      <div v-if="User" class="detail">
        <div class="detail__name detail__item">{{ User.name }}</div>
        <div class="detail__email detail__item">{{ User.email }}</div>
      </div>
      <div class="formBox__credentials" v-if="!User">
        <div class="input__wrapper" :class="{ active: active === 0 }">
          <input v-model="email" type="text" placeholder="email"
            @focus="setActive(0)" @blur="setActive(-1)"/>
        </div>
        <div class="input__wrapper" :class="{ active: active === 1 }">
          <input v-model="password" type="password" placeholder="password"
            @focus="setActive(1)" @blur="setActive(-1)"/>
        </div>
      </div>
      <div class="loginLogoutButton" :class="{ disabled: loading }"
        @mousedown="authenticateUser">
        <div v-if="!loading">{{ userId ? 'Logout' : 'Login' }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';

import LoadingFlame from './LoadingFlame';

export default {
  props: {
    userId: String,
  },
  components: {
    LoadingFlame,
  },
  data() {
    return {
      email: '',
      password: '',
      active: -1,
      loading: 0,
    };
  },
  apollo: {
    $loadingKey: 'loading',
    User() {
      return {
        query: gql`query getUserDetail($id: ID!) {
          User(id: $id) {
            name
            email
          }
        }`,
        variables() {
          return {
            id: this.userId || '',
          };
        },
        skip() {
          return !this.userId;
        },
      };
    },
  },
  methods: {
    setActive(credential) {
      this.active = credential;
    },
    authenticateUser() {
      if (this.loading) {
        return;
      }
      if (this.userId) {
        localStorage.removeItem('AUTH_TOKEN');
        location.reload();
      } else {
        this.loading += 1;
        const { email, password } = this;
        this.$apollo.mutate({
          mutation: gql`mutation ($email: String!, $password: String!) {
            authenticateUser(email: $email, password: $password) {
              id
              token
            }
          }`,
          variables: {
            email,
            password,
          },
        }).then((res) => {
          localStorage.setItem('AUTH_TOKEN', res.data.authenticateUser.token);
          location.reload();
          this.loading -= 1;
        }).catch((err) => {
          /* eslint-disable no-console */
          console.log(err);
          this.loading -= 1;
        });
      }
    },
    listenEnterKey(e) {
      const code = e.which || e.keyCode;
      if (code === 13 && !this.userId) {
        this.authenticateUser();
      }
    },
  },
  mounted() {
    window.addEventListener('keydown', this.listenEnterKey);
  },
  destroyed() {
    window.removeEventListener('keydown', this.listenEnterKey);
  },
};
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.loginPage__container {
  height: 100%;
  width: 100%;
  padding: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  transition: background-color .8s ease;
  &.loading {
    background: #444;
    transition: background-color .3s ease;
  }
  .detail {
    padding: 10px;
    margin-bottom: 40px;
    .detail__item {
      margin: 20px;
      &.detail__name {
        font-weight: 600;
        font-size: 1.3rem;
      }
      &.detail__email {
        color: rgb(250,140,0);
      }
    }
  }
  .flame__container {
    height: 200px;
    width: 100px;
  }
  .formBox {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    min-height: 400px;
    &__credentials {
      margin-bottom: 50px;
      .input__wrapper {
        margin: 5px 20px;
        padding: 15px 25px;
        border: 1px solid rgba(255,255,255,.3);
        box-shadow: 0 7.5px 20px -5px rgba(0,0,0,.5);
        border-radius: 30px;
        background: #445;
        transition: all .2s ease .1s;
        &.active {
          transition: all .2s ease;
          background: #282830;
        }
        input {
          color: white;
          font-size: 1.15rem;
        }
      }
    }
    .loginLogoutButton {
      width: 100px;
      height: 50px;
      border-radius: 30px;
      font-weight: 500;
      box-shadow: 0 10px 40px -5px rgba(0,0,0,.2);
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all .2s ease;
      user-select: none;
      &.disabled {
        background: #AAA;
      }
      &:hover {
        box-shadow: 0 2.5px 5px rgba(0,0,0,.1);
        cursor: pointer;
      }
      &:active {
        background-color: #F0F0F0;
      }
    }
  }
}
</style>
