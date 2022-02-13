import { Rule } from "sardine-dashboard-typescript-definitions";

const RISK_PRIORITY: { [key: string]: number } = {
  very_high: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function getRuleRiskPriority(rule: Rule): number {
  if (rule.action.tags === undefined) {
    return 0;
  }
  return Math.max(...rule.action.tags.map((a) => RISK_PRIORITY[a.value]));
}

export function orderRulesByRiskLevel(rules: Rule[]): Rule[] {
  return rules
    .map((rule) => ({
      priority: getRuleRiskPriority(rule),
      rule,
    }))
    .sort((rwp1, rwp2) => {
      if (rwp1.rule.isShadow && !rwp2.rule.isShadow) return 1;
      if (!rwp1.rule.isShadow && rwp2.rule.isShadow) return -1;
      return rwp1.priority > rwp2.priority ? -1 : 1;
    })
    .map((ruleWithPriority) => {
      if (ruleWithPriority.rule.isShadow) {
        return {
          ...ruleWithPriority.rule,
          name: `${ruleWithPriority.rule.name} (shadow rule)`,
        };
      }
      return ruleWithPriority.rule;
    });
}
