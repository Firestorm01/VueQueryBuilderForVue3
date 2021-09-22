<template>
  <div class="query-builder-group">
    <div class="query-builder-group__control">
      <template v-if="$slots.groupOperator">
        <div class="query-builder-group__group-selection-slot">
          <img
            v-if="showDragHandle"
            class="query-builder__draggable-handle"
            src="./grip-vertical-solid.svg"
            alt="Drag element to target"
          />
          <slot name="groupOperator" v-bind="groupOperatorSlotProps"></slot>
        </div>
      </template>
      <template v-else>
        <div class="query-builder-group__group-selection">
          <img
            v-if="showDragHandle"
            class="query-builder__draggable-handle"
            src="./grip-vertical-solid.svg"
            alt="Drag element to target"
          />
          <span class="query-builder-group__group-operator">Operator</span>
          <select v-model="selectedOperator">
            <option disabled value="">Select an operator</option>
            <option
              v-for="operator in operators"
              :key="operator.identifier"
              :value="operator.identifier"
              v-text="operator.name"
            ></option>
          </select>
        </div>
      </template>
      <template v-if="$slots.groupControl">
        <slot name="groupControl" v-bind="groupControlSlotProps"></slot>
      </template>
      <template v-else>
        <div class="query-builder-group__group-control">
          <select v-model="selectedRule">
            <option disabled value="">Select a rule</option>
            <option
              v-for="rule in rules"
              :key="rule.identifier"
              :value="rule.identifier"
              v-text="rule.name"
            ></option>
          </select>
          <button
            :disabled="selectedRule === ''"
            @click="addRule"
            class="query-builder-group__rule-adding-button"
          >
            Add Rule
          </button>
          <div class="query-builder-group__spacer"></div>
          <button @click="newGroup" class="query-builder-group__group-adding-button">
            Add Group
          </button>
        </div>
      </template>
    </div>
    <Draggable
      class="query-builder-group__group-children"
      :class="childDepthClass"
      :style="getBorderStyle"
      tag="div"
      v-bind="dragOptions"
      v-model="children"
      :item-key="'ruleId'"
    >
      <template #item="{ element, index }">
        <QueryBuilderChild
          :config="config"
          :query="element"
          :depth="childDepth"
          @query-update="updateChild(index, $event)"
          @delete-child="deleteChild(index)"
          class="query-builder-group__child"
        >
          <template v-for="(_, slotName) in $slots" #[slotName]="propss">
            <slot :name="slotName" v-bind="propss"></slot>
          </template>
        </QueryBuilderChild>
      </template>
    </Draggable>
  </div>
</template>

