// require("dotenv").config();
// const mongodb = require("mongodb");
// const MongoClient = mongodb.MongoClient;
// let _db;

// const mongoConnect = (callback) => {
//   MongoClient.connect(process.env.MONGODB_PASS)
//     .then(client => {
//       console.log("Connected");
//       _db = client.db();
//       callback();
//     })
//     .catch(err => {
//       console.log(err);
//       throw err;
//     })
// }

// const getDb = () => {
//   if(_db){
//     return _db;
//   }
//   throw "No database found";
// }

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;
// // module.exports = mongoConnect;


















// //? Sequelize
// // require("dotenv").config()
// // const Sequelize = require("sequelize");
// // const sequelize = new Sequelize("working_with_node_db", "root", process.env.DB_PASSWORD, {dialect: "mysql", host: "localhost"});

// // module.exports = sequelize;





// //? Default SQL
// // const mysql = require('mysql2');
// // require("dotenv").config()

// // const pool = mysql.createPool({
// //   host: "localhost",
// //   user: 'root',
// //   database: 'working_with_node_db',
// //   password: process.env.DB_PASSWORD
// // });

// // module.exports = pool.promise();