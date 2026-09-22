const express = require("express");
const sequelize = require("./db");
const Student = require("./Student");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/students", async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const student = await Student.create({ name, email, age });
    console.log(`Inserted student: ${name}, ID: ${student.id}`);
    res.status(201).json(student);
  } catch (err) {
    console.error("Insert error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/students", async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const [updated] = await Student.update({ name, email, age }, { where: { id: req.params.id } });
    if (updated === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    console.log(`Updated student ID: ${req.params.id}`);
    const student = await Student.findByPk(req.params.id);
    res.json(student);
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    const deleted = await Student.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    console.log(`Deleted student ID: ${req.params.id}`);
    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

sequelize.sync().then(() => {
  console.log("Database synced");
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});
