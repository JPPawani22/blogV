import express from "express";
import postRoutes from "./routes/posts.js"
import userRoutes from "./routes/users.js"
import authRoutes from "./routes/auth.js"
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json())
app.use(cookieParser())

// Serve static files from backend upload directory
app.use('/upload', express.static(path.join(__dirname, 'upload')));

// Create upload directory in backend
const uploadDir = path.join(__dirname, 'upload');

// Multer configuration - save to backend upload directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-';
    cb(null, uniqueSuffix + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

app.post("/api/upload", upload.single("file"), function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const file = req.file;
    res.status(200).json({ 
      filename: file.filename,
      message: "File uploaded successfully"
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)

app.listen(8800, () => {
  console.log("Connected!");
  console.log(`Upload directory: ${uploadDir}`);
});