<template>
<div>
  <div class="overlaySearching" v-if="searching">
    <div class="searchResults" v-if="search">
      <div class="result__item" v-for="resultItem in results" :key="resultItem.id" @click="handleSelectUser(resultItem)">
        <div class="resultItem resultItem__name">{{ resultItem.name }}</div>
        <div class="resultItem resultItem__email">{{ resultItem.email }}</div>
      </div>
      <img class="loadingIcon" src="../assets/SVG/loading-cylon.svg" v-if="loading"/>
    </div>
  </div>
  <div class="input__wrapper" :class="{ searching, selected: !!selectedUser, emphasized, jerked }">
    <img class="cancel__button" src="../assets/SVG/cross_dark.svg" v-if="searching" @click="cancelSearch"/>
    <input v-model="search" placeholder="Whom to pass?" :class="{ searching, selected: selectedUser }" @focus="searchFocus"/>
    <img class="tick__button" src="../assets/SVG/tick_dark.svg" v-if="searching && selectedUser" @click="closeSearch"/>
    <div class="selectedUser__email" v-if="selectedUser && !searching">{{ selectedUser.email }}</div>
  </div>
</div>
</template>

<script>
const TYPING_TIMEOUT_TIME = 300;

export default {
  props: {
    setSearch: Function,
    emphasized: Boolean,
    selectedUser: Object,
    selectUser: Function,
    jerked: Boolean,
    cancel: Function,
    setSearching: Function,
    results: Array,
  },
  data() {
    return {
      search: '',
      searching: false,
      typing: false,
      typingTimeout: undefined,
    };
  },
  watch: {
    search(word) {
      clearTimeout(this.typingTimeout);
      this.typing = true;
      this.typingTimeout = setTimeout(() => {
        this.typing = false;
        if (typeof this.setSearch === 'function') {
          this.setSearch(word);
        }
      }, TYPING_TIMEOUT_TIME);
    },
    searching(val) {
      if (typeof this.setSearching === 'function') {
        this.setSearching(val);
      }
    },
  },
  methods: {
    cancelSearch() {
      this.searching = false;
      this.search = '';
      if (typeof this.cancel === 'function') {
        this.cancel();
      }
    },
    closeSearch() {
      this.searching = false;
      this.search = this.selectedUser.name;
    },
    searchFocus() { this.searching = true; },
    handleSelectUser(user) {
      this.searching = false;
      this.search = user.name;
      if (typeof this.selectUser === 'function') {
        this.selectUser(user);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$pink: rgb(255,45,85);
$red: rgb(255,59,48);
$purple: rgb(88,86,214);
$orange: rgb(255,149,0);
$darkOrange: rgb(245,140,0);

.input__wrapper {
  position: absolute;
  width: 60%;
  height: 50px;
  top: 60px;
  left: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 5px;
  transition: all .1s ease;
  user-select: none;
  &.searching {
    top: 0;
    height: 75px;
    width: 100%;
    left: 0;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    user-select: unset;
  }
  &.selected {
    box-shadow: 0 0 20px -5px $orange;
    input {
      color: $darkOrange;
    }
  }
  &.emphasized {
    transition: transform .2s ease;
    box-shadow: 0 0 30px -5px $red;
    transform: scale(1.3) rotate(-2deg);
    input::placeholder {
      font-size: 1.2rem;
    }
  }
  &.jerked {
    margin-top: 50px;
  }
  input {
    text-align: center;
    width: 60%;
    flex-grow: 1;
    margin-top: -2.5px;
    height: 30px;
    font-size: 1.5rem;
    font-weight: 300;
    &.searching {
      margin-right: 60px;
      margin-top: 0;
    }
    &.searching.selected {
      margin-right: 0;
    }
    &::placeholder {
      font-size: 1rem;
      user-select: none;
    }
  }
  .cancel__button {
    width: 17.5px;
    margin: 0 20px;
    opacity: .8;
    transition: opacity .2s ease;
    &:hover {
      opacity: .9;
      cursor: pointer;
    }
  }
  .tick__button {
    width: 17.5px;
    margin: 0 20px;
    opacity: .8;
    transition: opacity .2s ease;
    &:hover {
      opacity: .9;
      cursor: pointer;
    }
  }
  .selectedUser__email {
    position: absolute;
    bottom: -30px;
    font-size: .9rem;
    font-weight: 300;
    color: white;
  }
}
.overlaySearching {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    border-radius: 15px;
    background-color: rgba(255,255,255,.8);
    .searchResults {
      margin-top: 100px;
      .result__item {
        margin: 0 10px;
        padding: 10px;
        text-align: left;
        border: 1px solid rgba(0,0,0,0);
        border-bottom: 1px solid rgba(0,0,0,.1);
        transition: border .2s ease;
        .resultItem {
          margin: 5px;
          &__name {
            font-weight: 600;
          }
          &__email {
            color: $darkOrange;
          }
        }
        &:hover {
          border: 1px solid $orange;
          border-radius: 5px;
          box-shadow: 0 5px 20px -5px rgba(0,0,0,.1);
          background-color: rgba(255,255,255,.8);
          cursor: pointer;
          &:active {
            background: white;
          }
        }
      }
      .loadingIcon {
        margin-top: 30px;
        width: 100px;
      }
    }
  }
</style>
