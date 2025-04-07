# 🎞️ Timelapse Counter

**Timelapse Counter** est une application web minimaliste et esthétique permettant de générer un **décompte numérique animé** jusqu’à un nombre donné, avec export en vidéo (`.webm`).

> 💡 Utilisation idéale pour des présentations, animations, ou vidéos sociales stylisées.

---

## 🚀 Fonctionnalités

- ✅ Saisie du nombre final
- 🎨 Personnalisation du texte :
  - Couleur
  - Police (dont support de polices personnalisées comme OPTIGamma)
  - Gras
  - Taille automatique ou manuelle
- ⏱️ Contrôle de la vitesse du timelapse
- 🖼️ Interface au design **Neumorphic UI**
- ▶️ Lecture du timelapse dans une vue dédiée
- ⏸️ Boutons **Pause / Reprendre / Rejouer / Retour**
- 📹 Enregistrement automatique du timelapse (canvas → `video/webm`)
- 💾 Bouton **"Exporter la vidéo"** (apparaît à la fin du timelapse)
- 🔁 Option manuelle de conversion `.webm` vers `.mp4`

---

## 🧪 Technologies

- HTML5 / CSS3 (flex, input UI, font, etc.)
- JavaScript Vanilla (DOM, MediaRecorder API, Canvas API)

---

## 📂 Structure

```
📁 assets/
 ┣ 📁 scripts/
 ┃ ┗ 📄 index.js         → logiques du compteur + enregistrement
 ┣ 📁 styles/
 ┃ ┗ 📄 index.css        → design Neumorphic
📄 index.html              → structure de la page
```

---

## 🧠 Utilisation

1. Clone ou télécharge ce repo :
   ```bash
   git clone https://github.com/M10-white/decompte-nombre.git
   cd timelapse-counter
   ```

2. Ouvre `index.html` dans ton navigateur.

3. Personnalise ton timelapse depuis l’interface, clique sur **Lancer**.

4. Une fois le décompte terminé, clique sur **"Exporter la vidéo"**.

---

## 📝 Conversion en `.mp4` (optionnelle)

Le fichier exporté est au format `.webm`.  
Tu peux le convertir facilement en `.mp4` avec :

### ✅ En ligne
[convertio.co/webm-mp4](https://convertio.co/fr/webm-mp4/)

### 💻 En local (via FFmpeg)
```bash
ffmpeg -i timelapse.webm -c:v libx264 -crf 23 timelapse.mp4
```

---

## 📸 Aperçu

![timelapse preview](preview.png) <!-- Ajoute un visuel de ton app ici -->

---

## 📄 Licence

Projet personnel ou éducatif — **non destiné à la distribution commerciale**.

---

## 💡 Crédits

Développé avec ❤️ par [CHKWEBDEV](https://github.com/ton-utilisateur)  
Police custom : [OPTIGamma](https://www.ffonts.net/OPTIGamma.font)

---
