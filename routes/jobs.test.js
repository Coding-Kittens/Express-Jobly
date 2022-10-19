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

describe("Test Create", () => {
  test("Test Create new job", async () => {
    let res = await request(app)
      .post("/jobs/")
      .send({
        title: "testing",
        salary: 30,
        equity: 2,
        company_handle: "test",
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(res.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "testing",
        salary: 30,
        equity: 2,
        company_handle: "test",
      },
    });
    expect(res.statusCode).toBe(201);
  });

  test("Unauth for users", async () => {
    let res = await request(app)
      .post("/jobs/")
      .send({
        title: "testing",
        salary: 30,
        equity: 2,
        company_handle: "test",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(401);
  });
});

describe("Test Update", () => {
  test("Test update job by id", async () => {
    let res = await request(app)
      .patch("/jobs/345")
      .send({ title: "testing", salary: 30, equity: 2 })
      .set("authorization", `Bearer ${u1Token}`);

    expect(res.body).toEqual({
      job: {
        id: 345,
        title: "testing",
        salary: 30,
        equity: 2,
        company_handle: "test",
      },
    });
    expect(res.statusCode).toBe(200);
  });

  test("Unauth for users", async () => {
    let res = await request(app)
      .patch("/jobs/345")
      .send({ title: "testing", salary: 30, equity: 2 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(401);
  });

  test("Test update job by id should return 404 if job not found", async () => {
    let res = await request(app)
      .patch("/jobs/882")
      .send({ title: "testing", salary: 30, equity: 2 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(404);
  });
});

describe("Test Get", () => {
  test("Test find all", async () => {
    let res = await request(app).get("/jobs");

    expect(res.body).toEqual({
      jobs: [
        {
          id: 123,
          title: "nothing",
          salary: 4,
          equity: 3,
          company_handle: "test",
        },
        {
          id: 345,
          title: "nothing",
          salary: 15,
          equity: 6,
          company_handle: "test",
        },
      ],
    });
    expect(res.statusCode).toBe(200);
  });

  test("Test find with filter", async () => {
    let res = await request(app).get("/jobs/?minSalary=5");

    expect(res.body).toEqual({
      jobs: [
        {
          id: 345,
          title: "nothing",
          salary: 15,
          equity: 6,
          company_handle: "test",
        },
      ],
    });
    expect(res.statusCode).toBe(200);
  });

  test("Test get by id", async () => {
    let res = await request(app).get("/jobs/123");

    expect(res.body).toEqual({
      job: {
        id: 123,
        title: "nothing",
        salary: 4,
        equity: 3,
        company_handle: "test",
      },
    });
    expect(res.statusCode).toBe(200);
  });

  test("Test get by id should return 404 if job not found", async () => {
    let res = await request(app).get("/jobs/882");
    expect(res.statusCode).toBe(404);
  });
});

describe("Test Delete", () => {
  test("Test delete by id", async () => {
    let res = await request(app)
      .delete("/jobs/123")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({ message: "deleted" });
    expect(res.statusCode).toBe(200);
  });

  test("Unauth for users", async () => {
    let res = await request(app)
      .delete("/jobs/123")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(401);
  });

  test("Test delete by id should return 404 if job not found", async () => {
    let res = await request(app)
      .delete("/jobs/882")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(404);
  });
});
