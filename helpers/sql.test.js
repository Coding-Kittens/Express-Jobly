const jwt = require("jsonwebtoken");
const { sqlForPartialUpdate } = require("./sql.js");

describe("sql tests", () => {
  test("works sql", () => {
    res = sqlForPartialUpdate(
      { numEmployees: 20, logoUrl: "newUrl" },
      { numEmployees: "num_employees", logoUrl: "logo_url" }
    );
    expect(res).toEqual({
      setCols: "\"num_employees\"=$1, \"logo_url\"=$2",
      values: [20, "newUrl"],
    });
  });

  test("works sql", () => {
    res = sqlForPartialUpdate(
      { numEmployees: 30 },
      { numEmployees: "num_employees" }
    );
    expect(res).toEqual({
      setCols: "\"num_employees\"=$1",
      values: [30],
    });
  });
});
