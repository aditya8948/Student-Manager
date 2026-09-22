const mysql = require("mysql2/promise");

async function setup() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
  });

  await connection.query("CREATE DATABASE IF NOT EXISTS student_db");
  console.log("Database 'student_db' created");

  await connection.query("USE student_db");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      age INT NOT NULL
    )
  `);
  console.log("Table 'students' created");

  await connection.end();
  console.log("Setup complete");
}

setup().catch(console.error);
