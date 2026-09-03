// src/utils/biomechanics.js

/**
 * Calculates the 2D angle between three points (p1-p2-p3, where p2 is the vertex).
 * @param {Object} p1 - First point {x, y, z, visibility}
 * @param {Object} p2 - Vertex point {x, y, z, visibility}
 * @param {Object} p3 - Third point {x, y, z, visibility}
 * @returns {number} Angle in degrees [0, 180]
 */
export function calculateAngle(p1, p2, p3) {
  if (!p1 || !p2 || !p3) return 0;
  
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  
  return Math.round(angle * 10) / 10;
}

/**
 * Calculates Euclidean distance between two points in normalized 2D space.
 */
export function calculateDistance(p1, p2) {
  if (!p1 || !p2) return 0;
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Checks if key landmarks are visible enough for reliable inference.
 */
export function areJointsVisible(landmarks, jointIndices, threshold = 0.4) {
  if (!landmarks || landmarks.length === 0) return false;
  return jointIndices.every(idx => {
    const lm = landmarks[idx];
    return lm && (lm.visibility === undefined || lm.visibility >= threshold);
  });
}

export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
};
