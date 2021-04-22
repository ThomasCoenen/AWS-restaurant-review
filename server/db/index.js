const { Pool } = require("pg");

const pool = new Pool({  //no need to place process.env.var_name. PG library automatically does it
});
module.exports = {
  query: (text, params) => pool.query(text, params),
};
