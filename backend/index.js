const express = require("express");
const multer = require("multer");
const cors = require("cors");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const app = express();
const upload = multer({ dest: "uploads/" });

// Crée automatiquement les dossiers nécessaires
["uploads", "backend/converted"].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Détection manuelle de ffmpeg (Railway/Nixpacks)
function findFFmpegBinary() {
  try {
    const ffmpegPath = execSync("which ffmpeg").toString().trim();
    ffmpeg.setFfmpegPath(ffmpegPath);
    console.log("✅ FFmpeg trouvé :", ffmpegPath);
  } catch (error) {
    console.error("❌ Impossible de trouver ffmpeg automatiquement");
  }
}

findFFmpegBinary();

app.use(cors());

// Sert le frontend
const publicPath = path.join(__dirname, "..");
app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.post("/convert", upload.single("video"), (req, res) => {
  console.log("✅ Route /convert bien appelée");

  if (!req.file) {
    console.error("❌ Aucune vidéo reçue");
    return res.status(400).send("Aucun fichier reçu.");
  }

  const format = req.query.format || "mov";
  const outputName = `output.${format}`;
  const outputPath = path.join(__dirname, "converted", outputName);

  console.log(`ℹ️ Conversion en cours : ${req.file.path} -> ${outputPath}`);

  ffmpeg(req.file.path)
    .outputOptions([
        "-r 30",
        "-pix_fmt yuv420p",
        "-movflags +faststart", // optimisation pour lecture web
        "-b:v 1M",
        "-preset ultrafast",     // moins exigeant en ressources
        "-max_muxing_queue_size 1024", // pour éviter les erreurs de muxing
    ])
    .toFormat(format)
    .on("start", commandLine => {
      console.log("🎬 Commande lancée :", commandLine);
    })
    .on("end", () => {
      console.log("✅ Conversion terminée :", outputName);
      fs.unlinkSync(req.file.path);
      res.download(outputPath, () => {
        fs.unlinkSync(outputPath);
      });
    })
    .on("error", err => {
      console.error("❌ FFmpeg error:", err.message);
      res.status(500).send("Conversion failed: " + err.message);
    })
    .save(outputPath);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
