const getStringLength = require("./getStringLength");

test("Adds two numbers", () => {
  expect(getStringLength.getStringLength(2, 2)).toBe(4);
});
