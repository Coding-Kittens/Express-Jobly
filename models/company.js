"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate,whereSqlForFilter } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * matches filters if there are any
   *
   *params ={name,minEmployees,maxEmployees}
   *
   * Can filter by name, minEmployees and/or maxEmployees
   *
   * name is case-insensitive and can match any part of the string
   *
   * minEmployees gets companies that have minEmployees or greater
   *
   * maxEmployees gets companies that have maxEmployees or less
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(params = {}) {
    let companiesRes;
    if (Object.keys(params).length === 0) {
        companiesRes = await db.query(
        `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
             FROM companies
             ORDER BY name`
        );
    } else {
        let paramsList =[];
        if (params.name) paramsList.push({condition:'ILIKE',name:'name',value: `%${params.name}%`});
        if (params.minEmployees) paramsList.push({condition:'>=',name:'num_employees',value: params.minEmployees});
        if (params.maxEmployees) paramsList.push({condition:'<=',name:'num_employees',value: params.maxEmployees});

        const query = whereSqlForFilter(paramsList);

        companiesRes = await db.query(
          `SELECT handle,
                       name,
                       description,
                       num_employees AS "numEmployees",
                       logo_url AS "logoUrl"
                FROM companies ${query.where}
                ORDER BY name`,
          query.queryParams
        );
    }

    if (companiesRes.rows.length === 0) {
      throw new NotFoundError();
    }
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl",
                  id,
                  title,
                  salary,
                  equity
           FROM companies
           LEFT JOIN jobs ON jobs.company_handle=companies.handle
           WHERE companies.handle = $1`,
      [handle]
    );

    if (companyRes.rows.length === 0)
      throw new NotFoundError(`No company: ${handle}`);

    const { name, description, numEmployees, logoUrl } = companyRes.rows[0];
    let jobs;
    if (companyRes.rows[0].id) {
      jobs = companyRes.rows.map((r) => {
        return {
          id: r.id,
          title: r.title,
          salary: r.salary,
          equity: r.equity,
          handle,
        };
      });
    } else {
      jobs = [];
    }
    const company = {
      handle: companyRes.rows[0].handle,
      name,
      description,
      numEmployees,
      logoUrl,
      jobs,
    };

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies
                      SET ${setCols}
                      WHERE handle = ${handleVarIdx}
                      RETURNING handle,
                                name,
                                description,
                                num_employees AS "numEmployees",
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
