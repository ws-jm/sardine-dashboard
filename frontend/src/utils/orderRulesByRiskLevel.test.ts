import { Rule } from "sardine-dashboard-typescript-definitions";
import { orderRulesByRiskLevel } from "./orderRulesByRiskLevel";

const testCase1: Rule[] = [
  {
    id: 1,
    name: "1",
    condition: "1",
    checkpoint: "customer",
    action: {
      tags: [
        {
          key: "very_high",
          value: "very_high",
          actionType: "update_tag",
        },
      ],
    },
    isShadow: true,
    reasonCodesExpr: "",
    description: "",
    isEditable: false,
    organisation: "someorg",
    depreciated: false,
  },
];

const testCase2: Rule[] = [
  {
    id: 1,
    name: "1",
    condition: "1",
    checkpoint: "customer",
    action: {
      tags: [
        {
          key: "high",
          value: "high",
          actionType: "update_tag",
        },
      ],
    },
    isShadow: false,
    reasonCodesExpr: "",
    description: "",
    isEditable: false,
    organisation: "someorg",
    depreciated: false,
  },
  {
    id: 2,
    name: "2",
    condition: "2",
    checkpoint: "customer",
    action: {
      tags: [
        {
          key: "very_high",
          value: "very_high",
          actionType: "update_tag",
        },
      ],
    },
    isShadow: false,
    reasonCodesExpr: "",
    description: "",
    isEditable: false,
    organisation: "someorg",
    depreciated: false,
  },
];

const testCase3: Rule[] = [
  {
    id: 1,
    name: "1",
    condition: "1",
    checkpoint: "customer",
    action: {
      tags: [
        {
          key: "high",
          value: "high",
          actionType: "update_tag",
        },
      ],
    },
    isShadow: false,
    reasonCodesExpr: "",
    description: "",
    isEditable: false,
    organisation: "someorg",
    depreciated: false,
  },
  {
    id: 2,
    name: "2",
    condition: "2",
    checkpoint: "customer",
    action: {
      tags: [
        {
          key: "very_high",
          value: "very_high",
          actionType: "update_tag",
        },
      ],
    },
    isShadow: true,
    reasonCodesExpr: "",
    description: "",
    isEditable: false,
    organisation: "someorg",
    depreciated: false,
  },
];

describe("orderRulesByRiskLevel test", () => {
  test("test that makes sure isShadow is handled property", () => {
    const result = orderRulesByRiskLevel(testCase1);
    expect(result[0].name).toBe("1 (shadow rule)");
  });
  test("test that makes sure priority is used in ordering", () => {
    const result = orderRulesByRiskLevel(testCase2);
    const expectedResult = testCase2.reverse();
    expect(result).toStrictEqual(expectedResult);
  });
  test("test that makes sure both isShadow and priority is used in ordering", () => {
    const result = orderRulesByRiskLevel(testCase3);
    const expectedResult = testCase3.map((testCase) => {
      if (testCase.isShadow) {
        return {
          ...testCase,
          name: `${testCase.name} (shadow rule)`,
        };
      }
      return testCase;
    });
    expect(result).toStrictEqual(expectedResult);
  });
});
