<template>
  <QueryBuilder :config="config" v-model:value="query" />
  <hr>
  <p>{{ query }}</p>
</template>

<script lang="ts" setup>
import { ref, shallowRef } from 'vue';
import QueryBuilder from './components/QueryBuilder.vue';
import { QueryBuilderConfig, RuleSet } from './components/types';
import DemoComponent from './DemoComponent.vue';

const query = ref<RuleSet | null>(null);

const config = ref<QueryBuilderConfig>({
  operators: [
    {
      name: 'AND',
      identifier: 'AND',
    },
    {
      name: 'OR',
      identifier: 'OR',
    },
  ],
  rules: [
    {
      identifier: 'a',
      name: 'TextA Selection',
      component: shallowRef(DemoComponent),
      initialValue: 'A',
    },
    {
      identifier: 'b',
      name: 'TextB Selection',
      component: shallowRef(DemoComponent),
      initialValue: 'B',
    },
  ],
  colors: ['hsl(88, 50%, 55%)', 'hsl(187, 100%, 45%)', 'hsl(15, 100%, 55%)'],
  dragging: {
    animation: 300,
    disabled: false,
    ghostClass: 'ghost',
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>