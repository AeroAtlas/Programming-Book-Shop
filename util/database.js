require("dotenv").config()
const Sequelize = require("sequelize");
const sequelize = new Sequelize("working_with_node_db", "root", process.env.DB_PASSWORD, {dialect: "mysql", host: "localhost"});

module.exports = sequelize;














//? Default SQL
// const mysql = require('mysql2');
// require("dotenv").config()

// const pool = mysql.createPool({
//   host: "localhost",
//   user: 'root',
//   database: 'working_with_node_db',
//   password: process.env.DB_PASSWORD
// });

// module.exports = pool.promise();