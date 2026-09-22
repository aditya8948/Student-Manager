const express = require("express");
const db = require("./db");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/students", async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const [result] = await db.query(
      "INSERT INTO students (name, email, age) VALUES (?, ?, ?)",
      [name, email, age]
    );
    console.log(`Inserted student: ${name}, ID: ${result.insertId}`);
    res.status(201).json({ id: result.insertId, name, email, age });
  } catch (err) {
    console.error("Insert error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/students", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM students");
    res.json(rows);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM students WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const [result] = await db.query(
      "UPDATE students SET name = ?, email = ?, age = ? WHERE id = ?",
      [name, email, age, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    console.log(`Updated student ID: ${req.params.id}`);
    res.json({ id: parseInt(req.params.id), name, email, age });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM students WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    console.log(`Deleted student ID: ${req.params.id}`);
    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
