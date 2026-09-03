// src/utils/exerciseLogic.js
import { calculateAngle, calculateDistance, POSE_LANDMARKS } from './biomechanics';

export const PPL_SPLITS = {
  PUSH: 'PUSH',
  PULL: 'PULL',
  LEGS: 'LEGS',
  ALL: 'ALL'
};

export const EXERCISES = {
  // Push
  PUSH_UP: 'PUSH_UP',
  SHOULDER_PRESS: 'SHOULDER_PRESS',
  LATERAL_RAISE: 'LATERAL_RAISE',
  
  // Pull
  BICEP_CURL: 'BICEP_CURL',
  HAMMER_CURL: 'HAMMER_CURL',
  
  // Legs & Core
  SQUAT: 'SQUAT',
  LUNGE: 'LUNGE',
  PLANK: 'PLANK',
  JUMPING_JACKS: 'JUMPING_JACKS',
};

export const EXERCISE_DETAILS = {
  // PUSH EXERCISES
  PUSH_UP: {
    id: 'PUSH_UP',
    name: 'Standard Push-ups',
    split: 'PUSH',
    category: 'Chest & Triceps',
    targetMuscles: ['Pectorals', 'Triceps', 'Anterior Deltoids'],
    description: 'Horizontal press measuring 90° elbow depth and rigid plank alignment.',
    cue: 'Step back to show whole body sideways. Lower chest to floor and press up.'
  },
  SHOULDER_PRESS: {
    id: 'SHOULDER_PRESS',
    name: 'Overhead Press',
    split: 'PUSH',
    category: 'Shoulders & Arms',
    targetMuscles: ['Deltoids', 'Triceps', 'Upper Trapezius'],
    description: 'Vertical overhead press tracking elbow extension and steady core.',
    cue: 'Press hands straight overhead to full lockout, lower to ear height.'
  },
  LATERAL_RAISE: {
    id: 'LATERAL_RAISE',
    name: 'Lateral Arm Raises',
    split: 'PUSH',
    category: 'Shoulders',
    targetMuscles: ['Lateral Deltoids'],
    description: 'Side shoulder abduction tracking arm elevation to shoulder parallel.',
    cue: 'Raise arms out to sides until parallel with floor, lower with control.'
  },

  // PULL EXERCISES
  BICEP_CURL: {
    id: 'BICEP_CURL',
    name: 'Standard Bicep Curls',
    split: 'PULL',
    category: 'Biceps & Forearms',
    targetMuscles: ['Biceps Brachii', 'Brachialis'],
    description: 'Arm curls tracking full elbow flexion (peak contraction) and controlled full extension.',
    cue: 'Keep elbows fixed at sides, curl hands up towards shoulders, lower fully.'
  },
  HAMMER_CURL: {
    id: 'HAMMER_CURL',
    name: 'Neutral Hammer Curls',
    split: 'PULL',
    category: 'Biceps & Forearms',
    targetMuscles: ['Brachioradialis', 'Biceps'],
    description: 'Neutral wrist curl tracking steady elbow position and full contraction.',
    cue: 'Keep palms facing inward, curl up to 45° elbow angle, lower smoothly.'
  },

  // LEGS & CORE EXERCISES
  SQUAT: {
    id: 'SQUAT',
    name: 'Bodyweight Squats',
    split: 'LEGS',
    category: 'Quads & Glutes',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    description: 'Deep squats checking hip-knee flexion depth (parallel or below) and upright chest.',
    cue: 'Step back to show full body. Push hips back, squat down to 90°, and stand.'
  },
  LUNGE: {
    id: 'LUNGE',
    name: 'Forward Lunges',
    split: 'LEGS',
    category: 'Legs & Balance',
    targetMuscles: ['Quadriceps', 'Glutes', 'Calves'],
    description: 'Single leg lunges evaluating front knee 90° angle and torso uprightness.',
    cue: 'Step back to show lower body. Step forward into 90° knee bend, push back.'
  },
  PLANK: {
    id: 'PLANK',
    name: 'Plank Hold',
    split: 'LEGS',
    category: 'Core Stability',
    targetMuscles: ['Abdominals', 'Obliques', 'Lower Back'],
    description: 'Static core hold measuring straight neutral spine alignment and elapsed hold time.',
    cue: 'Position full body sideways. Keep a straight line from head to heels.'
  },
  JUMPING_JACKS: {
    id: 'JUMPING_JACKS',
    name: 'Jumping Jacks',
    split: 'LEGS',
    category: 'Full Body Cardio',
    targetMuscles: ['Full Body Cardio', 'Calves', 'Shoulders'],
    description: 'Cardiovascular rhythm tracking full arm span elevation and synchronized leg spread.',
    cue: 'Step back to show full body. Jump spreading arms and feet simultaneously.'
  }
};

