"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobFilterSchema = require("../schemas/jobFilter.json");

const router = new express.Router();

/*GET
 *
 * gets all jobs data.
 *
 * Can filter on provided search filters:
 * - minSalary
 * - hasEquity
 * - title (will find case-insensitive, partial matches)
 *
 * Returns jobs: [{id,title,salary,equity,company_handle,}...]
 *
 * Authorization required: none
 */
router.get("/", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.query, jobFilterSchema)
    if (validator.valid) {
      const result = await Job.findAll(req.query);
      return res.json({ jobs: result });
    }
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  } catch (e) {
    return next(e);
  }
});
/*GET
 *
 * gets job data.
 *
 * Returns job: {id,title,salary,equity,company_handle,}
 *
 * Authorization required: none
 */
router.get("/:id", async (req, res, next) => {
  try {
    const result = await Job.get(req.params.id);
    return res.json({ job: result });
  } catch (e) {
    return next(e);
  }
});

/*POST
 *
 * Creates a job.
 *
 * fields are: { name, description, numEmployees, logo_url }
 *
 * Returns job: {id,title,salary,equity,company_handle,}
 *
 * Authorization required: Admin
 */
router.post("/", ensureAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (validator.valid) {
      const result = await Job.add(req.body);
      return res.status(201).json({ job: result });
    }
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  } catch (e) {
    return next(e);
  }
});
/*PATCH
 *
 * Patches job data.
 *
 * fields can be: {title,salary,equity}
 *
 * Returns job: {id,title,salary,equity,company_handle,}
 *
 * Authorization required: Admin
 */
router.patch("/:id", ensureAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (validator.valid) {
      const result = await Job.update(req.params.id, req.body);
      return res.json({ job: result });
    }

    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  } catch (e) {
    return next(e);
  }
});

/*DELETE
 *
 * Deletes job data.
 *
 * Returns { message: "deleted" }
 *
 * Authorization required: Admin
 */

router.delete("/:id", ensureAdmin, async (req, res, next) => {
  try {
    const result = await Job.delete(req.params.id);
    return res.json(result);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
