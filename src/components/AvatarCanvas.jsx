// src/components/AvatarCanvas.jsx
import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// MediaPipe standard 33 pose landmark connection pairs
const POSE_CONNECTIONS = [
  // Head / Face
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  // Arms
  [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  // Torso
  [11, 23], [12, 24], [23, 24],
  // Legs
  [23, 25], [24, 26], [25, 27], [26, 28],
  [27, 29], [28, 30], [29, 31], [30, 32], [27, 31], [28, 32]
];

// Default idle pose for when camera is starting or no person detected
const IDLE_POSE_POINTS = [
  new THREE.Vector3(0, 1.6, 0),    // 0: Nose
  new THREE.Vector3(-0.1, 1.65, 0), // 1
  new THREE.Vector3(-0.15, 1.65, 0),// 2
  new THREE.Vector3(-0.2, 1.65, 0), // 3
  new THREE.Vector3(0.1, 1.65, 0),  // 4
  new THREE.Vector3(0.15, 1.65, 0), // 5
  new THREE.Vector3(0.2, 1.65, 0),  // 6
  new THREE.Vector3(-0.3, 1.6, 0),  // 7: L Ear
  new THREE.Vector3(0.3, 1.6, 0),   // 8: R Ear
  new THREE.Vector3(-0.1, 1.5, 0),  // 9: Mouth L
  new THREE.Vector3(0.1, 1.5, 0),   // 10: Mouth R
  new THREE.Vector3(-0.6, 1.3, 0),  // 11: L Shoulder
  new THREE.Vector3(0.6, 1.3, 0),   // 12: R Shoulder
  new THREE.Vector3(-0.85, 0.7, 0), // 13: L Elbow
  new THREE.Vector3(0.85, 0.7, 0),  // 14: R Elbow
  new THREE.Vector3(-1.0, 0.1, 0),  // 15: L Wrist
  new THREE.Vector3(1.0, 0.1, 0),   // 16: R Wrist
  new THREE.Vector3(-1.05, 0.0, 0), // 17
  new THREE.Vector3(1.05, 0.0, 0),  // 18
  new THREE.Vector3(-1.0, 0.0, 0),  // 19
  new THREE.Vector3(1.0, 0.0, 0),   // 20
  new THREE.Vector3(-0.95, 0.0, 0), // 21
  new THREE.Vector3(0.95, 0.0, 0),  // 22
  new THREE.Vector3(-0.35, 0.0, 0), // 23: L Hip
  new THREE.Vector3(0.35, 0.0, 0),  // 24: R Hip
  new THREE.Vector3(-0.4, -0.9, 0), // 25: L Knee
  new THREE.Vector3(0.4, -0.9, 0),  // 26: R Knee
  new THREE.Vector3(-0.45, -1.8, 0),// 27: L Ankle
  new THREE.Vector3(0.45, -1.8, 0), // 28: R Ankle
  new THREE.Vector3(-0.45, -1.9, -0.1), // 29
  new THREE.Vector3(0.45, -1.9, -0.1),  // 30
  new THREE.Vector3(-0.45, -1.9, 0.15), // 31
  new THREE.Vector3(0.45, -1.9, 0.15)   // 32
];

const Skeleton3D = ({ landmarks, isDark }) => {
  const groupRef = useRef();

  // Process landmarks with auto-centering & adaptive scaling
  const points = useMemo(() => {
    if (!landmarks || landmarks.length === 0) {
      return IDLE_POSE_POINTS;
    }

    // Filter visible landmarks or compute bounding box
    const validLandmarks = landmarks.filter(lm => lm && typeof lm.x === 'number' && typeof lm.y === 'number');
    if (validLandmarks.length === 0) return IDLE_POSE_POINTS;

    // Calculate centroid of landmarks
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let sumX = 0, sumY = 0, sumZ = 0;

    validLandmarks.forEach(lm => {
      minX = Math.min(minX, lm.x);
      maxX = Math.max(maxX, lm.x);
      minY = Math.min(minY, lm.y);
      maxY = Math.max(maxY, lm.y);
      sumX += lm.x;
      sumY += lm.y;
      sumZ += (lm.z || 0);
    });

    const count = validLandmarks.length;
    const centerX = sumX / count;
    const centerY = sumY / count;
    const centerZ = sumZ / count;

    const spanX = Math.max(0.2, maxX - minX);
    const spanY = Math.max(0.2, maxY - minY);
    const maxSpan = Math.max(spanX, spanY);

    // Normalize scale so the skeleton nicely fills the 3D viewport height (~3.5 units)
    const scaleFactor = 3.6 / maxSpan;

    return landmarks.map((lm) => {
      if (!lm || typeof lm.x !== 'number') return new THREE.Vector3(0, 0, 0);

      const x = (lm.x - centerX) * -scaleFactor; // Invert X for natural mirror perspective
      const y = (lm.y - centerY) * -scaleFactor; // Invert Y (image top is Y=0, 3D top is +Y)
      const z = -(lm.z || 0) * scaleFactor * 0.8; // Depth

      return new THREE.Vector3(x, y, z);
    });
  }, [landmarks]);

  // Construct bone line segments
  const lineGeometry = useMemo(() => {
    if (points.length === 0) return null;
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = points[startIdx];
      const end = points[endIdx];
      if (start && end) {
        positions.push(start.x, start.y, start.z);
        positions.push(end.x, end.y, end.z);
      }
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [points]);

  const jointColor = isDark ? '#38bdf8' : '#0284c7';
  const headColor = isDark ? '#60a5fa' : '#2563eb';
  const boneColor = isDark ? '#ffffff' : '#1e293b';

  const headPos = points[0] || new THREE.Vector3(0, 1.5, 0);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Head Sphere */}
      <mesh position={[headPos.x, headPos.y + 0.15, headPos.z]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color={headColor}
          emissive={headColor}
          emissiveIntensity={isDark ? 0.35 : 0.1}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* 33 Skeletal Joint Spheres */}
      {points.map((pos, i) => {
        // Skip facial landmark points since head sphere represents them
        if (i >= 1 && i <= 10) return null;
        const isMajorJoint = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(i);
        const radius = isMajorJoint ? 0.14 : 0.08;

        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshStandardMaterial
              color={jointColor}
              emissive={jointColor}
              emissiveIntensity={isDark ? 0.45 : 0.15}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        );
      })}

      {/* Skeletal Bones */}
      {lineGeometry && (
        <lineSegments geometry={lineGeometry}>
          <lineBasicMaterial
            color={boneColor}
            opacity={isDark ? 0.9 : 0.8}
            transparent
            linewidth={3}
          />
        </lineSegments>
      )}
    </group>
  );
};

