<template>
  <div class="query-builder-rule">
    <img
      v-if="showDragHandle"
      class="query-builder__draggable-handle"
      src="./grip-vertical-solid.svg"
      alt="Drag element to target"
    />
    <template v-if="$slots.rule">
      <slot name="rule" v-bind="ruleSlotProps"></slot>
    </template>
    <template v-else>
      <span class="query-builder-rule__name" v-text="definition.name"></span>
      <div class="query-builder-rule__component-container">
        <component :is="component" :modelValue="ruleData" @update:modelValue="setRuleData" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeMount, PropType } from 'vue';
  import { QueryBuilderConfig, Rule } from './types';
  import { isQueryBuilderConfig } from './guards';

  const props = defineProps({
    config: {
      type: Object as PropType<QueryBuilderConfig>,
      required: true,
      validator: (param) => isQueryBuilderConfig(param),
    },
    query: Object as PropType<Rule>,
  });

  const emit = defineEmits(['query-update']);

  const definition = computed(() => {
    const ruleDefinition = props.config.rules.find(
      (rule) => rule.identifier === props.query?.identifier,
    );

    if (ruleDefinition) {
      return ruleDefinition;
    }

    throw new Error(
      `Invalid identifier "${props.query?.identifier}": no rule definition available.`,
    );
  });

  const component = computed(() => {
    return definition.value.component;
  });

  onBeforeMount(() => console.log(ruleData.value));

  const ruleData = computed(() => {
    console.log('QueryBuilderRule query', props.query)
    return props.query?.value;
  });

  function setRuleData(update: any) {
    ruleUpdate(update);
  }

  const ruleSlotProps = computed(() => {
    return {
      ruleComponent: component.value,
      ruleData: ruleData.value,
      updateRuleData: (ruleData: any) => setRuleData(ruleData),
    };
  });

  function ruleUpdate(update: any) {
    emit('query-update', {
      identifier: props.query?.identifier,
      ruleId: props.query?.ruleId,
      value: update,
    } as Rule);
  }

  const showDragHandle = computed(() => {
    if (props.config.dragging) {
      return !props.config.dragging.disabled;
    }

    return false;
  });
</script>

<style lang="less" scoped>
  .query-builder-rule {
    position: relative;
    background-color: hsl(0, 0, 95%);
    padding: 16px;
    padding-right: 32px;
    display: flex;
    flex-direction: row;

    .query-builder__draggable-handle {
      display: none;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 4px;
      width: 8px;
      cursor: move;
    }

    &:hover .query-builder__draggable-handle {
      display: block;
    }
  }

  .query-builder-rule__name {
    margin-right: 16px;
    font-weight: bold;
  }

  .query-builder-rule__component-container {
    flex: 1;
  }
</style>
