// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, Quaternion } from "three/webgpu";
export const kn = Math.PI / 180;
export const quadraConfiguration = {
  name: "Quadra Turbo-R",
  modelPath: "/models/game/quadra_rig.glb",
  mass: 1480,
  centerOfMass: [0, .5, -.15],
  inertia: [2300, 2200, 600],
  chassisColliders: [{
    half: [1.1, .36, 2.52],
    offset: [0, .58, -.06],
    radius: .1
  }, {
    half: [.8, .16, 1.05],
    offset: [0, 1.1, -.2],
    radius: .08
  }],
  chassisFriction: .25,
  chassisRestitution: .05,
  suspension: {
    front: {
      travelUp: .1,
      travelDown: .12,
      spring: 42e3,
      bumpDamping: 2400,
      reboundDamping: 4300,
      bumpStop: .025,
      bumpStopRate: 38e4,
      antiRoll: 12500,
      rollCenter: .08
    },
    rear: {
      travelUp: .1,
      travelDown: .12,
      spring: 46e3,
      bumpDamping: 2600,
      reboundDamping: 4600,
      bumpStop: .025,
      bumpStopRate: 38e4,
      antiRoll: 6500,
      rollCenter: .12
    }
  },
  tires: {
    front: {
      mu: 1.25,
      longitudinalGrip: 1.04,
      loadSensitivity: .16,
      nominalLoad: 3800,
      peakSlipAngle: 7 * kn,
      peakSlipRatio: .1,
      lateral: {
        stiffness: 2.6,
        falloff: .84
      },
      longitudinal: {
        stiffness: 3,
        falloff: .72
      },
      relaxationLateral: .28,
      relaxationLongitudinal: .12,
      rollingResistance: .012,
      inertia: 1.25
    },
    rear: {
      mu: 1.25,
      longitudinalGrip: 1.04,
      loadSensitivity: .16,
      nominalLoad: 3800,
      peakSlipAngle: 7.5 * kn,
      peakSlipRatio: .1,
      lateral: {
        stiffness: 2.8,
        falloff: .8
      },
      longitudinal: {
        stiffness: 3,
        falloff: .72
      },
      relaxationLateral: .3,
      relaxationLongitudinal: .12,
      rollingResistance: .012,
      inertia: 1.6
    }
  },
  weatherGrip: .9,
  engine: {
    idleRpm: 900,
    redlineRpm: 7600,
    limiterRpm: 7800,
    limiterCut: .05,
    inertia: .25,
    torqueCurve: [[800, 300], [1500, 380], [2e3, 440], [2500, 490], [3e3, 530], [3500, 560], [4e3, 585], [4500, 600], [5e3, 605], [5500, 600], [6e3, 585], [6500, 560], [7e3, 530], [7500, 490], [8e3, 440]],
    frictionTorque: 40,
    frictionPerRpm: .011
  },
  gearbox: {
    ratios: [3.25, 2.25, 1.68, 1.32, 1.08, .9],
    reverse: 3.1,
    finalDrive: 3.9,
    efficiency: .9,
    shiftTime: .14,
    upshiftRpm: 7350,
    upshiftRpmLight: 3600,
    downshiftRpm: 2400,
    coastDownshiftRpm: 3300,
    downshiftRpmKick: 4800
  },
  clutch: {
    maxTorque: 1100,
    launchRpm: 3300,
    launchLockRpm: 5e3,
    launchTorqueRate: 1800,
    slipReference: 12
  },
  differential: {
    type: "lsd",
    preload: 70,
    powerRamp: .42,
    coastRamp: .22,
    stiffness: 260
  },
  brakes: {
    maxTorque: 7600,
    frontBias: .62,
    handbrakeTorque: 2600
  },
  arcade: {
    brakeAssist: 7,
    coastDrag: 1,
    forward: {
      accel: 4,
      maxSpeed: 56
    },
    reverse: {
      accel: 7,
      maxSpeed: 17
    },
    nitro: {
      accel: 5.5,
      maxSpeed: 95,
      drain: .22,
      recharge: .07
    },
    launch: {
      armSpeed: 1,
      minCharge: .999,
      armedRpm: 3800,
      revLow: 2600,
      revHigh: 7400,
      sweep: .75,
      zone: [.7, .84],
      goodMargin: .08,
      accel: 5,
      goodScale: .4,
      pushSpeed: 45,
      launchRpm: 5200,
      maxTime: 3.5,
      endSpeed: 45,
      missLockout: 1.2
    },
    turn: {
      lateralG: 2.3,
      yawGain: 7,
      maxYawAccel: 6,
      grip: 4.5,
      maxGripG: 1.3,
      fromSpeed: 8,
      fullSpeed: 20
    },
    drift: {
      minSpeed: 12,
      exitSpeed: 6,
      angle: 30 * kn,
      angleMax: 48 * kn,
      angleLift: 6 * kn,
      handbrakeAngle: 8 * kn,
      handbrakeDrag: 1.5,
      exitAngle: 10 * kn,
      exitHold: .15,
      grace: .5,
      lateralG: 1.7,
      lateralGLift: .9,
      lateralGMax: 2.8,
      lateralGMin: .4,
      tireLateral: .2,
      settleGrip: .5,
      drag: 6,
      kick: 1,
      yawP: 26,
      yawD: 8,
      maxYawAccel: 12,
      flipHold: .22,
      regain: .55,
      exitTurn: .35
    }
  },
  aero: {
    dragArea: .76,
    downforceFront: .24,
    downforceRear: .38,
    airDensity: 1.225
  },
  steering: {
    maxAngle: 34 * kn,
    ackermann: .85,
    assistLateralG: .9,
    assistSlipAllowance: 5.5 * kn,
    assistSlipAllowanceFast: .8 * kn,
    assistFastFrom: 20,
    assistFastSpeed: 45
  },
  assists: {
    abs: true,
    tcs: true,
    esc: .8,
    escDeadband: .14,
    escDeadbandSpeed: 20,
    escDeadbandMin: .4,
    escSlipLimit: 3.5 * kn,
    escSlipGain: 2.5,
    escCharSpeed: 24,
    escHandbrakeHold: .3,
    escHandbrakeAllowance: .9,
    escHandbrakeAllowanceMin: .4,
    countersteer: .8,
    steerLimit: true
  }
};
export function bh(i, e) {
  const t = structuredClone(i),
    s = (n, r) => {
      for (const [o, a] of Object.entries(r)) a && typeof a == "object" && !Array.isArray(a) && n[o] && typeof n[o] == "object" ? s(n[o], a) : n[o] = structuredClone(a);
    };
  s(t, e);
  return t;
}
export const fie = bh(quadraConfiguration, {
  name: "Tachyon",
  modelPath: "/models/game/tachyon_rig.glb",
  mass: 1390,
  centerOfMass: [0, .47, -.19],
  inertia: [2200, 2150, 600],
  chassisColliders: [{
    half: [1.22, .33, 2.33],
    offset: [0, .53, .13],
    radius: .1
  }, {
    half: [.85, .15, 1.3],
    offset: [0, 1.1, -.2],
    radius: .08
  }],
  tires: {
    front: {
      mu: 1.3
    },
    rear: {
      mu: 1.32
    }
  },
  engine: {
    idleRpm: 950,
    redlineRpm: 7800,
    limiterRpm: 8e3,
    torqueCurve: [[800, 310], [1500, 400], [2e3, 460], [2500, 510], [3e3, 550], [3500, 585], [4e3, 610], [4500, 628], [5e3, 640], [5500, 642], [6e3, 635], [6500, 615], [7e3, 590], [7500, 555], [8e3, 510]]
  },
  gearbox: {
    ratios: [3.3, 2.3, 1.72, 1.36, 1.12, .93],
    finalDrive: 3.73,
    upshiftRpm: 7550,
    downshiftRpmKick: 5e3
  },
  brakes: {
    maxTorque: 8200
  },
  aero: {
    dragArea: .7,
    downforceFront: .28,
    downforceRear: .42
  },
  arcade: {
    brakeAssist: 7.5,
    forward: {
      accel: 4.6
    },
    nitro: {
      accel: 6.5,
      maxSpeed: 100
    },
    turn: {
      lateralG: 2.45,
      yawGain: 7.5
    }
  },
  steering: {
    maxAngle: 35 * kn
  }
});
export const pie = bh(quadraConfiguration, {
  name: "Tsurugi",
  modelPath: "/models/game/tsurugi_rig.glb",
  mass: 1330,
  centerOfMass: [0, .46, -.16],
  inertia: [2050, 2e3, 540],
  chassisColliders: [{
    half: [1.15, .29, 2.4],
    offset: [0, .5, .04],
    radius: .1
  }, {
    half: [.62, .14, .75],
    offset: [0, 1.08, -.2],
    radius: .08
  }],
  tires: {
    front: {
      mu: 1.3
    },
    rear: {
      mu: 1.33
    }
  },
  engine: {
    idleRpm: 1e3,
    redlineRpm: 8700,
    limiterRpm: 8900,
    inertia: .2,
    torqueCurve: [[800, 220], [1500, 285], [2e3, 325], [3e3, 372], [4e3, 405], [5e3, 430], [6e3, 448], [7e3, 455], [8e3, 438], [8500, 418], [9e3, 375]]
  },
  gearbox: {
    ratios: [3.25, 2.3, 1.74, 1.4, 1.14, .94],
    finalDrive: 4.6,
    upshiftRpm: 8500,
    downshiftRpmKick: 5500
  },
  brakes: {
    maxTorque: 7800
  },
  aero: {
    dragArea: .7,
    downforceFront: .28,
    downforceRear: .44
  },
  arcade: {
    brakeAssist: 7.5,
    forward: {
      accel: 3.4
    },
    nitro: {
      accel: 6,
      maxSpeed: 95
    },
    turn: {
      lateralG: 2.4,
      yawGain: 7.4
    }
  },
  steering: {
    maxAngle: 35 * kn
  }
});
export const mie = bh(quadraConfiguration, {
  name: "Velora",
  modelPath: "/models/game/velora_rig.glb",
  mass: 1240,
  centerOfMass: [0, .45, -.06],
  inertia: [1980, 1930, 520],
  chassisColliders: [{
    half: [1.05, .29, 2.36],
    offset: [0, .48, .11],
    radius: .1
  }, {
    half: [.6, .15, .8],
    offset: [0, .99, .15],
    radius: .08
  }],
  suspension: {
    front: {
      spring: 36e3,
      bumpDamping: 2100,
      reboundDamping: 3700,
      antiRoll: 10500
    },
    rear: {
      spring: 38e3,
      bumpDamping: 2200,
      reboundDamping: 3900,
      antiRoll: 6e3
    }
  },
  tires: {
    front: {
      mu: 1.24,
      inertia: 1
    },
    rear: {
      mu: 1.2,
      inertia: 1.2
    }
  },
  engine: {
    idleRpm: 950,
    redlineRpm: 8e3,
    limiterRpm: 8200,
    inertia: .18,
    torqueCurve: [[800, 210], [1500, 250], [2e3, 300], [2500, 350], [3e3, 395], [3500, 430], [4e3, 455], [4500, 470], [5e3, 478], [5500, 480], [6e3, 474], [6500, 460], [7e3, 440], [7500, 412], [8e3, 380], [8500, 340]]
  },
  gearbox: {
    ratios: [3.45, 2.38, 1.78, 1.4, 1.14, .92],
    finalDrive: 4.75,
    upshiftRpm: 7750,
    downshiftRpmKick: 5200
  },
  brakes: {
    maxTorque: 7030
  },
  aero: {
    dragArea: .66,
    downforceFront: .18,
    downforceRear: .26
  },
  arcade: {
    nitro: {
      accel: 5.8,
      maxSpeed: 88
    },
    turn: {
      lateralG: 2.4,
      yawGain: 7.6
    },
    drift: {
      angle: 34 * kn,
      angleMax: 52 * kn,
      kick: 1.2,
      lateralG: 1.8,
      lateralGMax: 3
    }
  },
  steering: {
    maxAngle: 36 * kn
  }
});
export const gie = bh(quadraConfiguration, {
  name: "Raijin",
  modelPath: "/models/game/raijin_rig.glb",
  mass: 1420,
  centerOfMass: [0, .52, 0],
  inertia: [2250, 2150, 580],
  chassisColliders: [{
    half: [1.05, .34, 2.52],
    offset: [0, .56, .03],
    radius: .1
  }, {
    half: [.76, .16, 1.03],
    offset: [0, 1.225, -.39],
    radius: .08
  }],
  tires: {
    front: {
      mu: 1.28
    },
    rear: {
      mu: 1.3
    }
  },
  engine: {
    idleRpm: 850,
    redlineRpm: 7e3,
    limiterRpm: 7300,
    torqueCurve: [[800, 330], [1500, 520], [2e3, 620], [2500, 650], [3e3, 660], [3500, 660], [4e3, 660], [4500, 655], [5e3, 640], [5500, 615], [6e3, 580], [6500, 540], [7e3, 490], [7500, 430]]
  },
  gearbox: {
    ratios: [3.2, 2.2, 1.66, 1.32, 1.08, .86],
    finalDrive: 3.82,
    upshiftRpm: 6900,
    downshiftRpm: 2200,
    downshiftRpmKick: 4600
  },
  brakes: {
    maxTorque: 8700
  },
  aero: {
    dragArea: .72,
    downforceFront: .26,
    downforceRear: .46
  },
  arcade: {
    forward: {
      accel: 4.4
    },
    nitro: {
      accel: 6,
      maxSpeed: 96
    },
    turn: {
      lateralG: 2.4
    }
  }
});
export const Aie = bh(quadraConfiguration, {
  name: "Vanta",
  modelPath: "/models/game/vanta_rig.glb",
  mass: 1150,
  centerOfMass: [0, .42, -.15],
  inertia: [1700, 1650, 420],
  chassisColliders: [{
    half: [.98, .28, 2.22],
    offset: [0, .46, -.08],
    radius: .1
  }, {
    half: [.72, .14, 1],
    offset: [0, .98, -.05],
    radius: .08
  }],
  suspension: {
    front: {
      spring: 52e3,
      bumpDamping: 2800,
      reboundDamping: 4800,
      antiRoll: 14e3
    },
    rear: {
      spring: 56e3,
      bumpDamping: 3e3,
      reboundDamping: 5100,
      antiRoll: 8e3
    }
  },
  tires: {
    front: {
      mu: 1.4,
      peakSlipAngle: 6.5 * kn
    },
    rear: {
      mu: 1.45,
      peakSlipAngle: 7 * kn
    }
  },
  engine: {
    idleRpm: 1100,
    redlineRpm: 8400,
    limiterRpm: 8600,
    inertia: .16,
    torqueCurve: [[800, 220], [1500, 300], [2e3, 360], [2500, 420], [3e3, 480], [3500, 530], [4e3, 565], [4500, 585], [5e3, 595], [5500, 600], [6e3, 598], [6500, 585], [7e3, 565], [7500, 535], [8e3, 500], [8500, 455], [9e3, 400]]
  },
  gearbox: {
    ratios: [3.1, 2.26, 1.75, 1.42, 1.16, .95],
    finalDrive: 3.62,
    shiftTime: .07,
    upshiftRpm: 8250,
    downshiftRpm: 3200,
    downshiftRpmKick: 5600
  },
  brakes: {
    maxTorque: 9200,
    frontBias: .6
  },
  aero: {
    dragArea: .86,
    downforceFront: .62,
    downforceRear: .96
  },
  arcade: {
    brakeAssist: 8,
    forward: {
      accel: 4.8
    },
    nitro: {
      accel: 6.4,
      maxSpeed: 98
    },
    turn: {
      lateralG: 2.6,
      yawGain: 8
    }
  },
  steering: {
    maxAngle: 32 * kn
  }
});
export const yie = bh(quadraConfiguration, {
  name: "Katana",
  modelPath: "/models/game/katana_rig.glb",
  mass: 1280,
  centerOfMass: [0, .44, -.2],
  inertia: [2e3, 1950, 520],
  chassisColliders: [{
    half: [1.06, .28, 2.5],
    offset: [0, .47, .06],
    radius: .1
  }, {
    half: [.7, .13, .85],
    offset: [0, .98, .13],
    radius: .08
  }],
  suspension: {
    front: {
      travelUp: .07,
      travelDown: .09,
      spring: 5e4,
      bumpDamping: 2800,
      reboundDamping: 4900,
      antiRoll: 14e3
    },
    rear: {
      travelUp: .07,
      travelDown: .09,
      spring: 54e3,
      bumpDamping: 3e3,
      reboundDamping: 5200,
      antiRoll: 7600
    }
  },
  tires: {
    front: {
      mu: 1.32
    },
    rear: {
      mu: 1.36
    }
  },
  engine: {
    idleRpm: 900,
    redlineRpm: 7800,
    limiterRpm: 8e3,
    torqueCurve: [[800, 380], [1500, 520], [2e3, 600], [2500, 650], [3e3, 675], [3500, 685], [4e3, 690], [4500, 690], [5e3, 685], [5500, 675], [6e3, 660], [6500, 635], [7e3, 600], [7500, 555], [8e3, 500]]
  },
  gearbox: {
    ratios: [3.3, 2.3, 1.72, 1.36, 1.12, .93],
    finalDrive: 3.8,
    shiftTime: .1,
    upshiftRpm: 7600,
    downshiftRpmKick: 5e3
  },
  brakes: {
    maxTorque: 8e3
  },
  aero: {
    dragArea: .68,
    downforceFront: .3,
    downforceRear: .46
  },
  arcade: {
    brakeAssist: 7.5,
    forward: {
      accel: 5.1
    },
    nitro: {
      accel: 6.8,
      maxSpeed: 100
    },
    turn: {
      lateralG: 2.5,
      yawGain: 7.6
    }
  },
  steering: {
    maxAngle: 34 * kn
  }
});
export const bie = bh(quadraConfiguration, {
  name: "Chrysalis",
  modelPath: "/models/game/chrysalis_rig.glb",
  mass: 1180,
  centerOfMass: [0, .44, -.13],
  inertia: [2300, 2250, 520],
  chassisColliders: [{
    half: [1.12, .3, 2.3],
    offset: [0, .5, .18],
    radius: .1
  }, {
    half: [.62, .16, 1.2],
    offset: [0, 1.12, .1],
    radius: .08
  }],
  tires: {
    front: {
      mu: 1.38
    },
    rear: {
      mu: 1.42
    }
  },
  engine: {
    idleRpm: 1400,
    redlineRpm: 8800,
    limiterRpm: 9e3,
    inertia: .14,
    torqueCurve: [[800, 520], [1500, 620], [2e3, 680], [2500, 700], [3e3, 705], [3500, 705], [4e3, 705], [4500, 700], [5e3, 695], [5500, 685], [6e3, 670], [6500, 650], [7e3, 625], [7500, 595], [8e3, 560], [8500, 520], [9e3, 470]]
  },
  gearbox: {
    ratios: [3.3, 2.3, 1.74, 1.38, 1.12, .92],
    finalDrive: 5.1,
    shiftTime: .08,
    upshiftRpm: 8600,
    downshiftRpm: 3400,
    downshiftRpmKick: 6200
  },
  brakes: {
    maxTorque: 10500
  },
  aero: {
    dragArea: .62,
    downforceFront: .36,
    downforceRear: .5
  },
  arcade: {
    brakeAssist: 8,
    forward: {
      accel: 5
    },
    nitro: {
      accel: 7.2,
      maxSpeed: 108
    },
    turn: {
      lateralG: 2.55,
      yawGain: 7.6
    }
  },
  steering: {
    maxAngle: 33 * kn
  }
});
export const jU = [{
  x: .47,
  y: .55,
  z: -2.75
}, {
  x: -.51,
  y: .58,
  z: -2.72
}];
export const $N = 768;
export const KN = 192;
export const lf = 8;
export const dd = 12;
export const xie = 300;
export const FT = 1.3;
export const cf = .3;
export const YU = {
  enabled: true,
  size: .85,
  length: 1.3,
  life: 1.15,
  duration: 1,
  turbulence: 1,
  stretch: 1,
  rise: 1,
  glow: .8,
  core: 1,
  blue: .85,
  violet: .33,
  sparks: .4,
  flash: 0,
  nitro: .8
};
export const Xy = new Vector3();
export const rg = new Vector3();
export const jN = new Quaternion();
