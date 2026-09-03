// src/components/CameraFeed.jsx
import React, { useRef, useEffect, useState } from 'react';
import { VideoOff, Eye } from 'lucide-react';

const POSE_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [24, 26], [25, 27], [26, 28],
  [27, 29], [28, 30], [29, 31], [30, 32], [27, 31], [28, 32]
];

const CameraFeed = ({ onPoseResults, badJoints = [], isMirrored = true, theme = 'dark' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Store mutable values in refs to avoid restarting camera on prop changes
  const badJointsRef = useRef(badJoints);
  const isMirroredRef = useRef(isMirrored);
  const showSkeletonRef = useRef(showSkeleton);
  const onPoseResultsRef = useRef(onPoseResults);

  useEffect(() => {
    badJointsRef.current = badJoints;
  }, [badJoints]);

  useEffect(() => {
    isMirroredRef.current = isMirrored;
  }, [isMirrored]);

  useEffect(() => {
    showSkeletonRef.current = showSkeleton;
  }, [showSkeleton]);

  useEffect(() => {
    onPoseResultsRef.current = onPoseResults;
  }, [onPoseResults]);

  const isDark = theme === 'dark';

  // Initialize camera and pose engine ONCE on mount
  useEffect(() => {
    let cameraInstance = null;
    let poseInstance = null;
    let isCancelled = false;

    const startCamera = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const Pose = window.Pose;
      const Camera = window.Camera;

      if (!Pose || !Camera) {
        console.warn('Waiting for MediaPipe global scripts...');
        setTimeout(startCamera, 300);
        return;
      }

      try {
        poseInstance = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        poseInstance.setOptions({
          modelComplexity: 0,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        poseInstance.onResults((results) => {
          if (isCancelled || !canvasRef.current) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          if (canvas.width !== results.image.width || canvas.height !== results.image.height) {
            canvas.width = results.image.width;
            canvas.height = results.image.height;
          }

          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Handle mirroring if enabled
          if (isMirroredRef.current) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }

          // Draw webcam video frame
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks && showSkeletonRef.current) {
            const currentBadJoints = badJointsRef.current || [];

            // Draw connecting skeleton bones
            POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
              const start = results.poseLandmarks[startIdx];
              const end = results.poseLandmarks[endIdx];

              if (start && end && (start.visibility === undefined || start.visibility > 0.4) && (end.visibility === undefined || end.visibility > 0.4)) {
                const isFaulty = currentBadJoints.includes(startIdx) || currentBadJoints.includes(endIdx);

                ctx.beginPath();
                ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
                ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
                ctx.lineWidth = isFaulty ? 6 : 3.5;
                ctx.strokeStyle = isFaulty ? '#ef4444' : '#22c55e';
                ctx.lineCap = 'round';
                ctx.stroke();
              }
            });

            // Draw joint landmarks
            results.poseLandmarks.forEach((lm, idx) => {
              if (lm.visibility !== undefined && lm.visibility < 0.4) return;
              const isFaulty = currentBadJoints.includes(idx);

              ctx.beginPath();
              ctx.arc(lm.x * canvas.width, lm.y * canvas.height, isFaulty ? 7 : 4.5, 0, 2 * Math.PI);
              ctx.fillStyle = isFaulty ? '#ef4444' : '#10b981';
              ctx.fill();
              ctx.lineWidth = 2;
              ctx.strokeStyle = '#ffffff';
              ctx.stroke();
            });
          }

          ctx.restore();

          if (onPoseResultsRef.current) {
            onPoseResultsRef.current(results);
          }
        });

        cameraInstance = new Camera(videoRef.current, {
          onFrame: async () => {
            if (!isCancelled && videoRef.current && poseInstance) {
              await poseInstance.send({ image: videoRef.current });
              if (!isCameraReady) setIsCameraReady(true);
            }
          },
          width: 640,
          height: 480
        });

        await cameraInstance.start();
      } catch (err) {
        console.error('Camera stream error:', err);
        setHasPermissionError(true);
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (cameraInstance) {
        try {
          cameraInstance.stop();
        } catch (e) {}
      }
      if (poseInstance) {
        try {
          poseInstance.close();
        } catch (e) {}
      }
    };
  }, []); // Run once on mount!

  return (
    <div className={`relative w-full h-full min-h-[400px] flex items-center justify-center rounded-2xl overflow-hidden shadow-sm transition-colors ${
      isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-slate-100 border border-slate-200'
    }`}>
      <video ref={videoRef} className="hidden" playsInline muted autoPlay></video>
      <canvas ref={canvasRef} className="w-full h-full object-cover"></canvas>

      {/* Loading & Status Overlay */}
      {!isCameraReady && !hasPermissionError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/80 backdrop-blur-xs text-white z-20">
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Starting camera stream...</p>
        </div>
      )}

      {hasPermissionError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-zinc-950/90 text-white z-20">
          <VideoOff size={36} className="text-rose-400" />
          <h4 className="font-bold text-lg">Camera Access Blocked</h4>
          <p className="text-sm text-zinc-400 max-w-sm">
            Please allow camera permissions in your browser address bar to enable live posture tracking.
          </p>
        </div>
      )}

      {/* Top Floating Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold text-emerald-400 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Tracking
        </div>
      </div>

      {/* Skeleton Toggle Button */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setShowSkeleton(!showSkeleton)}
          title="Toggle Skeleton Overlay"
          className={`p-2 rounded-xl backdrop-blur-md border text-xs font-medium transition-all cursor-pointer ${
            showSkeleton 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
              : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
};

export default CameraFeed;
