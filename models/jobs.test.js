const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Job = require("./jobs.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
/////////////////////////////////////////////POST/
describe("Test Create", () => {
  test("Test Create new job", async () => {
    res = await Job.add({
      title: "testing",
      salary: 30,
      equity: 1,
      company_handle: "test",
    });

    expect(res).toEqual({
      id: expect.any(Number),
      title: "testing",
      salary: 30,
      equity: "1",
      company_handle: "test",
    });
  });
});
/////////////////////////////////////////////PATCH/:id
describe("Test Update", () => {
  test("Test update job by id", async () => {
    res = await Job.update(345, { title: "testing", salary: 30, equity: "1" });

    expect(res).toEqual({
      id: 345,
      title: "testing",
      salary: 30,
      equity: "1",
      company_handle: "test",
    });
  });
});
/////////////////////////////////////////////GET/ w filter
describe("Test Find All", () => {
  test("Test gets all jobs no filter", async () => {
    res = await Job.findAll();
    expect(res).toEqual([
      {
        id: 123,
        title: "test",
        salary: 4,
        equity: "0",
        company_handle: "test",
      },
      {
        id: 345,
        title: "nothing",
        salary: 15,
        equity: "1",
        company_handle: "test",
      },
    ]);
  });

  test("Test title filter case-insensitive partial matches", async () => {
    res = await Job.findAll({ title: "t" });
    expect(res).toEqual([
      {
        id: 123,
        title: "test",
        salary: 4,
        equity: "0",
        company_handle: "test",
      },
      {
        id: 345,
        title: "nothing",
        salary: 15,
        equity: "1",
        company_handle: "test",
      },
    ]);
  });

  test("Test minSalary filter", async () => {
    res = await Job.findAll({ minSalary: 5 });
    expect(res).toEqual([
      {
        id: 345,
        title: "nothing",
        salary: 15,
        equity: "1",
        company_handle: "test",
      },
    ]);
  });

  test("Test hasEquity filter true", async () => {
    res = await Job.findAll({ hasEquity: true });
    expect(res).toEqual([
      {
        id: 345,
        title: "nothing",
        salary: 15,
        equity: "1",
        company_handle: "test",
      },
    ]);
  });

  test("Test hasEquity filter false", async () => {
    res = await Job.findAll({ hasEquity: false });
    expect(res).toEqual([
      {
        id: 123,
        title: "test",
        salary: 4,
        equity: "0",
        company_handle: "test",
      },
      {
        id: 345,
        title: "nothing",
        salary: 15,
        equity: "1",
        company_handle: "test",
      },
    ]);
  });

  test("Test all filters", async () => {
    res = await Job.findAll({ title: "t", minSalary: 4, hasEquity: true });
    expect(res).toEqual([
      {
        id: 345,
        title: "nothing",
        salary: 15,
        equity: "1",
        company_handle: "test",
      },
    ]);
  });
});
/////////////////////////////////////////////GET/:id
describe("Test Get by Id", () => {
  test("Test get job by id", async () => {
    res = await Job.get(123);
    expect(res).toEqual({
      id: 123,
      title: "test",
      salary: 4,
      equity: "0",
      company_handle: "test",
    });
  });
});
/////////////////////////////////////////////DELETE/:id
describe("Test Delete", () => {
  test("Test delete job by id", async () => {
    res = await Job.delete(123);
    expect(res).toEqual({ message: "deleted" });
  });
});