/**
 * Validates if specific joints are clearly inside camera bounds and have high confidence.
 */
function areJointsInFrame(landmarks, jointIndices, minVisibility = 0.55) {
  if (!landmarks || landmarks.length === 0) return false;
  return jointIndices.every(idx => {
    const lm = landmarks[idx];
    if (!lm) return false;
    const isConf = lm.visibility === undefined || lm.visibility >= minVisibility;
    const inBounds = lm.x >= 0.02 && lm.x <= 0.98 && lm.y >= 0.02 && lm.y <= 0.98;
    return isConf && inBounds;
  });
}

export class ExerciseEngine {
  constructor(exerciseType) {
    this.exerciseType = exerciseType;
    this.reps = 0;
    this.state = 'WAITING'; // WAITING, UP, DOWN, MID, HOLDING
    this.feedback = [];
    this.formScore = 'Good';
    this.badJoints = [];
    this.holdStartTime = null;
    this.holdSeconds = 0;
    this.lastRepTime = 0;
    this.hasStartedMovement = false;
  }

  processFrame(landmarks) {
    if (!landmarks || landmarks.length === 0) {
      return {
        reps: this.reps,
        state: 'NO_PERSON',
        feedback: ['Position yourself inside the camera frame.'],
        formScore: 'Bad',
        badJoints: [],
        holdSeconds: this.holdSeconds
      };
    }

    this.feedback = [];
    this.formScore = 'Excellent';
    this.badJoints = [];

    switch (this.exerciseType) {
      case EXERCISES.BICEP_CURL:
      case EXERCISES.HAMMER_CURL:
        this.processBicepCurl(landmarks);
        break;
      case EXERCISES.SQUAT:
        this.processSquat(landmarks);
        break;
      case EXERCISES.PUSH_UP:
        this.processPushUp(landmarks);
        break;
      case EXERCISES.LUNGE:
        this.processLunge(landmarks);
        break;
      case EXERCISES.SHOULDER_PRESS:
        this.processShoulderPress(landmarks);
        break;
      case EXERCISES.LATERAL_RAISE:
        this.processLateralRaise(landmarks);
        break;
      case EXERCISES.PLANK:
        this.processPlank(landmarks);
        break;
      case EXERCISES.JUMPING_JACKS:
        this.processJumpingJacks(landmarks);
        break;
      default:
        break;
    }

    return {
      reps: this.reps,
      state: this.state,
      feedback: this.feedback.length > 0 ? this.feedback : ['Form looking solid. Keep going!'],
      formScore: this.formScore,
      badJoints: this.badJoints,
      holdSeconds: this.holdSeconds
    };
  }

  processBicepCurl(landmarks) {
    const leftVisible = areJointsInFrame(landmarks, [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST]);
    const rightVisible = areJointsInFrame(landmarks, [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]);

    if (!leftVisible && !rightVisible) {
      this.state = 'WAITING';
      this.feedback.push('Step back so your full arms, elbows & wrists are visible.');
      this.formScore = 'Good';
      return;
    }

    const useLeft = leftVisible;
    const shoulder = useLeft ? landmarks[POSE_LANDMARKS.LEFT_SHOULDER] : landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const elbow = useLeft ? landmarks[POSE_LANDMARKS.LEFT_ELBOW] : landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
    const wrist = useLeft ? landmarks[POSE_LANDMARKS.LEFT_WRIST] : landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    const elbowIdx = useLeft ? POSE_LANDMARKS.LEFT_ELBOW : POSE_LANDMARKS.RIGHT_ELBOW;

    const angle = calculateAngle(shoulder, elbow, wrist);

    // Full extension at bottom
    if (angle > 150) {
      this.state = 'DOWN';
      this.hasStartedMovement = true;
    }

    // Peak contraction at top
    if (angle < 50 && this.state === 'DOWN' && this.hasStartedMovement) {
      const now = Date.now();
      if (now - this.lastRepTime > 800) {
        this.state = 'UP';
        this.reps += 1;
        this.lastRepTime = now;
      }
    }

    if (angle >= 50 && angle <= 80 && this.state === 'DOWN') {
      this.feedback.push('Curl higher for full peak contraction');
      this.formScore = 'Good';
      this.badJoints.push(elbowIdx);
    }
  }