<script lang="ts" setup>
  import { computed, PropType, ref } from 'vue';
  import Draggable from 'vuedraggable';
  import Sortable from 'sortablejs';
  import { QueryBuilderConfig, RuleSet, Rule } from './types';
  import { isQueryBuilderConfig } from './guards';
  import QueryBuilderChild from './QueryBuilderChild.vue';

  const props = defineProps({
    config: {
      type: Object as PropType<QueryBuilderConfig>,
      required: true,
      validator: (param) => isQueryBuilderConfig(param),
    },
    query: Object as PropType<RuleSet>,
    depth: Number,
  });

  const emit = defineEmits(['query-update']);

  const selectedOperator = computed({
    get: () => props.query?.operatorIdentifier,
    set: (operatorIdentifier) => {
      console.log('selectedOperator set', operatorIdentifier);
      emit('query-update', {
        ...props.query,
        operatorIdentifier,
      } as RuleSet);
    },
  });

  const trap = ref<((position: number, newChild: RuleSet | Rule) => void) | null>(null);

  const selectedRule = ref('');

  const children = computed({
    get: () => {
      return props.query ? [...props.query.children] : [];
    },
    set: (val) => {
      props.query!.children = val;
    }
  });

  const operators = computed(() => props.config.operators);

  const rules = computed(() => props.config.rules);

  const childDepth = computed(() => (props.depth ?? 0) + 1);

  const childDepthClass = computed(
    () => `query-builder-group__group-children--depth-${childDepth.value}`,
  );

  const borderColor = computed(() => {
    if (props.config.colors && props.config.colors.length > 0) {
      return props.config.colors[(props.depth ?? 0) % props.config.colors.length];
    }
    return '';
  });

  const getBorderStyle = computed(() => {
    if (borderColor.value) {
      return `border-color: ${borderColor.value}`;
    }

    // Ignore borders
    return 'border-left: 0';
  });

  const groupOperatorSlotProps = computed(() => {
    return {
      currentOperator: selectedOperator.value,
      operators: operators.value,
      updateCurrentOperator: (newOperator: string) => {
        emit('query-update', {
          ...props.query,
          operatorIdentifier: newOperator,
        } as RuleSet);
      },
    };
  });

  const groupControlSlotProps = computed(() => {
    return {
      rules: rules.value,
      addRule: (newRule: string) => {
        const currentRule = selectedRule.value;
        selectedRule.value = newRule;
        addRule();
        selectedRule.value = currentRule;
      },
      newGroup: (): void => newGroup(),
    };
  });

  const dragOptions: any = computed(() => {
    if (props.config.dragging) {
      return props.config.dragging;
    }

    return {
      disabled: true,
    } as Sortable.SortableOptions;
  });

  const showDragHandle = computed(() => {
    return !(dragOptions.value.disabled || props.depth === 0);
  });

  function addRule(): void {
    console.log('addRule');
    const newChildren = [...children.value];

    const selectedRuleDefinition = props.config.rules.find(
      (rule) => rule.identifier === selectedRule.value,
    );
    if (!selectedRuleDefinition) {
      throw new Error(`Rule identifier "${selectedRule.value}" is invalid.`);
    }

    if (
      typeof selectedRuleDefinition.initialValue === 'object' &&
      selectedRuleDefinition.initialValue !== null
    ) {
      throw new Error(
        `"initialValue" of "${selectedRuleDefinition.identifier}" must not be an object - use a factory function!`,
      );
    }

    let value: any = null; // null as sensitive default...
    if (typeof selectedRuleDefinition.initialValue !== 'undefined') {
      // If a valid has been passed along, use it
      value = selectedRuleDefinition.initialValue;
    }
    if (typeof value === 'function') {
      // initialValue is a factory function
      value = value();
    }

    newChildren.push({
      identifier: selectedRuleDefinition.identifier,
      ruleId: Date.now(),
      value,
    } as Rule);

    emit('query-update', {
      operatorIdentifier: selectedOperator.value,
      children: newChildren,
    } as RuleSet);

    console.log('addRule ', newChildren);

    // Reset selection
    selectedRule.value = '';
  }

  function newGroup(): void {
    const newChildren = [...children.value];
    newChildren.push({
      operatorIdentifier: props.config.operators[0].identifier,
      children: [],
    } as RuleSet);

    emit('query-update', {
      operatorIdentifier: selectedOperator.value,
      children: newChildren,
    } as RuleSet);
  }

  function updateChild(position: number, newChild: RuleSet | Rule): void {
    if (trap.value) {
      trap.value(position, newChild);

      return;
    }

    const newChildren = [...children.value];
    newChildren.splice(position, 1, newChild); // Replace child

    emit('query-update', {
      operatorIdentifier: selectedOperator.value,
      children: newChildren,
    } as RuleSet);
  }

  function deleteChild(idx: number): void {
    const newChildren = [...children.value];
    newChildren.splice(idx, 1);

    emit('query-update', {
      operatorIdentifier: selectedOperator.value,
      children: newChildren,
    } as RuleSet);
  }
</script>

<style lang="less" scoped>
  .query-builder-group {
    display: flex;
    flex-direction: column;
  }

  .query-builder-group__group-selection {
    padding: 16px;
    background-color: hsl(0, 0, 95%);
  }

  .query-builder-group__group-selection,
  .query-builder-group__group-selection-slot {
    position: relative;

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

  .query-builder-group__group-operator {
    margin-right: 16px;
    font-weight: bold;
  }

  .query-builder-group__group-control {
    padding: 16px;
    display: flex;
    flex-direction: row;
  }

  .query-builder-group__rule-adding-button {
    margin-left: 8px;
  }

  .query-builder-group__spacer {
    width: 0;
    margin: auto 12px;
    border-left: 1px solid hsl(0, 0%, 75%);
  }

  .query-builder-group__group-children {
    margin: 8px 0 8px 16px;
    margin-bottom: 0;
    border-left-width: 2px;
    border-left-style: solid;
  }

  .query-builder-group__child:not(:last-child) {
    margin-bottom: 12px;
  }
</style>
