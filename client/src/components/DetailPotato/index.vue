<template>
  <div class="potatoDetail__container">
    <img class="potatoIcon" src="../../assets/SVG/list_dropped.svg" v-if="categoryByDate(potato) === category.dropped.name"/>
    <img class="potatoIcon" src="../../assets/SVG/list_relax.svg" v-else-if="categoryByDate(potato) === category.relax.name"/>
    <img class="potatoIcon" src="../../assets/SVG/list_medium.svg" v-else-if="categoryByDate(potato) === category.medium.name"/>
    <img class="potatoIcon" src="../../assets/SVG/list_urgent.svg" v-else-if="categoryByDate(potato) === category.urgent.name"/>
    <div class="content__text">{{ displayText(potato).value }}</div>
    <div class="content__text">{{ displayText(potato).scale }}</div>
  </div>
</template>

<script>
const calcDiffTime = ISODate => (new Date(ISODate).getTime() - new Date().getTime()) / 1000;

export default {
  props: {
    potato: {
      type: Object,
      required: true,
    },
    from: Object,
    selected: Boolean,
  },
  data() {
    return {
      category: {
        dropped: { name: 'DROPPED', limit: 0 },
        relax: { name: 'RELAX', limit: 7 * 24 * 3600 },
        medium: { name: 'MEDIUM', limit: 24 * 3600 },
        urgent: { name: 'URGENT', limit: 2 * 3600 },
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
        if (time < 0) return { value: `Dropped at ${new Date(potato.droppedDate).toDateString()}` };
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
  },
};
</script>

<style lang="scss" scoped>
.potatoDetail__container {
  width: 120px;
  height: 180px;
  margin: 10px;
  border-radius: 10px;
  box-shadow: 0 10px 30px -5px rgba(0,0,0,.2);
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: white;
  border: 1px solid #EDEDEF;
  .potatoIcon {
    max-height: 100px;
    max-width: 100px;
    margin: 10px;
  }
  .content__text {
    font-size: 12px;
  }
  &:hover {
    cursor: pointer;
  }
}
</style>