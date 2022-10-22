"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { whereSqlForFilter } = require("../helpers/sql");

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
      `UPDATE jobs SET title=$2,salary=$3,equity=$4 WHERE id=$1 RETURNING id, title, salary, equity, company_handle`,
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
   * params ={title, minSalary, hasEquity}
   *
   * Can filter by title, minSalary and/or hasEquity
   *
   * title is case-insensitive and can match any part of the string
   *
   * minSalary gets jobs that have a salary of minSalary or greater
   *
   * hasEquity if true gets jobs that have an amount of equity greater than 0
   * hasEquity if false lists all jobs regardless of equity
   *
   * Returns [{ id, title, salary, equity, company_handle },...]
   *
   * */
  static async findAll(params = {}) {
    let jobRes;

    if(Object.keys(params).length > 0){
        let paramsList =[];
        if (params.title) paramsList.push({condition:'ILIKE',name:'title',value: `%${params.title}%`});
        if (params.minSalary) paramsList.push({condition:'>=',name:'salary',value: params.minSalary});
        if (params.hasEquity) paramsList.push({condition:'>',name:'equity',value: '0'});

        if (paramsList.length > 0) {
          const query = whereSqlForFilter(paramsList);
          jobRes = await db.query(
            `SELECT id, title, salary, equity, company_handle FROM jobs ${query.where}`,
            query.queryParams
          );
        }
    }
    if (!jobRes) jobRes = await db.query(`SELECT id, title, salary, equity, company_handle FROM jobs`);

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
    const result = await db.query(`DELETE FROM jobs WHERE id=$1 RETURNING id`, [
      id,
    ]);
    if (result.rows.length === 0) {
      throw new NotFoundError();
    }
    return { message: "deleted" };
  }
}

module.exports = Job;
