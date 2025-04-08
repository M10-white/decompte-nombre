const express = require("express");
const multer = require("multer");
const cors = require("cors");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.static("public"));

app.post("/convert", upload.single("video"), (req, res) => {
  const format = req.query.format || "mov";
  const outputName = `output.${format}`;
  const outputPath = path.join(__dirname, "converted", outputName);

  ffmpeg(req.file.path)
    .outputOptions(["-pix_fmt yuv420p"])
    .toFormat(format)
    .on("end", () => {
      fs.unlinkSync(req.file.path); // Nettoyage
      res.download(outputPath, () => {
        fs.unlinkSync(outputPath);
      });
    })
    .on("error", err => {
      console.error("FFmpeg error:", err);
      res.status(500).send("Conversion failed.");
    })
    .save(outputPath);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
