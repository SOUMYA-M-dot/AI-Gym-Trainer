// src/utils/audioCoach.js

class AudioCoach {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isMuted = false;
    this.lastSpokenTime = 0;
    this.lastFeedback = '';
    this.feedbackCooldownMs = 3500; // Do not spam the same correction continuously
    this.audioCtx = null;
  }

  initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  playRepChime() {
    if (this.isMuted) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  speak(text, priority = false) {
    if (this.isMuted || !this.synth) return;

    // If it's a rep count (e.g. number), announce promptly
    if (priority) {
      this.synth.cancel(); // Cancel any lingering utterance
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Select an English voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    this.synth.speak(utterance);
  }

  announceRep(repNumber) {
    this.playRepChime();
    this.speak(String(repNumber), true);
  }

  announceCorrection(feedbackText) {
    if (!feedbackText || feedbackText === 'Perfect execution!' || this.isMuted) return;

    const now = Date.now();
    if (feedbackText === this.lastFeedback && now - this.lastSpokenTime < this.feedbackCooldownMs) {
      return;
    }

    this.lastFeedback = feedbackText;
    this.lastSpokenTime = now;
    this.speak(feedbackText, false);
  }
}

export const audioCoach = new AudioCoach();
export default audioCoach;
