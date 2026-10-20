// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { missionDefinitions } from "../missions/definitions.ts";
export const mm = [{
  id: "first-fare",
  name: "First Fare",
  icon: "local_taxi",
  tier: 1,
  from: "pops",
  brief: "A suit in the back seat, late for a meeting up in the north hills. Beat the meter. Late fares don't pay.",
  text: "Got a fare for you, rookie. Suit in a hurry. Don't keep him waiting.",
  start: [-84, -620],
  route: [[-330, -980]],
  rules: {
    pace: 42,
    slack: 12
  }
}, {
  id: "smoke-show",
  name: "Smoke Show",
  icon: "live_tv",
  tier: 1,
  from: "lux",
  brief: "Warm-up set for my stream. Bank 2,500 drift points around the checkerboard blocks. Hit a wall, who cares. Just keep it sideways.",
  text: "Warm-up set tonight. Bring smoke, not excuses.",
  start: [294, 88],
  route: [],
  rules: {
    drift: 2500,
    time: 150,
    zone: 260
  }
}, {
  id: "glass-cargo",
  name: "Glass Cargo",
  icon: "diamond",
  tier: 1,
  from: "pops",
  brief: "Twelve crates of synth-crystal. A few bumps are priced in, but wreck the load and nobody gets paid.",
  text: "Fragile cargo, fat paycheck. Drive like it's full of eggs.",
  start: [552, -700],
  route: [[860, -380]],
  rules: {
    pace: 38,
    slack: 12,
    damage: 60
  }
}, {
  id: "sideways-sermon",
  name: "Sideways Sermon",
  icon: "church",
  tier: 1,
  from: "lux",
  brief: "The street preacher only listens to tire smoke. Slide all the way to the chapel. Scrape a wall if you must, my chat loves that too.",
  text: "My chat wants smoke tonight. Come put on a show, superstar.",
  start: [-584, -1e3],
  route: [[100, -1180]],
  rules: {
    drift: 3e3,
    time: 210
  }
}, {
  id: "shaky-cargo",
  name: "Shaky Cargo",
  icon: "science",
  tier: 1,
  from: "fuse",
  brief: "My new batch is a little... sensitive. Get it to the west side lab. Three bumps, tops. The fourth and we're both confetti.",
  text: "Got a delivery. It's fine. Mostly. Drive gently.",
  start: [-629, -569],
  route: [[-1124, -257]],
  rules: {
    pace: 32,
    slack: 20,
    crashes: 3
  }
}, {
  id: "chrome-ballet",
  name: "Chrome Ballet",
  icon: "theater_comedy",
  tier: 2,
  from: "lux",
  brief: "The drone crews want a show all the way to the old studios. Dance for the cameras. Scrapes are fine, boring isn't.",
  text: "The drone crews booked a show. You're the headliner.",
  start: [-560, -250],
  route: [[-700, -700]],
  rules: {
    drift: 4e3,
    time: 240
  }
}, {
  id: "dead-mans-pedal",
  name: "Dead Man's Pedal",
  icon: "bomb",
  tier: 2,
  from: "fuse",
  brief: "Call it a test: your car is wired. Pass 90 km/h and never drop below it. The bomb squad waits at the West Shore ramp.",
  text: "Got a little experiment for you. Tiny bomb. Big fun.",
  start: [-1008, -694],
  route: [{
    at: [-1162, -385],
    deck: "West Shore Freeway"
  }, {
    at: [-1230, 76],
    deck: "West Shore Freeway"
  }, {
    at: [-1282, 542],
    deck: "West Shore Freeway"
  }, {
    at: [-1332, 869],
    raw: true
  }],
  rules: {
    minSpeed: 90,
    time: 80
  }
}, {
  id: "runway-rocket",
  name: "Runway Rocket",
  icon: "flight_takeoff",
  tier: 2,
  from: "rio",
  brief: "The airport's closed tonight. Hit 220 km/h and stop in the box before the fence. You'll want the nitro.",
  text: "The airport is closed tonight. The runway is ours. Bring nitro.",
  start: [-1496, 525],
  startRaw: true,
  heading: Math.PI,
  route: [{
    at: [-1496, -40],
    raw: true,
    stop: true
  }],
  rules: {
    topSpeed: 220,
    time: 40
  }
}, {
  id: "expressway-phantom",
  name: "Expressway Phantom",
  icon: "speed",
  tier: 2,
  from: "rio",
  brief: "Ghost the Crosstown Expressway end to end. Stay on the deck. The street below doesn't count.",
  text: "Crosstown Expressway, end to end. Think you can ghost it?",
  start: [-1060, -370],
  route: [{
    at: [-700, -385],
    deck: "Crosstown Expressway"
  }, {
    at: [-250, -390],
    deck: "Crosstown Expressway"
  }, {
    at: [150, -410],
    deck: "Crosstown Expressway"
  }, [640, -388]],
  rules: {
    pace: 105,
    slack: 10
  }
}, {
  id: "bridge-burner",
  name: "Bridge Burner",
  icon: "local_fire_department",
  tier: 2,
  from: "fuse",
  brief: "Cross to the island before the toll bots wake up. Nitro trips their sensors, so keep it off.",
  text: "Toll bots on the bridge. Let's wake them up. Quietly.",
  start: [250, -137],
  route: [[1e3, 450]],
  rules: {
    pace: 62,
    noNitro: true
  }
}, {
  id: "riot-sweep",
  name: "Riot Sweep",
  icon: "destruction",
  tier: 1,
  from: "fuse",
  brief: "The block party got out of hand. Flatten the junk before the cops roll in. No barricades, no arrests.",
  text: "Block party got out of hand. Help me clean up. My way.",
  start: [200, -560],
  route: [],
  rules: {
    smash: 15,
    time: 60,
    zone: 250
  }
}, {
  id: "diplomatic-plates",
  name: "Diplomatic Plates",
  icon: "work",
  tier: 2,
  from: "pops",
  brief: "A consul in the back, late for a summit up on the north ridge. Keep the damage under 40%. Those plates don't dent.",
  text: "VIP fare. Diplomatic plates. Drive like a limo, not a cab.",
  start: [509, -865],
  route: [[49, -1218]],
  rules: {
    pace: 38,
    slack: 20,
    damage: 40
  }
}, {
  id: "dockside-tornado",
  name: "Dockside Tornado",
  icon: "cyclone",
  tier: 3,
  from: "lux",
  brief: "The dock crews bet you can't. Burn 5,000 drift points around the docks before the shift horn, and take their money.",
  text: "The dock crews are betting against you. Let's take their money.",
  start: [-1380, 927],
  route: [],
  rules: {
    drift: 5e3,
    time: 120,
    zone: 260
  }
}, {
  id: "one-breath",
  name: "One Breath",
  icon: "all_inclusive",
  tier: 3,
  from: "lux",
  brief: "One chain, no breaks. Link the south-west corners into a single 2,500-point drift. That's the clip that goes viral.",
  text: "I need one perfect drift. The clip of the year. Just one.",
  start: [-828, 560],
  route: [],
  rules: {
    chain: 2500,
    time: 150,
    zone: 280
  }
}, {
  id: "parcel-postman",
  name: "Parcel Postman",
  icon: "package_2",
  tier: 1,
  from: "pops",
  brief: "Four drops across the island. Park inside each zone. The lockers only open when you stop.",
  text: "Four parcels, four lockers. Easy money. Don't get fancy.",
  start: [830, 511],
  route: [{
    at: [1050, 600],
    stop: true
  }, {
    at: [1200, 800],
    stop: true
  }, {
    at: [950, 1e3],
    stop: true
  }, {
    at: [700, 800],
    stop: true
  }],
  rules: {
    pace: 34,
    slack: 20
  }
}, {
  id: "clean-sheet",
  name: "Clean Sheet",
  icon: "shield",
  tier: 2,
  from: "pops",
  brief: "Insurance audit. Cross the island on the clock with three dents at most, or my premiums triple.",
  text: "Insurance audit tonight. Three dents, tops. You can do that, right?",
  start: [1289, 373],
  route: [[650, 1050]],
  rules: {
    pace: 40,
    slack: 12,
    crashes: 3
  }
}, {
  id: "overdrive",
  final: true,
  name: "Overdrive",
  icon: "crown",
  tier: 3,
  from: "nyx",
  brief: "Last run. South docks to the north hills, every checkpoint on the clock. Bring the car home in one piece and the whole city knows your name.",
  text: "Last run. The whole city is watching. Come take your crown.",
  start: [-700, 888],
  route: [[-300, -100], [-8, -552], [324, -1100]],
  rules: {
    pace: 54,
    slack: 20,
    damage: 75
  }
}];
export const y1 = [...mm, ...missionDefinitions];
export const UT = new Map(y1.map(i => [i.id, i]));
const sigilDefinitions = [{
  id: "knockout-glove",
  icon: "sports_mma",
  name: "Knockout Glove",
  color: "#ff2424",
  lore: "Signed by a champion who never lost a street fight.",
  anchor: [-273.3, -628]
}, {
  id: "plasma-ember",
  icon: "mode_heat",
  name: "Plasma Ember",
  color: "#ff6a00",
  lore: "Still warm. It has been warm since 2077.",
  anchor: [268.7, -965.7]
}, {
  id: "caldera-core",
  icon: "volcano",
  name: "Caldera Core",
  color: "#ffa800",
  lore: "Chipped off the volcano the city was poured over.",
  anchor: [-558, -1170.7]
}, {
  id: "overvolt-bolt",
  icon: "electric_bolt",
  name: "Overvolt Bolt",
  color: "#ffee00",
  lore: "Hums at exactly the frequency of the city grid.",
  anchor: [648.7, -515.3]
}, {
  id: "toxin-spore",
  icon: "coronavirus",
  name: "Toxin Spore",
  color: "#b8ff00",
  lore: "Drifted out of the chem plant vents. Hold your breath.",
  anchor: [-1152.7, -291]
}, {
  id: "photosynth-leaf",
  icon: "eco",
  name: "Photosynth Leaf",
  color: "#2bff4a",
  lore: "The last leaf that ever saw real sunlight.",
  anchor: [-392.7, 330.7]
}, {
  id: "glitch-beetle",
  icon: "bug_report",
  name: "Glitch Beetle",
  color: "#00ffa6",
  lore: "Crawls out of corrupted firmware at 3 a.m.",
  anchor: [828.7, -163]
}, {
  id: "cryo-lattice",
  icon: "ac_unit",
  name: "Cryo Lattice",
  color: "#66f2ff",
  lore: "Frost that never melts, even in the acid rain.",
  anchor: [-31.3, -1365.3]
}, {
  id: "skywire-raven",
  icon: "raven",
  name: "Skywire Raven",
  color: "#00aeff",
  lore: "Nests in the power lines above the expressway.",
  anchor: [-1196, 182]
}, {
  id: "hydro-tear",
  icon: "water_drop",
  name: "Hydro Tear",
  color: "#2455ff",
  lore: "Fished out of the harbor. Still dripping.",
  anchor: [-1402, 867.3]
}, {
  id: "spliced-helix",
  icon: "genetics",
  name: "Spliced Helix",
  color: "#6a2bff",
  lore: "A gene patch nobody remembers writing.",
  anchor: [-864.7, 694]
}, {
  id: "eclipse-moon",
  icon: "dark_mode",
  name: "Eclipse Moon",
  color: "#b000ff",
  lore: "A slice of the night the billboards never lit.",
  anchor: [330.7, -89.3]
}, {
  id: "phantom-owl",
  icon: "owl",
  name: "Phantom Owl",
  color: "#c98bff",
  lore: "Watches the alleys. Never blinks.",
  anchor: [742, 536.7]
}, {
  id: "pixie-dust",
  icon: "auto_awesome",
  name: "Pixie Dust",
  color: "#ff22e0",
  lore: "What's left of a light show banned in three districts.",
  anchor: [1222, 492]
}, {
  id: "third-eye",
  icon: "visibility",
  name: "Third Eye",
  color: "#ff3d86",
  lore: "Shows you the route before the GPS does.",
  anchor: [1003.3, 900]
}, {
  id: "chrome-sentry",
  icon: "robot_2",
  name: "Chrome Sentry",
  color: "#8fa8ff",
  lore: "Pressed from the bumpers of a thousand wrecks. Still on guard.",
  anchor: [-644.7, -469.3]
}, {
  id: "null-orbit",
  icon: "orbit",
  name: "Null Orbit",
  color: "#f2f7ff",
  lore: "Proof that nothing can go around in circles too.",
  anchor: [-135.3, -809.3]
}, {
  id: "rust-wheel",
  icon: "attractions",
  name: "Rust Wheel",
  color: "#ff9f1c",
  lore: "The fairground closed in 2061. The wheel still turns at midnight.",
  anchor: [-482.7, 1234]
}, {
  id: "tidal-surge",
  icon: "tsunami",
  name: "Tidal Surge",
  color: "#1ae0ff",
  lore: "Bottled the night the seawall almost broke.",
  anchor: [85, 478.3]
}, {
  id: "sewer-king",
  icon: "pest_control_rodent",
  name: "Sewer King",
  color: "#9bff6b",
  lore: "Rules everything under the streets. Lost his crown to you.",
  anchor: [-937.7, 1230.7]
}, {
  id: "racers-helmet",
  icon: "sports_motorsports",
  name: "Racer's Helmet",
  color: "#ff3355",
  lore: "Found in a ditch off the Harbor Link. The racer never was.",
  anchor: [-743.7, 116.3]
}, {
  id: "midnight-ramen",
  icon: "ramen_dining",
  name: "Midnight Ramen",
  color: "#ffb347",
  lore: "Best bowl in town. The stall only exists after 2 a.m.",
  anchor: [116.3, -465.3]
}, {
  id: "rogue-planet",
  icon: "planet",
  name: "Rogue Planet",
  color: "#7a5cff",
  lore: "A pocket-sized world that drifted off the star charts.",
  anchor: [1389.3, 115.7]
}, {
  id: "moonshot",
  icon: "rocket_launch",
  name: "Moonshot",
  color: "#ff5e00",
  lore: "One-way ticket off the runway. Nobody took the ride.",
  anchor: [-1521.3, 379.3]
}, {
  id: "loaded-die",
  icon: "casino",
  name: "Loaded Die",
  color: "#ff2d95",
  lore: "Always rolls a six. The casino wants it back.",
  anchor: [592.3, 196.7]
}, {
  id: "white-rabbit",
  icon: "cruelty_free",
  name: "White Rabbit",
  color: "#ffe3f1",
  lore: "Follow it. Everyone else did.",
  anchor: [-96.3, 58]
}, {
  id: "poison-apple",
  icon: "nutrition",
  name: "Poison Apple",
  color: "#a3ff00",
  lore: "Grown in a lab. One bite and the fairy tale is over.",
  anchor: [647, 1042.7]
}, {
  id: "bone-cage",
  icon: "rib_cage",
  name: "Bone Cage",
  color: "#7dffd9",
  lore: "What's left after a chrome-bone mod goes wrong.",
  anchor: [-488.7, 807.7]
}, {
  id: "chrome-skull",
  icon: "skull",
  name: "Chrome Skull",
  color: "#c0c8ff",
  lore: "Polished by a thousand nervous thumbs.",
  anchor: [-822.7, -935.3]
}, {
  id: "dead-satellite",
  icon: "satellite_alt",
  name: "Dead Satellite",
  color: "#4dd2ff",
  lore: "Fell from orbit, still pinging home.",
  anchor: [606.3, -1005.3]
}, {
  id: "skeleton-key",
  icon: "key",
  name: "Skeleton Key",
  color: "#ffd24d",
  lore: "Opens any door in the old city. Some shouldn't be.",
  anchor: [-1443, 1231.3]
}, {
  id: "storm-cell",
  icon: "thunderstorm",
  name: "Storm Cell",
  color: "#5c7cff",
  lore: "A thunderstorm in a jar. Don't shake it.",
  anchor: [-961.3, -620]
}, {
  id: "ghost-hand",
  icon: "hand_bones",
  name: "Ghost Hand",
  color: "#d68bff",
  lore: "X-ray of a pickpocket who picked the wrong pocket.",
  anchor: [-847.3, -205.7]
}, {
  id: "pulse-heart",
  icon: "cardiology",
  name: "Pulse Heart",
  color: "#ff1f5a",
  lore: "Still beating. Nobody knows whose.",
  anchor: [-217.7, -229.3]
}, {
  id: "funnel-cloud",
  icon: "tornado",
  name: "Funnel Cloud",
  color: "#9ab8ff",
  lore: "The twister that skipped the city, bottled.",
  anchor: [-1245.7, 510.7]
}, {
  id: "crossed-katanas",
  icon: "swords",
  name: "Crossed Katanas",
  color: "#ff4dff",
  lore: "Two blades from a duel nobody won.",
  anchor: [973.7, 273.7]
}, {
  id: "arcade-stick",
  icon: "joystick",
  name: "Arcade Stick",
  color: "#39ff88",
  lore: "From the last cabinet at the Neon Palace. High score: you.",
  anchor: [247, 258]
}, {
  id: "dead-mans-step",
  icon: "foot_bones",
  name: "Dead Man's Step",
  color: "#b8a1ff",
  lore: "Footprints that never reached the other side.",
  anchor: [-1105.7, 899.3]
}, {
  id: "gold-molar",
  icon: "dentistry",
  name: "Gold Molar",
  color: "#ffcc00",
  lore: "Pulled from a mob accountant. He talked anyway.",
  anchor: [-916.3, 377.3]
}, {
  id: "wetware-brain",
  icon: "neurology",
  name: "Wetware Brain",
  color: "#ff85c8",
  lore: "Somebody's backup. Handle with care.",
  anchor: [-247.7, -1110.7]
}, {
  id: "stim-shot",
  icon: "syringe",
  name: "Stim Shot",
  color: "#00ffd5",
  lore: "Keeps you awake for three nights. Don't.",
  anchor: [-508, -892.3]
}, {
  id: "rabbit-pill",
  icon: "pill",
  name: "Rabbit Pill",
  color: "#ff3b3b",
  lore: "Take it and see how deep the city goes.",
  anchor: [19.3, -192.3]
}, {
  id: "smog-lungs",
  icon: "pulmonology",
  name: "Smog Lungs",
  color: "#c6ff3d",
  lore: "A souvenir from the industrial district.",
  anchor: [-529.3, -156.7]
}, {
  id: "lucky-femur",
  icon: "femur",
  name: "Lucky Femur",
  color: "#fff08a",
  lore: "A street dog's treasure. It wants it back.",
  anchor: [-775.7, 955.7]
}, {
  id: "ghost-chip",
  icon: "memory",
  name: "Ghost Chip",
  color: "#2effd0",
  lore: "Runs code nobody wrote.",
  anchor: [399.3, -713.7]
}, {
  id: "pirate-tower",
  icon: "cell_tower",
  name: "Pirate Tower",
  color: "#ff7a00",
  lore: "Broadcasts the station the city banned.",
  anchor: [752.3, -789.3]
}, {
  id: "solar-flare",
  icon: "flare",
  name: "Solar Flare",
  color: "#ffe600",
  lore: "Proof the sun still exists above the smog.",
  anchor: [-377, -1326.7]
}, {
  id: "stolen-print",
  icon: "fingerprint",
  name: "Stolen Print",
  color: "#6ef0ff",
  lore: "The only fingerprint the police never matched.",
  anchor: [-1071.7, -95]
}, {
  id: "mad-flask",
  icon: "experiment",
  name: "Mad Flask",
  color: "#5dff00",
  lore: "Bubbling. Always bubbling.",
  anchor: [471.7, -280]
}, {
  id: "last-vinyl",
  icon: "album",
  name: "Last Vinyl",
  color: "#ff66c4",
  lore: "The only record left from before the streams.",
  anchor: [593, 746.7]
}, {
  id: "borrowed-time",
  icon: "hourglass",
  name: "Borrowed Time",
  color: "#ffae00",
  lore: "Every grain is a second somebody owes.",
  anchor: [1476.3, 460.3]
}, {
  id: "iron-knight",
  icon: "chess_knight",
  name: "Iron Knight",
  color: "#a0b4ff",
  lore: "Took the queen in the tournament of '69. Never lost since.",
  anchor: [2.7, -1091.7]
}, {
  id: "fortune-cookie",
  icon: "cookie",
  name: "Fortune Cookie",
  color: "#ffc266",
  lore: "The fortune inside says: turn left.",
  anchor: [1061.3, 658.3]
}, {
  id: "game-over",
  icon: "sentiment_very_dissatisfied",
  name: "Game Over",
  color: "#ff5c8a",
  lore: "Insert coin to continue.",
  anchor: [980, -67]
}];
export { sigilDefinitions };
export const AE = new Map(sigilDefinitions.map(i => [i.id, i]));
export const Eie = {
  "iron-knuckle": "knockout-glove",
  "tectonic-shard": "caldera-core",
  "toxin-bloom": "toxin-spore",
  "glitch-scarab": "glitch-beetle",
  "skywire-moth": "skywire-raven",
  "hydro-sigil": "hydro-tear",
  "wyrm-firmware": "spliced-helix",
  "eclipse-fang": "eclipse-moon",
  "phantom-loop": "phantom-owl",
  "pixie-note": "pixie-dust",
  "chrome-strata": "chrome-sentry",
  "null-halo": "null-orbit"
};
export const b1 = i => Eie[i] ?? i;
export const Mie = 3;
export const JN = Math.ceil(sigilDefinitions.length / 3);
export const Cie = {
  i8: "tachyon",
  bulwark: "katana",
  kitsune: "velora"
};
