/**
 * @file src/application/services/rule-loading/RuleComposer.ts
 * @description Pure functions for composing and manipulating validation rules
 */

import { PraetorianRule, RuleConfig } from '../../../shared/types/rules';

/**
 * @interface RuleCompositionOptions
 * @description Options for rule composition
 */
export interface RuleCompositionOptions {
  includeCoreRules?: boolean;
  validateRules?: boolean;
}

/**
 * Composes rules from configuration
 * @param baseRules - Base rules to start with
 * @param config - Rule configuration
 * @param options - Composition options
 * @returns Composed rules
 */
export const composeRules = (
  baseRules: PraetorianRule[],
  config: RuleConfig,
  options: RuleCompositionOptions = {}
): PraetorianRule[] => {
  // Guard clause: no config
  if (!config) {
    return baseRules;
  }

  // Guard clause: no base rules
  if (!baseRules || baseRules.length === 0) {
    return [];
  }

  let rules = [...baseRules];

  // Add custom rules
  if (config.customRules && config.customRules.length > 0) {
    rules = addCustomRules(rules, config.customRules);
  }

  // Apply overrides
  if (config.overrideRules && config.overrideRules.length > 0) {
    rules = applyRuleOverrides(rules, config.overrideRules);
  }

  return rules;
};

/**
 * Adds custom rules to existing rules
 * @param existingRules - Existing rules
 * @param customRules - Custom rules to add
 * @returns Combined rules
 */
export const addCustomRules = (
  existingRules: PraetorianRule[],
  customRules: PraetorianRule[]
): PraetorianRule[] => {
  // Guard clause: no existing rules
  if (!existingRules || existingRules.length === 0) {
    return customRules || [];
  }

  // Guard clause: no custom rules
  if (!customRules || customRules.length === 0) {
    return existingRules;
  }

  return [...existingRules, ...customRules];
};


/**
 * Applies rule overrides to existing rules
 * @param rules - Existing rules
 * @param overrides - Rule overrides
 * @returns Updated rules
 */
export const applyRuleOverrides = (
  rules: PraetorianRule[],
  overrides: Partial<PraetorianRule>[]
): PraetorianRule[] => {
  // Guard clause: no rules
  if (!rules || rules.length === 0) {
    return [];
  }

  // Guard clause: no overrides
  if (!overrides || overrides.length === 0) {
    return rules;
  }

  const rulesMap = new Map(rules.map(rule => [rule.id, rule]));

  for (const override of overrides) {
    // Guard clause: no ID in override
    if (!override.id) {
      continue;
    }

    const existingRule = rulesMap.get(override.id);
      if (existingRule) {
        // Update existing rule
        const updatedRule = {
          ...existingRule,
          ...override,
        } as PraetorianRule;
        rulesMap.set(override.id, updatedRule);
      } else {
        // Add new rule (treat as custom rule)
        rulesMap.set(override.id, override as PraetorianRule);
      }
  }

  return Array.from(rulesMap.values());
};

/**
 * Validates loaded rules for consistency
 * @param rules - Rules to validate
 * @returns Validation warnings
 */
export const validateLoadedRules = (rules: PraetorianRule[]): string[] => {
  // Guard clause: no rules
  if (!rules || rules.length === 0) {
    return [];
  }

  const warnings: string[] = [];
  const ruleIds = new Set<string>();

  for (const rule of rules) {
    // Check for duplicate IDs
    if (ruleIds.has(rule.id)) {
      warnings.push(`Duplicate rule ID found: ${rule.id}`);
    }
    ruleIds.add(rule.id);

    // Check for required fields
    if (!rule.name || !rule.description) {
      warnings.push(`Rule ${rule.id} missing required fields`);
    }

    // Validate rule-specific properties
    const ruleValidationWarnings = validateRuleSpecificProperties(rule);
    warnings.push(...ruleValidationWarnings);
  }

  return warnings;
};

/**
 * Validates rule-specific properties
 * @param rule - Rule to validate
 * @returns Validation warnings for this rule
 */
