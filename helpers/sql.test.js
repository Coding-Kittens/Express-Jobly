const jwt = require("jsonwebtoken");
const { sqlForPartialUpdate, whereSqlForFilter } = require("./sql.js");

/////////////////////////////////////////////sqlForPartialUpdate
describe("sqlForPartialUpdate tests", () => {
  test("works: get sql", () => {
    const res = sqlForPartialUpdate(
      { numEmployees: 20, logoUrl: "newUrl" },
      { numEmployees: "num_employees", logoUrl: "logo_url" }
    );
    expect(res).toEqual({
      setCols: '"num_employees"=$1, "logo_url"=$2',
      values: [20, "newUrl"],
    });
  });
  /////////////////////////////////////////////sqlForPartialUpdate error
  test("error: get sql empty keys", () => {
    expect(() => {
      sqlForPartialUpdate({}, { numEmployees: "num_employees" });
    }).toThrow("No data");
  });
});

/////////////////////////////////////////////whereSqlForFilter
describe("whereSqlForFilter tests", () => {
  let list = [];
  beforeEach(() => {
    list.push({
      condition: "ILIKE",
      name: "description",
      value: `%cats%best%`,
    });
    list.push({ condition: ">", name: "id", value: "3" });
    list.push({ condition: "<", name: "equity", value: "1" });
    list.push({ condition: ">=", name: "job_id", value: "10" });
    list.push({ condition: "<=", name: "salary", value: "12" });
  });
  test("works: get WHERE ", () => {
    let res = whereSqlForFilter(list);

    expect(res).toEqual({
      where:
        "WHERE description ILIKE $1 AND id > $2 AND equity < $3 AND job_id >= $4 AND salary <= $5",
      queryParams: ["%cats%best%", "3", "1", "10", "12"],
    });

    res = whereSqlForFilter([list[3], list[0], list[1]]);

    expect(res).toEqual({
      where: "WHERE job_id >= $1 AND description ILIKE $2 AND id > $3",
      queryParams: ["10", "%cats%best%", "3"],
    });
  });

  /////////////////////////////////////////////whereSqlForFilter errors
  test("error: get WHERE, empty params", () => {
    expect(() => {
      whereSqlForFilter([]);
    }).toThrow("No data");
  });

  test("error: get WHERE, missing info", () => {
    expect(() => {
      whereSqlForFilter([
        { name: "id", value: 3 },
        { condition: ">", name: "id", value: 3 },
      ]);
    }).toThrow("params with index of 0: missing name, condition, or value");

    expect(() => {
      whereSqlForFilter([
        { condition: ">", name: "id", value: 3 },
        { value: 3 },
      ]);
    }).toThrow("params with index of 1: missing name, condition, or value");
  });
});