const AvatarCanvas = ({ landmarks, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const hasLivePerson = landmarks && landmarks.length > 0;

  return (
    <div className={`relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden transition-colors ${
      isDark ? 'bg-zinc-950 border border-zinc-800' : 'bg-slate-50 border border-slate-200'
    }`}>
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className={`text-xs font-semibold px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-1.5 ${
          isDark 
            ? 'bg-zinc-900/90 text-sky-400 border-zinc-700/60' 
            : 'bg-white/90 text-sky-600 border-slate-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${hasLivePerson ? 'bg-sky-400 animate-pulse' : 'bg-zinc-500'}`}></span>
          3D Biomechanical Twin
        </div>
      </div>

      {/* Camera Guidance / Interaction Hint */}
      <div className={`absolute bottom-4 right-4 z-10 text-[11px] font-medium px-2.5 py-1 rounded-md pointer-events-none ${
        isDark ? 'bg-zinc-900/80 text-zinc-400' : 'bg-white/80 text-slate-500'
      }`}>
        Drag to Rotate • Scroll to Zoom
      </div>

      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <ambientLight intensity={isDark ? 0.8 : 1.0} />
        <directionalLight position={[5, 8, 5]} intensity={1.4} />
        <directionalLight position={[-5, -4, -5]} intensity={0.5} />

        <Skeleton3D landmarks={landmarks} isDark={isDark} />

        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          maxDistance={12} 
          minDistance={2.5} 
        />

        {/* Floor Grid */}
        <gridHelper 
          args={[10, 10, isDark ? 0x38bdf8 : 0x0284c7, isDark ? 0x27272a : 0xe2e8f0]} 
          position={[0, -2.0, 0]} 
        />
      </Canvas>
    </div>
  );
};

export default AvatarCanvas;
