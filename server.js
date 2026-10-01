const express = require("express");

const app = express();
app.use(express.json());

const PORT = 5000;
let courses = [];
app.post("/api/courses", (req, res) => {
  const course = {
    id: courses.length + 1,
    title: req.body.title,
    description: req.body.description,
    instructor: req.body.instructor,
    price: req.body.price
  };

  courses.push(course);

  res.status(201).json(course);
});
app.get("/api/courses", (req, res) => {
  res.json(courses);
});
app.get("/api/courses/:id", (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));

  if (!course) {
    return res.status(404).json({
      message: "Course not found"
    });
  }

  res.json(course);
});
app.put("/api/courses/:id", (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));

  if (!course) {
    return res.status(404).json({
      message: "Course not found"
    });
  }

  course.title = req.body.title || course.title;
  course.description = req.body.description || course.description;
  course.instructor = req.body.instructor || course.instructor;
  course.price = req.body.price || course.price;

  res.json(course);
});
app.delete("/api/courses/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const courseIndex = courses.findIndex(c => c.id === id);

  if (courseIndex === -1) {
    return res.status(404).json({
      message: "Course not found"
    });
  }

  const deletedCourse = courses.splice(courseIndex, 1);

  res.json({
    message: "Course deleted successfully",
    course: deletedCourse[0]
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "E-Learning backend is running"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});