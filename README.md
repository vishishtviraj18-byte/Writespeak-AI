# ✏️ WriteSpeak AI — Kids Air Writing Learning Platform

<div align="center">

![WriteSpeak AI](https://img.shields.io/badge/WriteSpeak-AI-00A5DC?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-4285F4?style=for-the-badge&logo=google)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A Doraemon-themed educational web app where children learn alphabets and numbers by writing in the air using hand gestures!**

</div>

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| ✋ **Air Writing** | Draw letters/numbers in the air with your index finger |
| 🤖 **Doraemon UI** | Fully animated, child-friendly cartoon interface |
| 👁️ **Real-time OCR** | Tesseract.js evaluates your writing instantly in-browser |
| 🌌 **Cartoon World** | Background segmentation replaces room with animated sky |
| 🖱️ **Mouse Mode** | Draw with mouse/touch as an alternative to gestures |
| 🎮 **3 Mini Games** | Match the Character, Emoji→Letter, Memory Flash |
| 🧪 **Test Mode** | Full quiz with grading and answer review |
| 📊 **Progress Tracking** | Stars, streaks, accuracy, badge system |
| 🔐 **User Auth** | Signup/Login with name, age, gender profile |
| ⚙️ **Settings Panel** | Mute voice, choose pen color, adjust gesture sensitivity |

---

## 🎮 Gesture Controls

| Gesture | Action |
|---------|--------|
| ☝️ **Index Finger Up** | Draw in the air |
| ✊ **Fist** | Submit your writing |
| ✋ **Open Palm** | Clear the canvas |
| 👍 **Thumbs Up** | Hear the letter again |

> Hold each gesture for ~1 second to trigger it

---

## 🏗️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **MediaPipe Hands** — real-time hand landmark detection
- **MediaPipe Selfie Segmentation** — background removal
- **Tesseract.js** — in-browser OCR evaluation
- **GSAP** — smooth animations
- **canvas-confetti** — celebration effects
- **Web Speech API** — voice instructions (TTS)

### Backend
- **Java 17** + **Spring Boot 3**
- **H2 In-Memory Database** — progress & user storage
- **Tess4J** — server-side Tesseract OCR (optional)
- **Spring Data JPA** — ORM

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.8+

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# → Opens on http://localhost:5173
```

### Backend Setup

```bash
cd backend
mvn spring-boot:run
# → Runs on http://localhost:8080
```

> **Note:** The app works fully offline without the backend. Tesseract.js runs entirely in the browser!

---

## 📁 Project Structure

```
writespeak-ai/
├── frontend/                   ← React + Vite
│   └── src/
│       ├── components/
│       │   ├── WelcomeScreen   ← Doraemon animated landing
│       │   ├── LearningMode    ← Main air-writing screen
│       │   ├── DrawingCanvas   ← Hand gesture + mouse drawing
│       │   ├── TestMode        ← Quiz with grading
│       │   ├── MiniGame        ← 3 interactive games
│       │   ├── ProgressDashboard
│       │   ├── LoginPage / SignupPage
│       │   └── SettingsPanel
│       ├── context/
│       │   ├── AuthContext     ← User authentication
│       │   └── SettingsContext ← Mute, color, sensitivity
│       ├── hooks/
│       │   └── useProgress     ← Stars, streaks, badges
│       └── utils/
│           └── api.js          ← Backend API calls
│
└── backend/                    ← Spring Boot
    └── src/main/java/com/writespeak/
        ├── controller/         ← REST endpoints
        ├── service/            ← Business logic
        ├── model/              ← JPA entities
        └── repository/         ← Database access
```

---

## 🎯 Learning Flow

```
1. Sign up with name, age, gender & favourite colour
         ↓
2. Doraemon Welcome Screen
         ↓
3. Choose: Alphabets (A-Z) or Numbers (0-9)
         ↓
4. Webcam starts → Background becomes magical cartoon sky
         ↓
5. Faint letter guide appears on screen
         ↓
6. Child traces the letter in the air with their finger
         ↓
7. Make a FIST ✊ to submit → OCR reads the drawing
         ↓
8. ✅ Correct → Stars, confetti, voice reward, next letter
   ❌ Wrong   → Encouraging message, try again
         ↓
9. Complete all letters → Test Mode & Mini Games unlock!
```

---

## 🏅 Badge System

| Badge | Condition |
|-------|-----------|
| 🌱 First Letter | Complete first alphabet |
| ⭐ Star Collector | Earn 5+ stars |
| 🔥 On Fire! | 3 correct in a row |
| 📚 Half Way! | Complete 13+ alphabets |
| 🔢 Number Starter | Complete first number |
| 🏆 Champion! | Complete all A-Z and 0-9 |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/ocr/process` | Server-side OCR |
| `GET`  | `/api/progress/:id` | Get progress |
| `POST` | `/api/progress/correct` | Mark correct |
| `POST` | `/api/progress/wrong` | Mark wrong |
| `POST` | `/api/test/evaluate` | Grade test |

---

## 📝 Resume Description

**WriteSpeak AI — Kids Air Writing Learning Platform**
*React · Java Spring Boot · MediaPipe · Tesseract.js · GSAP*

Built a full-stack, gamified educational web application enabling children to learn A–Z alphabets and 0–9 numbers through real-time air writing using webcam-based hand gesture tracking. Engineered a 4-layer canvas compositing system with MediaPipe Selfie Segmentation for background removal, placing children inside an animated cartoon world. Implemented in-browser OCR using Tesseract.js (WebAssembly) with a pixel binarization pipeline to evaluate hand-drawn characters. Built a gesture recognition engine with configurable sensitivity thresholds using PIP-joint landmark comparison. Designed a complete gamification system including stars, streaks, accuracy tracking, badge unlocking, test mode with auto-grading, and 3 mini-games. Implemented user authentication with profile storage (name, age, gender) in H2/JPA, with a localStorage offline fallback. Frontend features a Doraemon-themed animated UI with GSAP physics animations, Web Speech API TTS, and a real-time settings panel for pen color, mute, and gesture sensitivity.

---

## 👤 Author

**Vishisht Viraj**
- GitHub: [@vishishtviraj18-byte](https://github.com/vishishtviraj18-byte)

---

## 📄 License

MIT License — feel free to use this project for learning and inspiration!
