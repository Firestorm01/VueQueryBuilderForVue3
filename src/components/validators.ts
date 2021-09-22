import { isQueryBuilderConfig, isRuleSet, isRule } from './guards';

export const queryValidator = (query) => query === null || isRuleSet(query);
export const childQueryValidator = (query) => isRule(query) || isRuleSet(query);
export const configValidator = (param) => isQueryBuilderConfig(param);
