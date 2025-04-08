const express = require("express");
const multer = require("multer");
const cors = require("cors");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

// Création automatique des dossiers
["uploads", "backend/converted"].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Autorise le frontend
app.use(cors());

// Sert le frontend (index.html + assets)
app.use(express.static(path.join(__dirname, "..")));

app.post("/convert", upload.single("video"), (req, res) => {
  console.log("✅ Route /convert bien appelée");

  if (!req.file) {
    console.error("❌ Aucune vidéo reçue");
    return res.status(400).send("Aucun fichier reçu.");
  }

  const format = req.query.format || "mov";
  const outputName = `output.${format}`;
  const outputPath = path.join(__dirname, "converted", outputName);

  ffmpeg(req.file.path)
    .outputOptions(["-pix_fmt yuv420p"])
    .toFormat(format)
    .on("end", () => {
      console.log("✅ Conversion terminée :", outputName);
      fs.unlinkSync(req.file.path);
      res.download(outputPath, () => {
        fs.unlinkSync(outputPath);
      });
    })
    .on("error", err => {
      console.error("❌ FFmpeg error:", err);
      res.status(500).send("Conversion failed");
    })
    .save(outputPath);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
