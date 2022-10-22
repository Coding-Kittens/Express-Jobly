const { BadRequestError } = require("../expressError");

////Gets the sql for Updating part of the data
//
//takes the dataToUpdate and the js to turn into Sql
//
//Ex: dataToUpdate = {numEmployees:20,logoUrl:'newUrl'}
//
//Ex: jsToSql = {numEmployees: "num_employees",logoUrl: "logo_url",}
//
//Returns {setCols,values}
//Ex: { setCols: '"num_employees"=$1, "logo_url"=$2',values: [20, "newUrl"],}
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/////Gets the WHERE sql for filters
//
/// params =[{condition:'ILIKE',name:'title',value:'%test%'},...]
//
///name = the name of the row that you are checking. Ex: "id"
//
///condition = how it is checking. Ex: ">="
//
///value = the value it is checking. Ex: 6
//
//
///Returns {where,queryParams}
//Ex: {where:'WHERE name ILIKE $1',queryParams:['%test%']}
//
function whereSqlForFilter(params) {
  if (params.length === 0) throw new BadRequestError("No data");
  const queryParams = [];

  let $num = 1;

  return params.reduce((obj, param, i) => {
    if (!param.name || !param.condition || !param.value)
      throw new BadRequestError(
        `params with index of ${i}: missing name, condition, or value`
      );
    const where = `${param.name} ${param.condition} $${$num}`;
    $num++;

    obj.where
      ? (obj.where = `${obj.where} AND ${where}`)
      : (obj.where = `WHERE ${where}`);
    obj.queryParams
      ? obj.queryParams.push(`${param.value}`)
      : (obj.queryParams = [`${param.value}`]);
    return obj;
  }, {});
}

module.exports = { sqlForPartialUpdate, whereSqlForFilter };
