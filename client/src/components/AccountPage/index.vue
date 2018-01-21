<template>
  <div class="accountPage__container" :class="{ loading }">
    <div class="account__notification" :class="{ show: notification }">{{ notification }}</div>
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
      <div class="buttons__container">
        <div class="button" :class="{ disabled: loading }" v-if="!!userId" @mousedown="logoutUser">Logout</div>
        <div class="buttons__group" :class="{ disabled: !email || !password }" v-if="!userId">
          <div class="button button__login" v-if="!signingUp" :class="{ disabled: loading }" @mousedown="authenticateUser">Login</div>
          <div class="button button__signup" :class="{ disabled: loading, input__wrapper: signingUp, active: active === 2 }" @mousedown="signup">
            <div v-if="!signingUp">Signup</div>
            <img v-if="signingUp" src="../../assets/SVG/cross.svg" class="button__icon cancel" @click="cancelSignup"/>
            <input v-if="signingUp" v-model="nickname" placeholder="What should we call you?"
              @focus="setActive(2)" @blur="setActive(-1)" :class="{ inactive: active !== 2 }"/>
            <img v-if="signingUp" src="../../assets/SVG/tick.svg" class="button__icon confirm" :class="{ disabled: !nickname }" @mousedown="signupUser"/>
          </div>
        </div>
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
      nickname: '',
      active: -1,
      loading: 0,
      signingUp: false,
      notification: '',
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
        fetchPolicy: 'cache-and-network',
      };
    },
  },
  methods: {
    setActive(credential) {
      this.active = credential;
    },
    authenticateUser() {
      if (this.loading) return;
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
        this.loading -= 1;
        location.reload();
      }).catch((err) => {
        /* eslint-disable no-console */
        console.log(err);
        const messageAr = err.message.split('error: ');
        this.notification = messageAr[2];
        this.loading -= 1;
      });
    },
    logoutUser() {
      if (this.loading) return;
      localStorage.removeItem('AUTH_TOKEN');
      location.reload();
    },
    signup() {
      if (!this.signingUp) {
        this.signingUp = true;
      } else { // Confirm
      }
    },
    signupUser() {
      if (this.loading) return;
      this.loading += 1;
      const { email, password, nickname } = this;
      this.$apollo.mutate({
        mutation: gql`mutation signUp($nickname: String!, $email: String!, $password: String!) {
          signupUser(name: $nickname, email: $email, password: $password) {
            id
            token
          }
        }`,
        variables: {
          email,
          password,
          nickname,
        },
      }).then((res) => {
        localStorage.setItem('AUTH_TOKEN', res.data.signupUser.token);
        this.loading -= 1;
        location.reload();
      }).catch((err) => {
        /* eslint-disable no-console */
        console.log(err);
        const messageAr = err.message.split('error: ');
        this.notification = messageAr[2];
        this.loading -= 1;
      });
    },
    cancelSignup() {
      this.nickname = '';
      this.signingUp = false;
    },
    listenEnterKey(e) {
      const code = e.which || e.keyCode;
      if (code === 13 && !this.userId) {
        if (this.signingUp) {
          if (this.nickname) this.signupUser();
        } else if (this.email && this.password) this.authenticateUser();
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
.accountPage__container {
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
  .account__notification {
    position: absolute;
    top: -50px;
    padding: 20px;
    left: calc(50% - 150px);
    width: 300px;
    text-align: center;
    transition: all .5s ease;
    color: rgb(255,59,48);
    font-size: 1.1rem;
    text-shadow: 0 -5px 25px rgba(255,255,255,.5);
    font-weight: 600;
    &.show {
      top: 0;
    }
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
    }
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
    .buttons__group {
      display: flex;
      justify-content: center;
      align-items: center;
      transition: opacity .2s ease;
      &.disabled {
        opacity: .6;
        pointer-events: none;
      }
    }
    .button {
      width: 100px;
      height: 50px;
      margin: 0 10px;
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
      &__signup {
        background: rgba(255,204,0,.8);
        font-weight: 600;
        &.input__wrapper {
          width: 100vw;
          border-radius: 0;
          box-shadow: 0 0 0 white;
          &:active {
            background: rgb(255,204,.8);
          }
          &.active {
            height: 80px;
          }
          input::placeholder {
            font-size: .8em;
            font-weight: 600;
          }
          .inactive {
            color: #282830;
          }
          &:hover {
            box-shadow: 0 0 0 white;
          }
          input {
            text-align: center;
          }
        }
        .button__icon {
          margin: 0 30px;
          opacity: .9;
          transition: all .1s linear;
          &:hover {
            opacity: 1;
            transform: scale(1.05);
          }
          &.cancel {
            width: 20px;
          }
          &.confirm {
            width: 27.5px;
          }
          &.disabled {
            opacity: .35;
            pointer-events: none;
            &:hover {
              transform: none;
            }
          }
        }
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
