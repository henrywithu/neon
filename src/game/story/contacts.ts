// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export const contacts = {
  nyx: {
    id: "nyx",
    name: "NYX",
    role: "THE FIXER",
    color: "#ffd60a",
    bio: "Used to own the night. Now she picks who does.",
    pass: ["That's how you own a city.", "Now they know your name."],
    fail: ["Not yet. Again.", "The night doesn't wait. Go again."]
  },
  pops: {
    id: "pops",
    name: "POPS",
    role: "DISPATCH",
    color: "#19e3c5",
    bio: "Runs every cab and courier in the city. Pays on time. Hates scratches.",
    pass: ["Clean job. You'll get paid.", "Client's happy. So am I.", "Now that's a delivery."],
    fail: ["Client walked. Run it again.", "Nobody pays for late.", "That one comes out of your cut."]
  },
  lux: {
    id: "lux",
    name: "LUX",
    role: "DRIFT IDOL",
    color: "#b44bff",
    bio: "Streams the city's best drifts to millions. Lives for smoke.",
    pass: ["Chat is losing it. Beautiful.", "That's going in the highlight reel.", "Pure smoke. Pure art."],
    fail: ["Boring. Run it back.", "My stream fell asleep.", "More angle, less panic."]
  },
  rio: {
    id: "rio",
    name: "RIO",
    role: "SPEED FREAK",
    color: "#ff3b3b",
    bio: "Holds every speed record in the city. For now.",
    pass: ["Okay... that was fast.", "Not bad. For a rookie.", "Almost as fast as me."],
    fail: ["My grandma drives faster.", "Too slow. Again.", "Floor it next time."]
  },
  fuse: {
    id: "fuse",
    name: "FUSE",
    role: "DEMOLITIONS",
    color: "#a6ff00",
    bio: "Blows things up for a living. Mostly on purpose.",
    pass: ["Ha! Still in one piece!", "Loud. Messy. Perfect.", "Chaos looks good on you."],
    fail: ["Well. That went boom.", "Try exploding less.", "Again! Again!"]
  },
  hex: {
    id: "hex",
    name: "HEX",
    role: "NETRUNNER",
    color: "#3d7bff",
    bio: "Reads the city's code like graffiti. Collects what it leaves behind.",
    pass: [],
    fail: []
  }
};
export const Tue = ["pops", "lux", "rio", "fuse", "nyx"];
export const aB = "hex";
export const wG = i => `/textures/story/${i}.webp`;
