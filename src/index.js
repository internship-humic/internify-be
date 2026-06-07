require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const lowonganMagangRoutes = require('./routes/lowonganMagang.routes');
const lamaranMagangRoutes = require('./routes/lamaranMagang.routes');
const mahasiswaRoutes = require('./routes/mahasiswa.routes');
const partnershipRoutes = require('./routes/partnership.routes');
const hasilResearchRoutes = require('./routes/hasilResearch.routes');
const faqRoutes = require('./routes/faq.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const batchRoutes = require('./routes/batch.routes');
const projectRoutes = require('./routes/project.routes');
const setupSwaggerDocs = require('./docs/swagger');

const PORT = process.env.PORT;
const app = express();

const corsOptions = {
  origin: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  optionsSuccessStatus: 200,
};

const uploadDir = process.env.NODE_ENV === 'production'
  ? '/tmp/uploads'
  : path.join(__dirname, 'uploads');

app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cors(corsOptions));

app.use("/uploads", express.static(uploadDir), (req, res, next) => {
  if (!res.headersSent) {
    res.status(404).json({
      status: false,
      message: `File not found: ${req.path}`,
      code: 404
    });
  }
});
app.use("/admin-api", adminRoutes);
app.use("/auth-api", authRoutes);
app.use("/lowongan-magang-api", lowonganMagangRoutes);
app.use("/lamaran-magang-api", lamaranMagangRoutes);
app.use("/mahasiswa-api", mahasiswaRoutes);
app.use("/partnership-api", partnershipRoutes);
app.use("/hasil-research-api", hasilResearchRoutes);
app.use("/faq-api", faqRoutes);
app.use("/feedback-api", feedbackRoutes);
app.use("/batch-api", batchRoutes);
app.use("/project-api", projectRoutes);
// app.use("/project-member-api", projectMemberRoutes);
// app.use("/task-api", taskRoutes);


setupSwaggerDocs(app);

app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: `Route not found: ${req.method} ${req.path}`,
    code: 404
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`);
  });
}

module.exports = app;

/*
  NOTE : saran saya untuk penamaan variabel untuk setiap response dibuat konsisten menjadi inggris, tolong komunikasi aja ke fe 😁
*/
