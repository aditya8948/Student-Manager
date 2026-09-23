const express = require("express");
const sequelize = require("./db");
const Student = require("./Student");
const Course = require("./Course");

// Define Many-to-Many Association
Student.belongsToMany(Course, { through: "StudentCourses" });
Course.belongsToMany(Student, { through: "StudentCourses" });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Student Routes ---

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
    const students = await Student.findAll({
      include: {
        model: Course,
        through: { attributes: [] },
      },
    });
    res.json(students);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: {
        model: Course,
        through: { attributes: [] },
      },
    });
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

// --- Course Routes ---

app.post("/courses", async (req, res) => {
  try {
    const { name, description } = req.body;
    const course = await Course.create({ name, description });
    console.log(`Inserted course: ${name}, ID: ${course.id}`);
    res.status(201).json(course);
  } catch (err) {
    console.error("Course insert error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/courses", async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: {
        model: Student,
        through: { attributes: [] },
      },
    });
    res.json(courses);
  } catch (err) {
    console.error("Course fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: {
        model: Student,
        through: { attributes: [] },
      },
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    console.error("Course fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- Many-to-Many Enrollment Routes ---

// Enroll a student in a course
app.post("/students/:studentId/courses/:courseId", async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const student = await Student.findByPk(studentId);
    const course = await Course.findByPk(courseId);

    if (!student || !course) {
      return res.status(404).json({ error: "Student or Course not found" });
    }

    await student.addCourse(course);
    console.log(`Enrolled Student ${studentId} in Course ${courseId}`);
    res.status(200).json({ message: "Student enrolled in course successfully" });
  } catch (err) {
    console.error("Enrollment error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all courses enrolled by a student
app.get("/students/:id/courses", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: {
        model: Course,
        through: { attributes: [] },
      },
    });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student.Courses);
  } catch (err) {
    console.error("Fetch student courses error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Remove a student from a course
app.delete("/students/:studentId/courses/:courseId", async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const student = await Student.findByPk(studentId);
    const course = await Course.findByPk(courseId);

    if (!student || !course) {
      return res.status(404).json({ error: "Student or Course not found" });
    }

    await student.removeCourse(course);
    console.log(`Removed Student ${studentId} from Course ${courseId}`);
    res.json({ message: "Student removed from course successfully" });
  } catch (err) {
    console.error("Remove enrollment error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

sequelize.sync().then(() => {
  console.log("Database synced");
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});