export const validateRuleSpecificProperties = (rule: PraetorianRule): string[] => {
  // Guard clause: no rule
  if (!rule) {
    return ['Rule is null or undefined'];
  }

  const warnings: string[] = [];

  switch (rule.type) {
    case 'format':
      if (!rule.format && !rule.pattern) {
        warnings.push(`Format rule ${rule.id} missing format or pattern`);
      }
      break;
    case 'structure':
      // Structure rules don't have specific requirements
      break;
    case 'security':
      if (!rule.securityType) {
        warnings.push(`Security rule ${rule.id} missing securityType`);
      }
      break;
    case 'schema':
      if (!rule.validateSchema) {
        warnings.push(`Schema rule ${rule.id} has validateSchema set to false`);
      }
      break;
  }

  return warnings;
};

/**
 * Gets rules by category
 * @param rules - Rules to filter
 * @param category - Category to filter by
 * @returns Filtered rules
 */
export const getRulesByCategory = (
  rules: PraetorianRule[],
  category: string
): PraetorianRule[] => {
  // Guard clause: no rules
  if (!rules || rules.length === 0) {
    return [];
  }

  // Guard clause: no category
  if (!category || category.trim().length === 0) {
    return rules;
  }

  return rules.filter(rule => rule.category === category);
};

/**
 * Gets rules by tags
 * @param rules - Rules to filter
 * @param tags - Tags to filter by
 * @returns Filtered rules
 */
export const getRulesByTags = (
  rules: PraetorianRule[],
  tags: string[]
): PraetorianRule[] => {
  // Guard clause: no rules
  if (!rules || rules.length === 0) {
    return [];
  }

  // Guard clause: no tags
  if (!tags || tags.length === 0) {
    return rules;
  }

  return rules.filter(rule => 
    rule.tags && tags.every(tag => rule.tags!.includes(tag))
  );
};

/**
 * Gets rules by severity
 * @param rules - Rules to filter
 * @param severity - Severity to filter by
 * @returns Filtered rules
 */
export const getRulesBySeverity = (
  rules: PraetorianRule[],
  severity: string
): PraetorianRule[] => {
  // Guard clause: no rules
  if (!rules || rules.length === 0) {
    return [];
  }

  // Guard clause: no severity
  if (!severity || severity.trim().length === 0) {
    return rules;
  }

  return rules.filter(rule => rule.severity === severity);
};

/**
 * Gets enabled rules only
 * @param rules - Rules to filter
 * @returns Enabled rules
 */
export const getEnabledRules = (rules: PraetorianRule[]): PraetorianRule[] => {
  // Guard clause: no rules
  if (!rules || rules.length === 0) {
    return [];
  }

  return rules.filter(rule => rule.enabled);
};

/**
 * Gets disabled rules only
 * @param rules - Rules to filter
 * @returns Disabled rules
 */
export const getDisabledRules = (rules: PraetorianRule[]): PraetorianRule[] => {
  // Guard clause: no rules
  if (!rules || rules.length === 0) {
    return [];
  }

  return rules.filter(rule => !rule.enabled);
};

/**
 * Gets unique categories from rules
 * @param rules - Rules to analyze
 * @returns Array of unique categories
 */
export const getUniqueCategories = (rules: PraetorianRule[]): string[] => {
  // Guard clause: no rules
  if (!rules || rules.length === 0) {
    return [];
  }

  const categories = new Set<string>();
  
  for (const rule of rules) {
    if (rule.category) {
      categories.add(rule.category);
    }
  }

  return Array.from(categories);
};

/**
 * Gets unique tags from rules
 * @param rules - Rules to analyze
 * @returns Array of unique tags
 */
export const getUniqueTags = (rules: PraetorianRule[]): string[] => {
  // Guard clause: no rules
  if (!rules || rules.length === 0) {
    return [];
  }

  const tags = new Set<string>();
  
  for (const rule of rules) {
    if (rule.tags) {
      for (const tag of rule.tags) {
        tags.add(tag);
      }
    }
  }

  return Array.from(tags);
};
