const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const PORT = 5000;
mongoose.connect("mongodb://127.0.0.1:27017/e_learning")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));
  const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String
});

const User = mongoose.model("User", userSchema);
let courses = [];
app.post("/api/users", async (req, res) => {
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({
      message: "User creation failed",
      error: error.message
    });
  }
});
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({
      message: "Invalid user ID"
    });
  }
});
app.put("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({
      message: "User update failed",
      error: error.message
    });
  }
});
const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  course: String,
  rollNumber: String,
  age: Number
});
const instructorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  expertise: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  }
});

const Instructor = mongoose.model("Instructor", instructorSchema);

const Student = mongoose.model("Student", studentSchema);
const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  courseId: {
    type: Number,
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  }
});



const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  courseId: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["SUCCESS", "FAILED"],
    default: "FAILED"
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
});
const Payment = mongoose.model("Payment", paymentSchema);




app.post("/api/payments", async (req, res) => {
  try {
    const payment = await Payment.create({
      studentId: req.body.studentId,
      courseId: req.body.courseId,
      amount: req.body.amount,
      status: req.body.status
    });

    if (payment.status === "SUCCESS") {
      await Enrollment.create({
        studentId: payment.studentId,
        courseId: payment.courseId
      });
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({
      message: "Payment failed",
      error: error.message
    });
  }
});
app.get("/api/payments/student/:studentId", async (req, res) => {
  try {
    const payments = await Payment.find({
      studentId: req.params.studentId
    }).populate("studentId");

    res.json(payments);
  } catch (error) {
    res.status(400).json({
      message: "Failed to get payment history",
      error: error.message
    });
  }
});
app.get("/api/my-courses/:studentId", async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      studentId: req.params.studentId
    }).populate("studentId");

    res.json(enrollments);
  } catch (error) {
    res.status(400).json({
      message: "Failed to get my courses",
      error: error.message
    });
  }
});



const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
app.post("/api/enrollments", async (req, res) => {
  try {
    const enrollment = await Enrollment.create({
      studentId: req.body.studentId,
      courseId: req.body.courseId
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(400).json({
      message: "Enrollment creation failed",
      error: error.message
    });
  }
});
app.get("/api/enrollments/student/:studentId", async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      studentId: req.params.studentId
    }).populate("studentId");

    res.json(enrollments);
  } catch (error) {
    res.status(400).json({
      message: "Failed to get enrolled courses",
      error: error.message
    });
  }
});
const progressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  courseId: {
    type: Number,
    required: true
  },
  lessonId: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
});

