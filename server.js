const express = require("express");
const path = require("path");
const multer = require("multer");
const vision = require("@google-cloud/vision");
const app = express();
const fs = require("fs");

app.use(express.static(path.join(__dirname, "public")));

// Configure multer for file uploads
const upload = multer({
  dest: "/tmp",
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB file size limit
  },
});

// Google Vision Client
const client = new vision.ImageAnnotatorClient();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Handle image upload
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const filePath = req.file.path;
    const [result] = await client.labelDetection(filePath);
    const labels = result.labelAnnotations;
    res.json({ labels });
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error during image analysis:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the image." });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
