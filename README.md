# AI Gym Trainer 🏋️‍♂️

A real-time, computer-vision fitness tracking web application built with **React 19**, **Vite**, **MediaPipe Pose**, and **Three.js**.

## Features

- **Real-Time Skeleton Tracking**: 33 body keypoints detected via MediaPipe Pose (BlazePose Lite).
- **8 Exercise Routines**:
  - Bicep Curls
  - Bodyweight Squats
  - Standard Push-ups
  - Forward Lunges
  - Overhead Shoulder Press
  - Lateral Raises
  - Plank Hold (Timer + Posture)
  - Jumping Jacks
- **Bilateral Detection**: Automatically selects and monitors the visible limb (Left or Right) based on confidence.
- **3D Digital Twin**: Interactive 3D Three.js skeletal twin with orbit controls and split-screen mode.
- **Voice Audio Coach**: Spoken rep counts and real-time posture correction cues using the Web Speech API.
- **Light & Dark Theme**: Modern athletic design with one-click theme toggle.
- **Coach AI**: Real-time fitness guidance powered by Google Gemini 1.5 Flash.
- **Workout Analytics & Persistence**: Session logging, calorie estimation (MET), and history tracking stored locally.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Gemini API Key (Optional for AI Chatbot):**
   Copy `.env.example` to `.env` and add your Google Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Build for Production:**
   ```bash
   npm run build
   ```