  processSquat(landmarks) {
    const leftVisible = areJointsInFrame(landmarks, [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE]);
    const rightVisible = areJointsInFrame(landmarks, [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE]);

    if (!leftVisible && !rightVisible) {
      this.state = 'WAITING';
      this.feedback.push('Step back so your full body (hips, knees, feet) is in frame.');
      this.formScore = 'Good';
      return;
    }

    const useLeft = leftVisible;
    const hip = useLeft ? landmarks[POSE_LANDMARKS.LEFT_HIP] : landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const knee = useLeft ? landmarks[POSE_LANDMARKS.LEFT_KNEE] : landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const ankle = useLeft ? landmarks[POSE_LANDMARKS.LEFT_ANKLE] : landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
    const kneeIdx = useLeft ? POSE_LANDMARKS.LEFT_KNEE : POSE_LANDMARKS.RIGHT_KNEE;

    const angle = calculateAngle(hip, knee, ankle);

    if (angle > 155) {
      if (this.state === 'DOWN' && this.hasStartedMovement) {
        const now = Date.now();
        if (now - this.lastRepTime > 900) {
          this.state = 'UP';
          this.reps += 1;
          this.lastRepTime = now;
        }
      } else {
        this.state = 'UP';
      }
    }

    if (angle < 100) {
      this.state = 'DOWN';
      this.hasStartedMovement = true;
    }

    if (angle >= 105 && angle <= 135) {
      this.feedback.push('Squat lower to reach parallel');
      this.formScore = 'Good';
      this.badJoints.push(kneeIdx);
    }
  }

  processPushUp(landmarks) {
    const visible = areJointsInFrame(landmarks, [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.LEFT_HIP]);
    if (!visible) {
      this.state = 'WAITING';
      this.feedback.push('Position yourself sideways showing arms & torso.');
      this.formScore = 'Good';
      return;
    }

    const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const elbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const wrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const hip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const ankle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];

    const armAngle = calculateAngle(shoulder, elbow, wrist);
    const bodyAngle = calculateAngle(shoulder, hip, ankle);

    if (bodyAngle < 150 || bodyAngle > 210) {
      this.feedback.push('Keep core tight, do not sag hips');
      this.formScore = 'Bad';
      this.badJoints.push(POSE_LANDMARKS.LEFT_HIP);
    }

    if (armAngle > 155) {
      if (this.state === 'DOWN' && this.hasStartedMovement) {
        const now = Date.now();
        if (now - this.lastRepTime > 800) {
          this.state = 'UP';
          this.reps += 1;
          this.lastRepTime = now;
        }
      }
    }

