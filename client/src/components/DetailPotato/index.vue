<template>
  <div class="potatoDetail__container" :class="{ selected, hidden }" @mousedown="handleClick(potato.id)">
    <!-- using if else to make it static (hashed) instead of media -->
    <img class="potatoIcon" src="../../assets/SVG/list_dropped.svg" v-if="categoryByDate(potato) === category.dropped.name"/>
    <img class="potatoIcon" src="../../assets/SVG/list_relax.svg" v-else-if="categoryByDate(potato) === category.relax.name"/>
    <img class="potatoIcon" src="../../assets/SVG/list_medium.svg" v-else-if="categoryByDate(potato) === category.medium.name"/>
    <img class="potatoIcon" src="../../assets/SVG/list_urgent.svg" v-else-if="categoryByDate(potato) === category.urgent.name"/>
    <div class="potato__details">
      <div class="time__value">{{ displayText(potato).value }}</div>
      <div class="time__scale">{{ displayText(potato).scale }}</div>
      <div class="time__info">{{ displayText(potato).info }}</div>
      <div v-if="selected" v-for="detail in details" :key="detail.label" class="potato__detail">
        <div class="detail__label">{{ detail.label }}</div>
        <div class="detail__value">{{ detail.value }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';

export const calcDiffTime = ISODate => (new Date(ISODate).getTime() - new Date().getTime()) / 1000;

export default {
  props: {
    userId: String,
    potato: {
      type: Object,
      required: true,
    },
    from: Object,
    hidden: Boolean,
    selected: Boolean,
    select: Function,
    deselect: Function,
    loading: 0,
  },
  data() {
    return {
      category: {
        dropped: { name: 'DROPPED', limit: 0 },
        relax: { name: 'RELAX', limit: 12 * 3600 },
        medium: { name: 'MEDIUM', limit: 6 * 3600 },
        urgent: { name: 'URGENT' },
      },
    };
  },
  computed: {
    categoryByDate() {
      return (potato) => {
        const time = calcDiffTime(potato.droppedDate);
        if (time < 0) return this.category.dropped.name;
        if (time > this.category.relax.limit) return this.category.relax.name;
        if (time > this.category.medium.limit) return this.category.medium.name;
        return this.category.urgent.name;
      };
    },
    displayText() {
      return (potato) => {
        const time = calcDiffTime(potato.droppedDate);
        if (time < 0) return { info: `Dropped at ${new Date(potato.droppedDate).toDateString()}` };
        if (time > 24 * 3600) {
          const value = Math.floor(time / 24 / 3600);
          return { value, scale: `day${value > 1 ? 's' : ''}` };
        } if (time > 3600) {
          const value = Math.floor(time / 3600);
          return { value, scale: `hour${value > 1 ? 's' : ''}` };
        } if (time > 60) {
          const value = Math.floor(time / 60);
          return { value, scale: `minute${value > 1 ? 's' : ''}` };
        }
        const value = Math.floor(time);
        return { value, scale: `second${value > 1 ? 's' : ''}` };
      };
    },
    details() {
      const { duration, createdBy, lastHeldBy } = this.Potato ? this.Potato : {};
      const { from } = this;

      return this.Potato ? [
        { label: 'Duration', value: `${duration} hour${duration <= 1 ? '' : 's'}` },
        { label: 'Created By', value: createdBy.id === this.userId ? 'You' : createdBy.name },
        { label: 'Passed From', value: from.id === this.userId ? 'You' : from.name },
        { label: 'Last Held By', value: lastHeldBy.id === this.userId ? 'You' : lastHeldBy.name },
      ] : [];
    },
  },
  apollo: {
    $loadingKey: 'loading',
    Potato() {
      return {
        query: gql`query getDetail($id: ID!) {
          Potato(id: $id) {
            duration
            createdBy {
              name
              id
            }
            lastHeldBy {
              name
              id
            }
          }
        }`,
        variables() {
          return {
            id: this.potato.id,
          };
        },
        skip() {
          return !this.selected;
        },
        fetchPolicy: 'cache-and-network',
        result(data) {
          console.log(data); // eslint-disable-line no-console
        },
      };
    },
  },
  methods: {
    handleClick(potatoId) {
      if (this.selected) {
        this.deselect();
      } else {
        this.select(potatoId);
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

.potatoDetail__container {
  user-select: none;
  box-sizing: border-box;
  width: 150px;
  height: 200px;
  margin: 10px;
  border-radius: 10px;
  box-shadow: 0 5px 15px -5px rgba(0,0,0,.2);
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: white;
  border: 1px solid #EBEBED;
  transition: transform .2s ease;
  &:hover:not(.selected) {
    transform: scale(1.02) translateY(-5px);
    box-shadow: 0 10px 25px -10px $orange;
  }
  .potatoIcon {
    max-height: 100px;
    max-width: 100px;
    margin: 10px;
  }
  .potato__details {
    min-width: 100px;
    text-align: left;
    margin: 10px;
    padding: 0 10px;
    .time__value {
      font-weight: 600;
    }
    .time__scale {
      font-size: 12px;
    }
    .time__info {
      font-size: 14px;
      color: #666;
    }
    .potato__detail {
      margin-bottom: 15px;
      .detail__label {
        font-size: 12px;
        color: $darkOrange;
      }
      .detail__value {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }
    }
  }
  &.selected {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    margin: 0;
    padding: 40px 20px 80px 20px;
    flex-direction: row;
    z-index: 1;
    .potatoIcon {
      max-height: 250px;
      max-width: 180px;
      flex-grow: 1;
      margin: 30px;
    }
    .potato__details {
      min-width: 80px;
      padding: 0 20px;
      .time__value {
        font-size: 36px;
        color: #333;
      }
      .time__scale {
        font-size: 20px;
        color: $red;
        margin-bottom: 30px;
      }
      .time__info {
        margin-bottom: 20px;
      }
    }
  }
  
  &:hover {
    cursor: pointer;
  }
}
</style>
