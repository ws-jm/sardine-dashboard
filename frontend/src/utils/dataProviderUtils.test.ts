import { DATA_TYPES, ItemModel, rulesForDataDictionary, stringChild } from "./dataProviderUtils";

// Case #1: No child
test("rulesForDataDictionary: Data for feature without child", () => {
  const input = [stringChild("Feature", "no child", false)];
  const output = [new ItemModel("Feature", [], '""', DATA_TYPES.string, false, "no child")];
  expect(rulesForDataDictionary(input, "")).toEqual(output);
});

// Case #2: Single layered
test("rulesForDataDictionary: Data for feature with 2 children", () => {
  const input = [
    new ItemModel(
      "Feature",
      [stringChild("Child1", "N/A", false), stringChild("Child2", "N/A", false)],
      "",
      DATA_TYPES.string,
      false,
      "single layer"
    ),
  ];
  const output = [
    new ItemModel("Feature.Child1", [], '""', DATA_TYPES.string, false, "N/A"),
    new ItemModel("Feature.Child2", [], '""', DATA_TYPES.string, false, "N/A"),
  ];
  expect(rulesForDataDictionary(input, "")).toEqual(output);
});

// Case #3: Double layered
test("rulesForDataDictionary: Data for feature with 2 layer of children", () => {
  const input = [
    new ItemModel("Feature", [
      new ItemModel("Child1", [stringChild("SubChild1", "N/A", false), stringChild("SubChild2", "N/A", false)]),
    ]),
  ];
  const output = [
    new ItemModel("Feature.Child1.SubChild1", [], '""', DATA_TYPES.string, false, "N/A"),
    new ItemModel("Feature.Child1.SubChild2", [], '""', DATA_TYPES.string, false, "N/A"),
  ];
  expect(rulesForDataDictionary(input, "")).toEqual(output);
});

// Case #4: With duration values
test("rulesForDataDictionary: Data for feature with duration values", () => {
  const input = [
    new ItemModel("Feature", [
      new ItemModel("Child1", [
        new ItemModel(
          "SubChild1",
          [new ItemModel("ALL"), new ItemModel("24HRS"), new ItemModel("7DAYS")],
          "",
          DATA_TYPES.int,
          false,
          "sub child 1 with duration values"
        ),
        new ItemModel(
          "SubChild2",
          [new ItemModel("30DAYS"), new ItemModel("60DAYS"), new ItemModel("90DAYS")],
          "",
          DATA_TYPES.int,
          false,
          "sub child 2 with duration values"
        ),
      ]),
    ]),
  ];
  const output = [
    new ItemModel("Feature.Child1.SubChild1", [], "", DATA_TYPES.int, false, "sub child 1 with duration values"),
    new ItemModel("Feature.Child1.SubChild2", [], "", DATA_TYPES.int, false, "sub child 2 with duration values"),
  ];
  expect(rulesForDataDictionary(input, "")).toEqual(output);
});
