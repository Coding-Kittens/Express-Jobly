"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  /**Adds a job (from data) and returns new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * */

  static async add({ title, salary, equity, company_handle }) {
    const result = await db.query(
      `INSERT INTO jobs(title,salary,equity,company_handle) VALUES($1,$2,$3,$4) RETURNING id, title, salary, equity, company_handle`,
      [title, salary, equity, company_handle]
    );

    return result.rows[0];
  }
  /**Updates a job by id (from data) and returns the updated job data.
   *
   * data should be (id, { title, salary, equity})
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * */
  static async update(id, { title, salary, equity }) {
    const result = await db.query(
      `UPDATE jobs SET title=$2,salary=$3,equity=$4 WHERE username=$1 RETURNING id, title, salary, equity, company_handle`,
      [id, title, salary, equity]
    );
    if (result.rows.length === 0) {
      throw new NotFoundError();
    }
    return result.rows[0];
  }
  /**Gets and returns all jobs.
   *
   * matches filters if there are any
   *
   * Can filter by title, minSalary and/or hasEquity
   *
   *  title is case-insensitive and can match any part of the string
   *
   * minSalary gets jobs that have a salary of minSalary or greater
   *
   *  hasEquity if true gets jobs that have an amount of equity greater than 0
   * hasEquity if false lists all jobs regardless of equity
   *
   * Returns [{ id, title, salary, equity, company_handle },...]
   *
   * */
  static async findAll(params = null) {
    let jobRes;

    if (!params) {
      jobRes = await db.query(
        `SELECT id, title, salary, equity, company_handle FROM jobs`
      );
    } else {
      const queryParams = [];
      let where = "";

      if (params.title) {
        where = `WHERE title ILIKE $1`;
        queryParams.push(`%${params.title}%`);
      }

      if (params.minSalary) {
        where === ""
          ? (where = `WHERE salary >= $1`)
          : (where = `${where} AND salary >= $2`);
        queryParams.push(params.minSalary);
      }

      if (params.hasEquity) {
        where === ""
          ? (where = `WHERE equity < 0`)
          : (where = `${where} AND equity < 0`);
      }

      jobRes = await db.query(
        `SELECT id, title, salary, equity, company_handle FROM jobs ${where}`,
        queryParams
      );
    }

    if (jobRes.rows.length === 0) {
      throw new NotFoundError();
    }
    return jobRes.rows;
  }
  /**Gets and returns a job by id.
   *
   * data should be (id)
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * */
  static async get(id) {
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle FROM jobs WHERE id=$1`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new NotFoundError();
    }
    return result.rows[0];
  }

  /**Deletes a job by id
   *
   * data should be (id)
   *
   * Returns { message: "deleted" }
   *
   * */

  static async delete(id) {
    const result = await db.query(`DELETE FROM jobs WHERE id=$1`, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundError();
    }
    return { message: "deleted" };
  }
}
