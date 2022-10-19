const { BadRequestError } = require("../expressError");

//Gets the sql for Updating part of the data
//
//takes the dataToUpdate and the js to turn into Sql
//
//
//dataToUpdate {numEmployees:20,logoUrl:'newUrl'}
//
//jsToSql {numEmployees: "num_employees",logoUrl: "logo_url",}
//
//
//returns the sql for the PartialUpdate and the values
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

module.exports = { sqlForPartialUpdate };