const Progress = mongoose.model("Progress", progressSchema);
app.post("/api/progress", async (req, res) => {
  try {
    const progress = await Progress.create({
      studentId: req.body.studentId,
      courseId: req.body.courseId,
      lessonId: req.body.lessonId,
      completed: req.body.completed || false
    });

    res.status(201).json(progress);
  } catch (error) {
    res.status(400).json({
      message: "Progress creation failed",
      error: error.message
    });
  }
});
app.put("/api/progress/:id", async (req, res) => {
  try {
    const progress = await Progress.findByIdAndUpdate(
      req.params.id,
      {
        completed: true,
        completedAt: new Date()
      },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({
        message: "Progress not found"
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(400).json({
      message: "Progress update failed",
      error: error.message
    });
  }
});
app.get("/api/progress/course/:studentId/:courseId", async (req, res) => {
  try {
    const progress = await Progress.find({
      studentId: req.params.studentId,
      courseId: req.params.courseId
    });

    const totalLessons = progress.length;
    const completedLessons = progress.filter(
      item => item.completed === true
    ).length;

    const percentage =
      totalLessons === 0
        ? 0
        : (completedLessons / totalLessons) * 100;

    res.json({
      studentId: req.params.studentId,
      courseId: req.params.courseId,
      totalLessons,
      completedLessons,
      progressPercentage: percentage
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to get course progress",
      error: error.message
    });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create({
      userId: req.body.userId,
      course: req.body.course,
      rollNumber: req.body.rollNumber,
      age: req.body.age
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({
      message: "Student creation failed",
      error: error.message
    });
  }
});
app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("userId");

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(student);
  } catch (error) {
    res.status(400).json({
      message: "Invalid student ID"
    });
  }
});

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
app.post("/api/instructor/courses", async (req, res) => {
  try {
    if (!req.body.title || !req.body.description || !req.body.instructorId) {
  return res.status(400).json({
    message: "Title, description and instructorId are required"
  });
}
    const course = {
      id: courses.length + 1,
      title: req.body.title,
      description: req.body.description,
      instructorId: req.body.instructorId
    };

    courses.push(course);

    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({
      message: "Course creation failed",
      error: error.message
    });
  }
});
app.put("/api/instructor/courses/:id", async (req, res) => {
  try {
    const course = courses.find(
      item => item.id === Number(req.params.id)
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    course.title = req.body.title || course.title;
    course.description = req.body.description || course.description;
    course.instructorId = req.body.instructorId || course.instructorId;

    res.json(course);
  } catch (error) {
    res.status(400).json({
      message: "Course update failed",
      error: error.message
    });
  }
});
app.delete("/api/instructor/courses/:id", async (req, res) => {
  try {
    const index = courses.findIndex(
      item => item.id === Number(req.params.id)
    );

    if (index === -1) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    const deletedCourse = courses.splice(index, 1);

    res.json({
      message: "Course deleted successfully",
      course: deletedCourse[0]
    });
  } catch (error) {
    res.status(400).json({
      message: "Course deletion failed",
      error: error.message
    });
  }
});
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "User deleted successfully",
      user
    });
  } catch (error) {
    res.status(400).json({
      message: "User deletion failed",
      error: error.message
    });
  }
});
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get users",
      error: error.message
    });
  }
});
app.get("/api/admin/courses", (req, res) => {
  try {
    res.json(courses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get courses",
      error: error.message
    });
  }
});
app.delete("/api/admin/courses/:id", (req, res) => {
  try {
    const index = courses.findIndex(
      item => item.id === Number(req.params.id)
    );

    if (index === -1) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    const deletedCourse = courses.splice(index, 1);

    res.json({
      message: "Course deleted successfully",
      course: deletedCourse[0]
    });
  } catch (error) {
    res.status(400).json({
      message: "Course deletion failed",
      error: error.message
    });
  }
});
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: "GENERAL"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model("Notification", notificationSchema);
app.post("/api/notifications", async (req, res) => {
  try {
    if (!req.body.userId || !req.body.title || !req.body.message) {
  return res.status(400).json({
    message: "userId, title and message are required"
  });
}
    const notification = await Notification.create({
      userId: req.body.userId,
      title: req.body.title,
      message: req.body.message,
      type: req.body.type
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({
      message: "Notification creation failed",
      error: error.message
    });
  }
});
app.get("/api/notifications/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(400).json({
      message: "Failed to get notifications",
      error: error.message
    });
  }
});
app.post("/api/notifications/course", async (req, res) => {
  try {
    const notification = await Notification.create({
      userId: req.body.userId,
      title: req.body.title,
      message: req.body.message,
      type: "COURSE"
    });

    res.status(201).json({
      message: "Course notification sent successfully",
      notification
    });
  } catch (error) {
    res.status(400).json({
      message: "Course notification failed",
      error: error.message
    });
  }
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
app.post("/api/payments", async (req, res) => {
  try {
    const payment = await Payment.create({
      studentId: req.body.studentId,
      courseId: req.body.courseId,
      amount: req.body.amount,
      status: req.body.status
    });

    if (payment.status === "SUCCESS") {
      await Enrollment.create({
        studentId: payment.studentId,
        courseId: payment.courseId
      });
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({
      message: "Payment failed",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});