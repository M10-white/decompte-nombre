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

app.get("/convert-locally-mov", (req, res) => {
    res.status(200).json({
      message: "La conversion MOV avec transparence est trop lourde pour le serveur.",
      instructions: [
        "1. Télécharge ta vidéo en .webm comme d'habitude.",
        "2. Installe FFmpeg (si ce n’est pas déjà fait) : https://ffmpeg.org/download.html",
        "3. Place la vidéo .webm dans un dossier sur ton ordinateur.",
        "4. Ouvre un terminal dans ce dossier.",
        "5. Exécute la commande ci-dessous pour générer un .mov avec transparence :",
      ],
      ffmpeg_command: "ffmpeg -i timelapse.webm -c:v prores_ks -pix_fmt yuva444p10le -profile:v 4 timelapse.mov"
    });
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

  let ffmpegCommand = ffmpeg(req.file.path);

  if (format === "webm") {
    ffmpegCommand = ffmpegCommand
      .videoCodec("libvpx")
      .outputOptions([
        "-pix_fmt yuva420p",         // Avec transparence
        "-auto-alt-ref 0",           // Désactive l'auto-ref (problème alpha parfois)
        "-b:v 0",                    // On utilise le CRF uniquement
        "-crf 5",                    // Qualité haute (baisser le nombre = meilleure qualité)
        "-cpu-used 0",              // Qualité max (mais plus lent)
        "-r 30"                      // 30 FPS
      ]);  

    } else if (format === "mov") {
        ffmpegCommand = ffmpegCommand
          .videoCodec("prores_ks")
          .outputOptions([
            "-pix_fmt yuva444p10le",
            "-profile:v 4",
            "-r 30",
            "-b:v 3M"
          ]);
      
  } else {
    // .mp4 ou autre, sans alpha
    ffmpegCommand = ffmpegCommand
      .videoCodec("libx264")
      .outputOptions([
        "-pix_fmt yuv420p",
        "-r 30",
        "-b:v 1M",
        "-preset ultrafast",
        "-movflags +faststart",
        "-max_muxing_queue_size 1024"
      ]);
  }

  ffmpegCommand
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
