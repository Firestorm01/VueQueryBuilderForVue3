<template>
  <QueryBuilderGroup
    :config="queryBuiderConfig"
    :query="ruleSet"
    :depth="0"
    class="query-builder__root"
    @query-update="updateQuery"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="propss">
      <slot :name="slotName" v-bind="propss"></slot>
    </template>
  </QueryBuilderGroup>
</template>

<script lang="ts" setup>
  import { isQueryBuilderConfig, isRuleSet } from './guards';
  import { RuleSet, QueryBuilderConfig } from './types';
  import QueryBuilderGroup from './QueryBuilderGroup.vue';
  import { computed, PropType } from 'vue';

  const props = defineProps({
    value: {
      type: Object as PropType<RuleSet | null>,
      reuired: true,
      validator: (query) => query === null || isRuleSet(query),
    },
    config: {
      type: Object as PropType<QueryBuilderConfig>,
      reuired: true,
      validator: (param) => isQueryBuilderConfig(param),
    },
  });

  const emit = defineEmits(['update:value']);

  function updateQuery(newQuery: RuleSet): void {
    console.log('QueryBuilder updateQuery', newQuery);
    emit('update:value', { ...newQuery });
  }

  const ruleSet = computed(() => {
    if (props.value) {
      return props.value;
    }

    if (props.config?.operators.length === 0) {
      return {
        operatorIdentifier: '',
        children: [],
      } as RuleSet;
    }

    return {
      operatorIdentifier: props.config?.operators[0].identifier,
      children: [],
    } as RuleSet;
  });

  const queryBuiderConfig = computed(() => {
    if (!props.config?.dragging) {
      return props.config!;
    }

    // Ensure group parameter is unique... otherwise query builder instances would be able to drag
    // across 2 different instances and this is currently not supported.
    return {
      ...props.config,
      dragging: {
        handle: '.query-builder__draggable-handle',
        ...props.config?.dragging,
        group: `${new Date().getTime() * Math.random()}`,
      },
    } as QueryBuilderConfig;
  });
</script>

<style lang="less" scoped>
  .query-builder__root {
    display: flex;
    flex-flow: column;
  }
</style>
