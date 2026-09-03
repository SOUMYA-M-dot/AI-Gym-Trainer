# 🏋️‍♂️ AI Gym Trainer

> **Train smarter, move better, and stay injury-free — right from your browser.**  
> An intelligent, privacy-first personal fitness coach powered by real-time computer vision and generative AI.

---

## 🌟 Why AI Gym Trainer? (The Problem & Why This Is Needed)

Working out from home or exercising solo in the gym comes with a familiar set of frustrations and risks:

- **⚠️ The "Form Blindspot" & Injury Risk**  
  When you exercise alone, you cannot see yourself objectively. Are your knees caving inward during squats? Is your lower back sagging during planks? Are you swinging your elbows during bicep curls? Without someone watching, poor form quickly becomes muscle memory, leading to chronic joint pain, tendon strain, or severe injuries.

- **💸 The Personal Training Cost Barrier**  
  Hiring a certified personal trainer costs anywhere from **$60 to $120+ per hour**. For millions of students, working professionals, and fitness enthusiasts, that is simply not financially sustainable long-term. Expert form guidance should not be a luxury reserved for the few.

- **🔒 The Privacy Dilemma with Smart Fitness Apps**  
  Most modern smart cameras and fitness apps upload your live video streams to cloud servers for server-side processing. Nobody wants a live video feed of their bedroom, living room, or home gym streaming over the internet. **AI Gym Trainer solves this by running 100% locally in your browser** using client-side WebAssembly and GPU acceleration. Your camera feed never leaves your device.

- **📉 Cheated Reps & The Solo Workout Plateau**  
  When fatigue sets in during solo workouts, it is easy to cheat reps by cutting your range of motion short. AI Gym Trainer acts as an honest training partner: it validates full range-of-motion using precise joint trigonometry, counting only reps executed with correct form.

- **🧠 Conflicting Fitness Advice & Need for Instant Guidance**  
  When you have a question about progressive overload, muscle soreness, or warmup routines, searching online often leads to contradictory forum posts and sponsored ads. AI Gym Trainer integrates **Google Gemini AI** as an empathetic, knowledgeable coach available 24/7.

---

## ✨ Features

### 👁️ Real-Time Computer Vision Tracking
- Tracks **33 full-body skeletal landmarks** at 30+ FPS using Google MediaPipe Pose (BlazePose).
- **Bilateral Detection**: Dynamically detects whether your left or right profile has clearer visibility and tracks accordingly.
- **Biomechanical Angle Calculations**: Continuously measures joint angles (elbow, knee, hip, shoulder) using 3-point vector trigonometry.

### 🗣️ Spoken Voice Coach
- Integrated with the **Web Speech API** to provide hands-free audio cues.
- Speaks rep counts out loud so you don’t have to stare at the screen.
- Gives instant posture corrections (e.g., *"Keep your back straight"*, *"Go lower on your squat"*, *"Full extension"*).

### 🤖 3D Digital Twin
- Renders an interactive **Three.js 3D skeletal avatar** that mirrors your biomechanics in real time.
- Orbit, rotate, and zoom around your digital twin to analyze your movement paths from any perspective.

### 💬 Coach AI (Powered by Gemini)
- An in-app conversational fitness mentor powered by **Google Gemini 1.5 Flash**.
- Ask about workout regimens, recovery tips, stretching routines, nutrition advice, and exercise modifications.

### 📊 Comprehensive Workout Analytics
- Tracks reps, sets, workout duration, and form accuracy percentage.
- Estimates calorie expenditure based on scientific **Metabolic Equivalent of Task (MET)** values for each movement.
- Persists workout history locally so you can monitor streaks and progression over time.

### 🎨 Clean, Athletic User Experience
- Built with a modern dark/light athletic interface.
- Responsive split-screen views (Camera Feed, 3D Twin, Form Diagnostics, and Telemetry).

---

## 🤸 Supported Exercises & Form Validation

| Exercise | Primary Muscle Group | Biomechanical Form Checkpoints |
| :--- | :--- | :--- |
| **Bicep Curls** | Biceps Brachii | Full flexion (<35°) & extension (>150°); prevents elbow drift |
| **Bodyweight Squats** | Quadriceps & Glutes | Deep hip crease (<90° knee angle); neutral spine alignment |
| **Standard Push-ups** | Chest & Triceps | Chest depth (<90° elbow flexion); strict plank posture |
| **Forward Lunges** | Quads & Hamstrings | 90° front knee bend; torso upright, avoiding forward lean |
| **Overhead Shoulder Press** | Deltoids & Trapezius | Full lockout above head; controlled eccentric lowering |
| **Lateral Raises** | Lateral Deltoids | Arm elevation parallel to ground (80°-95°); checks swinging |
| **Plank Hold** | Core & Transverse Abdominis | Hip-shoulder-ankle linear alignment (165°-180°); sag alerts |
| **Jumping Jacks** | Full Body Cardio | Coordinated arm overhead extension with wide leg abduction |

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Computer Vision**: [Google MediaPipe Pose](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
- **3D Graphics & Simulation**: [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/), [@react-three/drei](https://github.com/pmndrs/drei)
- **Generative AI Coach**: [Google Generative AI SDK](https://github.com/google/generative-ai-js) (Gemini 1.5 Flash)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons & UI**: [Lucide React](https://lucide.dev/)
- **Voice Feedback**: Web Speech Synthesis API

---

## 🚀 Quickstart Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher recommended)
- A working webcam / integrated camera
- Modern browser (Chrome, Edge, or Brave recommended for optimal WebGL & MediaPipe performance)

### 1. Clone the Repository
```bash
git clone https://github.com/SOUMYA-M-dot/AI-Gym-Trainer.git
cd AI-Gym-Trainer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Gemini API Key *(Optional for AI Coach)*
If you want to use the integrated Coach AI chatbot, grab a free API key from [Google AI Studio](https://aistudio.google.com/).

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your key inside `.env`:
```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Note: `.env` is ignored by Git to keep your credentials safe.)*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser, allow camera permissions, and start your workout!

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## 🔒 Privacy & Safety Guarantee

- **Zero Cloud Video Ingestion**: All pose landmark inference runs strictly client-side inside your browser sandbox.
- **No Video Recording**: Your video stream is analyzed frame-by-frame on memory and immediately discarded. No video is ever recorded, saved, or uploaded.
- **Safety First**: While AI Gym Trainer provides biomechanical guidance, always consult a healthcare professional before starting any intense physical exercise routine, especially if you have pre-existing injuries.

---

