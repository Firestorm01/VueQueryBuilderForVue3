<template>
  <div class="query-builder-child">
    <component
      :is="component"
      :config="config"
      :query="query"
      :depth="depth"
      @query-update="emit('query-update', $event)"
      class="query-builder-child__component"
    >
      <template v-for="(_, slotName) in $slots" #[slotName]="propss">
        <slot :name="slotName" v-bind="propss"></slot>
      </template>
    </component>
    <button
      aria-label="Close"
      class="query-builder-child__delete-child"
      @click="emit('delete-child')"
    >
      <span aria-hidden="true">×</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
  import { computed, defineAsyncComponent, PropType } from 'vue';
  import { RuleSet, Rule, QueryBuilderConfig } from './types';
  import { isRule, isRuleSet, isQueryBuilderConfig } from './guards';

  const props = defineProps({
    config: {
      type: Object as PropType<QueryBuilderConfig>,
      require: true,
      validator: (param) => isQueryBuilderConfig(param),
    },
    query: {
      type: Object as PropType<RuleSet | Rule>,
      require: true,
      validator: (query) => isRule(query) || isRuleSet(query),
    },
    depth: {
      type: Number,
    },
  });

  const emit = defineEmits(['query-update', 'delete-child']);

  const isRuleComputed = computed(() => {
    return isRule(props.query);
  });

  const isRuleSetComputed = computed(() => {
    return isRuleSet(props.query);
  });

  const ruleDefinition = computed(() => {
    if (!isRuleComputed.value) {
      return null;
    }

    const ruleDefinition = props.config?.rules.find(
      (definition) => definition.identifier === (props.query as Rule).identifier,
    );

    return ruleDefinition || null;
  });

  const queryBuilderRule: any = defineAsyncComponent(() => import('./QueryBuilderRule.vue'));
  const queryBuilderGroup: any = defineAsyncComponent(() => import('./QueryBuilderGroup.vue'));
  const component: any = computed(() => {
    if (isRuleComputed.value && ruleDefinition) {
      return queryBuilderRule;
    }

    if (isRuleSetComputed.value) {
      return queryBuilderGroup;
    }

    throw new Error('No component definition available.');
  });

  const definition = computed(() => {
    if (isRuleComputed.value && ruleDefinition) {
      return ruleDefinition;
    }

    if (isRuleSetComputed.value) {
      return null;
    }

    throw new Error('No component definition available.');
  });
</script>

<style lang="less" scoped>
  .query-builder-child {
    display: flex;
    flex-flow: row;
    position: relative;
  }

  .query-builder-child__component {
    flex: 1;
  }

  .query-builder-child__delete-child {
    position: absolute;
    top: 16px;
    right: 8px;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
    color: #000;
    text-shadow: 0 1px 0 #fff;
    opacity: 0.5;
    padding: 0;
    background-color: transparent;
    border: 0;
    appearance: none;
    cursor: pointer;
  }
</style>
