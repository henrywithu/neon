// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Cie, JN, Mie, sigilDefinitions, mm, b1 } from "../story/definitions.ts";
import { quadraConfiguration, jU, pie, mie, fie, gie, yie, Aie, bie } from "./configurations.ts";
import { missionDefinitions } from "../missions/definitions.ts";
export const yE = i => Cie[i] ?? i;
export const Bie = "trapnest-neon:progress";
export const vehicleCatalog = [{
  id: "quadra",
  name: "QUADRA TURBO-R",
  maker: "QUADRA",
  blurb: "Rear-mid V8, all torque and attitude. The car the city knows you by.",
  config: quadraConfiguration,
  tailpipes: jU,
  engine: {
    url: "/audio/engine/v8.json",
    rpmRange: [900, 7800],
    turbo: {
      release: "long-a",
      rate: .72,
      length: .65,
      attack: .012,
      tilt: 3200,
      bright: 8e3,
      twin: {
        release: "long-b",
        rate: .68,
        delay: .025,
        gain: .55
      },
      body: {
        release: "brake",
        rate: .8,
        level: 1.1
      },
      whoomp: .7,
      whoompHz: 85,
      flutter: 21,
      flutterEnd: 11,
      flutterFrom: .35,
      flutterTime: .75,
      flutterDepth: .6,
      flutterLevel: .7,
      tu: 2300,
      chest: 240,
      blade: .15,
      spin: [7600, 2600],
      spinLevel: .25,
      level: .75,
      spool: .5,
      whistle: {
        from: 3800,
        to: 7600
      }
    }
  },
  look: null,
  unlock: null,
  specs: {
    engine: "4.2 L TWIN-TURBO V8",
    zeroTo100: 3.4,
    topSpeed: 317,
    mass: 1480
  },
  stats: {
    speed: .82,
    accel: .8,
    handling: .78,
    nitro: .7
  }
}, {
  id: "tsurugi",
  name: "TSURUGI",
  maker: "HAGANE",
  blurb: "Cut from the same drawing as the Katana, forged for the street instead of the vault: a louvred wedge in raw steel, a wing you can read the road under, a twin-turbo V8 that never stops climbing, and a white-hot edge of neon like a blade's temper line. It is parked in your garage from the first night.",
  config: pie,
  tailpipes: [{
    x: .64,
    y: .3,
    z: -2.09
  }, {
    x: -.64,
    y: .3,
    z: -2.09
  }],
  engine: {
    url: "/audio/engine/v8.json",
    rpmRange: [1e3, 9e3],
    tune: {
      pitch: 1.07,
      drive: 2.3,
      subLevel: .12,
      subLoad: .24,
      eq720: 1.5,
      eq1400: 1,
      pops: 1.3
    },
    turbo: {
      release: "long-a",
      rate: .84,
      length: .58,
      attack: .01,
      tilt: 3600,
      bright: 8600,
      twin: {
        release: "long-b",
        rate: .8,
        delay: .02,
        gain: .5
      },
      body: {
        release: "brake",
        rate: .9,
        level: 1
      },
      whoomp: .65,
      whoompHz: 95,
      flutter: 24,
      flutterEnd: 13,
      flutterFrom: .3,
      flutterTime: .65,
      flutterDepth: .6,
      flutterLevel: .7,
      tu: 2600,
      chest: 270,
      blade: .25,
      spin: [8800, 3e3],
      spinLevel: .3,
      level: .8,
      spool: .4,
      whistle: {
        from: 4200,
        to: 8800
      }
    }
  },
  look: "neon",
  paints: [{
    name: "HAGANE",
    hex: "#9aa3ad",
    neon: {
      hex: "#cfeaff",
      rgb: [.81, .92, 1]
    }
  }, {
    name: "CRIMSON NIGHT",
    hex: "#50535b",
    neon: {
      hex: "#ff1f3a",
      rgb: [1, .05, .14]
    }
  }, {
    name: "SYNTHWAVE",
    hex: "#d6d9e0",
    neon: {
      hex: "#b43cff",
      rgb: [.6, .12, 1]
    }
  }, {
    name: "MIDNIGHT TEAL",
    hex: "#1f4e57",
    neon: {
      hex: "#12e6ff",
      rgb: [.02, .82, 1]
    }
  }, {
    name: "DESERT STRIKE",
    hex: "#c2a878",
    neon: {
      hex: "#ffa31a",
      rgb: [1, .5, .05]
    }
  }],
  camera: {
    hood: {
      height: 1.29,
      distance: -.2,
      lookHeight: 1.02
    }
  },
  unlock: null,
  specs: {
    engine: "4.8 L TWIN-TURBO FLAT-PLANE V8",
    zeroTo100: 3.4,
    topSpeed: 308,
    mass: 1330
  },
  stats: {
    speed: .8,
    accel: .8,
    handling: .86,
    nitro: .72
  }
}, {
  id: "velora",
  name: "VELORA TURBO",
  maker: "VELORA",
  blurb: "The eighties' wedge, rebuilt light: a small turbo engine that lives at 8k, short gears, a tail that steps out when you ask. Hex trades its keys for the first third of the sigils.",
  config: mie,
  tailpipes: [{
    x: .29,
    y: .36,
    z: -2
  }, {
    x: -.29,
    y: .36,
    z: -2
  }],
  engine: {
    url: "/audio/engine/v8.json",
    rpmRange: [950, 8200],
    tune: {
      pitch: 1.24,
      drive: 2.7,
      subLevel: .05,
      subLoad: .14,
      eq1400: 1.5,
      revGain: .6,
      pops: 1.5
    },
    turbo: {
      release: "short-a",
      length: .45,
      body: {
        release: "brake-b",
        rate: 1,
        level: .6
      },
      whoomp: .5,
      whoompHz: 120,
      flutter: 28,
      flutterEnd: 15,
      flutterFrom: .15,
      flutterTime: .6,
      tu: 3400,
      chest: 340,
      blade: .45,
      spin: [10500, 4e3],
      spinLevel: .3,
      level: .9,
      spool: .3,
      whistle: {
        from: 5200,
        to: 10500
      }
    }
  },
  look: "neon",
  paints: [{
    name: "TITANIUM",
    hex: "#6e737b",
    neon: {
      hex: "#4d8cff",
      rgb: [.2, .46, 1]
    }
  }, {
    name: "CRIMSON NIGHT",
    hex: "#50535b",
    neon: {
      hex: "#ff1f3a",
      rgb: [1, .05, .14]
    }
  }, {
    name: "SYNTHWAVE",
    hex: "#d6d9e0",
    neon: {
      hex: "#b43cff",
      rgb: [.6, .12, 1]
    }
  }, {
    name: "MIDNIGHT TEAL",
    hex: "#1f4e57",
    neon: {
      hex: "#12e6ff",
      rgb: [.02, .82, 1]
    }
  }, {
    name: "DESERT STRIKE",
    hex: "#c2a878",
    neon: {
      hex: "#ffa31a",
      rgb: [1, .5, .05]
    }
  }],
  camera: {
    hood: {
      height: 1.22,
      distance: -.2,
      lookHeight: .97
    }
  },
  unlock: {
    sigils: JN
  },
  specs: {
    engine: "2.8 L TURBO FLAT-SIX",
    zeroTo100: 3.6,
    topSpeed: 276,
    mass: 1240
  },
  stats: {
    speed: .62,
    accel: .66,
    handling: .9,
    nitro: .75
  }
}, {
  id: "tachyon",
  name: "TACHYON",
  maker: "ARCLIGHT",
  blurb: "A concept that never made it to the showroom, rebuilt for the night: a V12 swap under a canopy of black glass, neon along every line.",
  config: fie,
  tailpipes: [{
    x: .34,
    y: .45,
    z: -2.23
  }, {
    x: -.34,
    y: .45,
    z: -2.23
  }],
  engine: {
    url: "/audio/engine/v12.json",
    rpmRange: [950, 8e3],
    tune: {
      subLevel: .08,
      subLoad: .18,
      pitch: 1
    },
    turbo: {
      release: "short-b",
      rate: 1.05,
      length: .35,
      body: {
        release: "brake-b",
        rate: 1.2,
        level: .5
      },
      whoomp: .5,
      whoompHz: 100,
      spin: [7600, 2400],
      spinLevel: .9,
      spool: .12,
      whistle: {
        from: 3e3,
        to: 6800,
        tone: .85
      }
    }
  },
  look: "neon",
  paints: [{
    name: "CYBER-SPORT",
    hex: "#3c4048",
    neon: {
      hex: "#ff6a12",
      rgb: [1, .36, .04]
    }
  }, {
    name: "CRIMSON NIGHT",
    hex: "#50535b",
    neon: {
      hex: "#ff1f3a",
      rgb: [1, .05, .14]
    }
  }, {
    name: "SYNTHWAVE",
    hex: "#d6d9e0",
    neon: {
      hex: "#b43cff",
      rgb: [.6, .12, 1]
    }
  }, {
    name: "MIDNIGHT TEAL",
    hex: "#1f4e57",
    neon: {
      hex: "#12e6ff",
      rgb: [.02, .82, 1]
    }
  }, {
    name: "DESERT STRIKE",
    hex: "#c2a878",
    neon: {
      hex: "#ffa31a",
      rgb: [1, .5, .05]
    }
  }],
  camera: {
    hood: {
      height: 1.31,
      distance: -.2,
      lookHeight: 1.03
    }
  },
  unlock: {
    missions: Mie
  },
  specs: {
    engine: "6.0 L V12 · HYBRID BOOST",
    zeroTo100: 3.1,
    topSpeed: 339,
    mass: 1390
  },
  stats: {
    speed: .92,
    accel: .9,
    handling: .86,
    nitro: .85
  }
}, {
  id: "raijin",
  name: "RAIJIN",
  maker: "KAIJU WORKS",
  blurb: "The grand tourer the syndicates send when a job has to look expensive. A twin-turbo six with torque everywhere, a wing that means it.",
  config: gie,
  tailpipes: [{
    x: .6,
    y: .304,
    z: -2.504
  }, {
    x: -.6,
    y: .304,
    z: -2.504
  }],
  engine: {
    url: "/audio/engine/v12.json",
    rpmRange: [850, 7300],
    tune: {
      pitch: .9,
      subLevel: .12,
      subLoad: .24,
      drive: 2.3
    },
    turbo: {
      release: "body",
      rate: .75,
      length: .85,
      twin: {
        release: "long-c",
        rate: .72,
        delay: .035,
        gain: .55
      },
      body: {
        release: "brake",
        rate: .7,
        level: 1.3
      },
      whoomp: 1,
      whoompHz: 75,
      flutter: 17,
      flutterEnd: 8,
      flutterFrom: .3,
      flutterTime: 1,
      flutterDepth: .85,
      tu: 2e3,
      chest: 200,
      spin: [6600, 2e3],
      spinLevel: .3,
      level: .9,
      spool: .65,
      whistle: {
        from: 3200,
        to: 6600
      }
    }
  },
  look: "stock",
  paints: [{
    name: "PEARL WHITE",
    hex: "#ffffff"
  }, {
    name: "LIQUID SILVER",
    hex: "#b4bac2"
  }, {
    name: "GUNMETAL",
    hex: "#4a4f57"
  }, {
    name: "VOID BLACK",
    hex: "#121317"
  }, {
    name: "RACING RED",
    hex: "#c1121f"
  }, {
    name: "SUNSET ORANGE",
    hex: "#e8591a"
  }, {
    name: "SOLAR YELLOW",
    hex: "#f2c200"
  }, {
    name: "DEEP OCEAN",
    hex: "#1b3f8f"
  }],
  camera: {
    lift: .16,
    hood: {
      height: 1.46,
      distance: 0,
      lookHeight: 1.14
    }
  },
  unlock: {
    sigils: JN * 2
  },
  specs: {
    engine: "3.0 L TWIN-TURBO STRAIGHT-SIX",
    zeroTo100: 3.4,
    topSpeed: 310,
    mass: 1420
  },
  stats: {
    speed: .78,
    accel: .79,
    handling: .8,
    nitro: .78
  }
}, {
  id: "katana",
  name: "KATANA GTR-88",
  maker: "KATANA",
  blurb: "The eighties, reprogrammed for a future that never came: a wedge of gunmetal plate, a hybrid twin-turbo V6, neon down every edge. Hex keeps it under a sheet for whoever finds every sigil.",
  config: yie,
  tailpipes: [{
    x: .1,
    y: .495,
    z: -2.53
  }, {
    x: -.1,
    y: .495,
    z: -2.53
  }],
  engine: {
    url: "/audio/engine/v8.json",
    rpmRange: [900, 8e3],
    tune: {
      pitch: 1.1,
      subLevel: .1,
      subLoad: .2,
      drive: 2.8,
      pops: 1.5
    },
    turbo: {
      release: "short-a",
      rate: .9,
      length: .55,
      twin: {
        release: "short-b",
        rate: .95,
        delay: .02,
        gain: .5
      },
      body: {
        release: "brake-b",
        rate: .95,
        level: .8
      },
      whoomp: .6,
      whoompHz: 95,
      flutter: 26,
      flutterEnd: 13,
      flutterFrom: .25,
      flutterTime: .6,
      tu: 3e3,
      chest: 300,
      blade: .35,
      spin: [9e3, 3200],
      spinLevel: .45,
      level: .9,
      spool: .28,
      whistle: {
        from: 4200,
        to: 9e3,
        tone: .6
      }
    }
  },
  look: "neon",
  paints: [{
    name: "CRIMSON NIGHT",
    hex: "#50535b",
    neon: {
      hex: "#ff1f3a",
      rgb: [1, .05, .14]
    }
  }, {
    name: "SYNTHWAVE",
    hex: "#d6d9e0",
    neon: {
      hex: "#b43cff",
      rgb: [.6, .12, 1]
    }
  }, {
    name: "MIDNIGHT TEAL",
    hex: "#1f4e57",
    neon: {
      hex: "#12e6ff",
      rgb: [.02, .82, 1]
    }
  }, {
    name: "DESERT STRIKE",
    hex: "#c2a878",
    neon: {
      hex: "#ffa31a",
      rgb: [1, .5, .05]
    }
  }],
  camera: {
    hood: {
      height: 1.2,
      distance: -.2,
      lookHeight: .95
    }
  },
  unlock: {
    sigils: sigilDefinitions.length
  },
  specs: {
    engine: "3.0 L TWIN-TURBO V6 · HYBRID",
    zeroTo100: 2.9,
    topSpeed: 320,
    mass: 1280
  },
  stats: {
    speed: .88,
    accel: .95,
    handling: .9,
    nitro: .86
  }
}, {
  id: "vanta",
  name: "VANTA",
  maker: "NULL SECTOR RACING",
  blurb: "Banned from three circuits and one continent. Slicks, a sequential box, a wing you could land a drone on — and a turbo four that never stops screaming. Rio hands it to whoever wins every street race.",
  config: Aie,
  tailpipes: [{
    x: .133,
    y: .58,
    z: -2.09
  }, {
    x: -.133,
    y: .58,
    z: -2.09
  }],
  engine: {
    url: "/audio/engine/v8.json",
    rpmRange: [1100, 8600],
    tune: {
      pitch: 1.12,
      drive: 3.2,
      subLevel: .06,
      subLoad: .14,
      pops: 1.8
    },
    turbo: {
      release: "snap",
      rate: 1,
      length: .5,
      body: {
        release: "brake-b",
        rate: 1.1,
        level: .6
      },
      whoomp: .6,
      whoompHz: 110,
      flutter: 36,
      flutterEnd: 24,
      flutterFrom: .5,
      flutterTime: .45,
      flutterDepth: .6,
      tu: 3800,
      chest: 380,
      blade: .5,
      spin: [11500, 5e3],
      spinLevel: .3,
      level: 1.15,
      spool: .25,
      whistle: {
        from: 6e3,
        to: 11500,
        level: 1.2
      }
    }
  },
  look: "neon",
  camera: {
    hood: {
      height: 1.13,
      distance: -.45,
      lookHeight: .85
    }
  },
  unlock: {
    races: missionDefinitions.length
  },
  specs: {
    engine: "2.0 L TURBO FOUR · SEQUENTIAL",
    zeroTo100: 2.8,
    topSpeed: 311,
    mass: 1150
  },
  stats: {
    speed: .78,
    accel: .98,
    handling: .97,
    nitro: .83
  },
  credit: 'Base mesh "Race Car 01" by toddeppe (Sketchfab, CC BY 4.0), modified'
}, {
  id: "chrysalis",
  name: "CHRYSALIS",
  maker: "GENESYNTH",
  blurb: "Grown, not built. A bio-turbine in every pod, a skin that has never seen daylight — the city hands its keys to whoever finished every job, won every race and found every sigil.",
  config: bie,
  tailpipes: [{
    x: .2,
    y: .39,
    z: -2.18
  }, {
    x: -.2,
    y: .39,
    z: -2.18
  }],
  engine: {
    url: "/audio/engine/v12.json",
    rpmRange: [1400, 9e3],
    tune: {
      pitch: 1.3,
      drive: 1.4,
      subLevel: .04,
      subLoad: .1,
      pops: .6
    },
    turbo: {
      release: "sweep",
      rate: .8,
      length: .7,
      body: {
        release: "brake",
        rate: .8,
        level: .9
      },
      whoomp: .7,
      whoompHz: 90,
      flutter: 13,
      flutterEnd: 8,
      flutterFrom: .45,
      flutterTime: .8,
      flutterDepth: .45,
      flutterLevel: .6,
      tu: 2200,
      chest: 240,
      spin: [9200, 3400],
      spinLevel: .7,
      spool: .8,
      whistle: {
        from: 4200,
        to: 9e3,
        follows: "rpm",
        tone: .7
      }
    }
  },
  look: "neon",
  camera: {
    lift: .14,
    hood: {
      height: 1.62,
      distance: -.2,
      lookHeight: 1.2
    }
  },
  unlock: {
    missions: mm.length,
    races: missionDefinitions.length,
    sigils: sigilDefinitions.length
  },
  specs: {
    engine: "TWIN BIO-TURBINE",
    zeroTo100: 2.8,
    topSpeed: 359,
    mass: 1180
  },
  stats: {
    speed: .99,
    accel: .98,
    handling: .9,
    nitro: .95
  }
}];
export const zT = "quadra";
export function getVehicleDefinition(i) {
  return vehicleCatalog.find(e => e.id === yE(i)) ?? vehicleCatalog[0];
}
export function gm(i, e) {
  var s, n, r, o, a, l;
  const t = (c, u) => ({
    need: c,
    have: u,
    left: Math.max(0, c - u)
  });
  return {
    missions: t(((s = i.unlock) == null ? undefined : s.missions) ?? 0, ((n = e == null ? undefined : e.missionsDone) == null ? undefined : n.call(e)) ?? 0),
    races: t(((r = i.unlock) == null ? undefined : r.races) ?? 0, ((o = e == null ? undefined : e.racesDone) == null ? undefined : o.call(e)) ?? 0),
    sigils: t(((a = i.unlock) == null ? undefined : a.sigils) ?? 0, ((l = e == null ? undefined : e.sigilsFound) == null ? undefined : l.call(e)) ?? 0)
  };
}
export function isVehicleUnlocked(i, e) {
  if (!i.unlock || e != null && e.allCars) return true;
  const {
    missions: t,
    races: s,
    sigils: n
  } = gm(i, e);
  return !t.left && !s.left && !n.left;
}
export function Rie(i, e) {
  return isVehicleUnlocked(i, e) ? 0 : gm(i, e).missions.left;
}
export function Iie(i, e) {
  return isVehicleUnlocked(i, e) ? 0 : gm(i, e).races.left;
}
export function Nie(i, e) {
  return isVehicleUnlocked(i, e) ? 0 : gm(i, e).sigils.left;
}
export function getUnlockDescription(i, e) {
  if (isVehicleUnlocked(i, e)) return "";
  const {
      missions: t,
      races: s,
      sigils: n
    } = gm(i, e),
    r = [];
  t.left && r.push(`${t.left} more mission${t.left === 1 ? "" : "s"}`);
  s.left && r.push(`${s.left} more race${s.left === 1 ? "" : "s"}`);
  n.left && r.push(`${n.left} more sigil${n.left === 1 ? "" : "s"}`);
  return r.length > 1 ? `${r.slice(0, -1).join(", ")} and ${r.at(-1)}` : r.join("");
}
export function Lie(i) {
  const e = s => Rie(s, i) + Iie(s, i) + Nie(s, i),
    t = vehicleCatalog.filter(s => !isVehicleUnlocked(s, i));
  t.sort((s, n) => e(s) - e(n));
  return t[0] ?? null;
}
export function getSavedVehicle() {
  try {
    const i = JSON.parse(localStorage.getItem(Bie) ?? "null"),
      e = getVehicleDefinition((i == null ? undefined : i.car) ?? zT),
      t = mm.filter(o => {
        var a, l;
        return (l = (a = i == null ? undefined : i.missions) == null ? undefined : a[o.id]) == null ? undefined : l.done;
      }).length,
      s = missionDefinitions.filter(o => {
        var a, l;
        return (l = (a = i == null ? undefined : i.missions) == null ? undefined : a[o.id]) == null ? undefined : l.done;
      }).length,
      n = new Set(Object.keys((i == null ? undefined : i.sigils) ?? {}).filter(o => i.sigils[o]).map(b1)),
      r = sigilDefinitions.filter(o => n.has(o.id)).length;
    return isVehicleUnlocked(e, {
      missionsDone: () => t,
      racesDone: () => s,
      sigilsFound: () => r,
      allCars: !!(i != null && i.allCars)
    }) ? e : getVehicleDefinition(zT);
  } catch {
    return getVehicleDefinition(zT);
  }
}