    if (armAngle < 90) {
      this.state = 'DOWN';
      this.hasStartedMovement = true;
    }
  }

  processLunge(landmarks) {
    const visible = areJointsInFrame(landmarks, [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE]);
    if (!visible) {
      this.state = 'WAITING';
      this.feedback.push('Step back so your legs and feet are visible.');
      this.formScore = 'Good';
      return;
    }

    const hip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const knee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const ankle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];

    const frontAngle = calculateAngle(hip, knee, ankle);

    if (frontAngle > 150) {
      if (this.state === 'DOWN' && this.hasStartedMovement) {
        const now = Date.now();
        if (now - this.lastRepTime > 900) {
          this.state = 'UP';
          this.reps += 1;
          this.lastRepTime = now;
        }
      }
    }

    if (frontAngle < 100) {
      this.state = 'DOWN';
      this.hasStartedMovement = true;
    }
  }

  processShoulderPress(landmarks) {
    const visible = areJointsInFrame(landmarks, [
      POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST,
      POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST
    ]);

    if (!visible) {
      this.state = 'WAITING';
      this.feedback.push('Step back so your upper body and arms are in frame.');
      this.formScore = 'Good';
      return;
    }

    const leftAngle = calculateAngle(landmarks[POSE_LANDMARKS.LEFT_SHOULDER], landmarks[POSE_LANDMARKS.LEFT_ELBOW], landmarks[POSE_LANDMARKS.LEFT_WRIST]);
    const rightAngle = calculateAngle(landmarks[POSE_LANDMARKS.RIGHT_SHOULDER], landmarks[POSE_LANDMARKS.RIGHT_ELBOW], landmarks[POSE_LANDMARKS.RIGHT_WRIST]);
    const avgAngle = (leftAngle + rightAngle) / 2;

    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];

    if (avgAngle > 150 && leftWrist.y < leftShoulder.y) {
      if (this.state === 'DOWN' && this.hasStartedMovement) {
        const now = Date.now();
        if (now - this.lastRepTime > 800) {
          this.state = 'UP';
          this.reps += 1;
          this.lastRepTime = now;
        }
      }
    }

    if (avgAngle < 95) {
      this.state = 'DOWN';
      this.hasStartedMovement = true;
    }
  }

  processLateralRaise(landmarks) {
    const visible = areJointsInFrame(landmarks, [
      POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_WRIST,
      POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_WRIST
    ]);

    if (!visible) {
      this.state = 'WAITING';
      this.feedback.push('Step back so your full upper body and arms are in frame.');
      this.formScore = 'Good';
      return;
    }

    const leftArmAngle = calculateAngle(landmarks[POSE_LANDMARKS.LEFT_HIP], landmarks[POSE_LANDMARKS.LEFT_SHOULDER], landmarks[POSE_LANDMARKS.LEFT_WRIST]);
    const rightArmAngle = calculateAngle(landmarks[POSE_LANDMARKS.RIGHT_HIP], landmarks[POSE_LANDMARKS.RIGHT_SHOULDER], landmarks[POSE_LANDMARKS.RIGHT_WRIST]);
    const avgAbduction = (leftArmAngle + rightArmAngle) / 2;

    if (avgAbduction > 78) {
      if (this.state === 'DOWN' && this.hasStartedMovement) {
        const now = Date.now();
        if (now - this.lastRepTime > 800) {
          this.state = 'UP';
          this.reps += 1;
          this.lastRepTime = now;
        }
      }
    }

    if (avgAbduction < 30) {
      this.state = 'DOWN';
      this.hasStartedMovement = true;
    }
  }

  processPlank(landmarks) {
    const visible = areJointsInFrame(landmarks, [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_ANKLE]);
    if (!visible) {
      this.state = 'WAITING';
      this.feedback.push('Position yourself sideways showing your full body.');
      this.formScore = 'Good';
      return;
    }

    const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const hip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const ankle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];

    const angle = calculateAngle(shoulder, hip, ankle);

    if (angle >= 155 && angle <= 205) {
      this.state = 'HOLDING';
      this.formScore = 'Excellent';
      if (!this.holdStartTime) {
        this.holdStartTime = Date.now();
      } else {
        this.holdSeconds = Math.floor((Date.now() - this.holdStartTime) / 1000);
        this.reps = this.holdSeconds;
      }
    } else {
      this.state = 'FORM_BREAK';
      this.formScore = 'Bad';
      this.badJoints.push(POSE_LANDMARKS.LEFT_HIP);
      this.feedback.push('Keep hips in a straight neutral line with shoulders & ankles.');
      this.holdStartTime = null;
    }
  }

  processJumpingJacks(landmarks) {
    const visible = areJointsInFrame(landmarks, [
      POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.RIGHT_WRIST,
      POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.RIGHT_ANKLE,
      POSE_LANDMARKS.LEFT_SHOULDER
    ]);

    if (!visible) {
      this.state = 'WAITING';
      this.feedback.push('Step back so your full body (head to feet) is in frame.');
      this.formScore = 'Good';
      return;
    }

    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];

    const feetDist = calculateDistance(leftAnkle, rightAnkle);

    if (leftWrist.y > leftShoulder.y && feetDist < 0.22) {
      this.state = 'START';
      this.hasStartedMovement = true;
    }

    if (leftWrist.y < leftShoulder.y && feetDist > 0.28) {
      if (this.state === 'START' && this.hasStartedMovement) {
        const now = Date.now();
        if (now - this.lastRepTime > 550) {
          this.state = 'MID';
          this.reps += 1;
          this.lastRepTime = now;
        }
      }
    }
  }
}
