// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export const L2 = "sports_score";
export const An = {
  icon: L2,
  from: "rio",
  race: true
};
export const uf = {
  pace: 46,
  slack: 12
};
export const qa = {
  pace: 52,
  slack: 10
};
export const XN = {
  pace: 58,
  slack: 8
};
export const missionDefinitions = [{
  ...An,
  id: "downtown-dash",
  name: "Downtown Dash",
  tier: 1,
  brief: "Once around the downtown blocks, every gate on the clock. Everybody starts here. Show me you won't stay here.",
  start: [-279, -696],
  route: [[64, -696], [67, -552], [-244, -550], [-246, -774], [-314, -696]],
  rules: uf
}, {
  ...An,
  id: "diagonal-dive",
  name: "Diagonal Dive",
  tier: 1,
  brief: "One boulevard cuts the city corner to corner. Dive down it, then thread the pillars under the expressway.",
  start: [-737, -864],
  route: [[-533, -646], [-453, -561], [-324, -409], [-90, -413], [127, -417]],
  rules: uf
}, {
  ...An,
  id: "eastside-loop",
  name: "Eastside Loop",
  tier: 1,
  brief: "The big sweeper around the east side, then back through the blocks. Keep your foot in it through the curve.",
  start: [674, -388],
  route: [[869, -424], [952, -203], [767, -207], [566, -224], [524, -304], [524, -388]],
  rules: uf
}, {
  ...An,
  id: "causeway-cannonball",
  name: "Causeway Cannonball",
  tier: 1,
  brief: "Straight down the causeway to the island, then a twist along the west shore. Point it and pull the trigger.",
  start: [159, 73],
  route: [[608, 410], [534, 504], [643, 648], [634, 857]],
  rules: uf
}, {
  ...An,
  id: "the-oval",
  name: "The Oval",
  tier: 1,
  brief: "Two laps of the loop road by the airport. No lights, no traffic jams, no excuses. Just speed.",
  start: [-108, 99],
  route: [[70, 395], [20, 560], [-120, 330], [-100, 100], [70, 395], [20, 560], [-120, 330], [-100, 100]],
  rules: {
    pace: 48,
    slack: 12
  }
}, {
  ...An,
  id: "runway-lights",
  name: "Runway Lights",
  tier: 1,
  brief: "A lap around the airport fence, down to the south tip and back. The planes are grounded. You're not.",
  start: [-400, 822],
  route: [[-406, 1237], [-348, 1483], [15, 858], [-124, 901], [-270, 910]],
  rules: uf
}, {
  ...An,
  id: "ladder-street",
  name: "Ladder Street",
  tier: 1,
  brief: "Zig-zag down the ladder blocks at the island's south end. Short, tight, and faster than it looks.",
  start: [1030, 898],
  route: [[1127, 924], [1127, 980], [1020, 1036], [876, 1057], [857, 849], [900, 811], [1013, 795]],
  rules: uf
}, {
  ...An,
  id: "redline-relay",
  name: "Redline Relay",
  tier: 2,
  brief: "Underground checkpoint race through the north quarter. Every gate is on the clock. Try to keep up.",
  text: "Street race in the north quarter. Show up if you can keep up.",
  start: [324, -1100],
  route: [[500, -1e3], [750, -850], [600, -700], [350, -800], [200, -950]],
  rules: {
    pace: 55
  }
}, {
  ...An,
  id: "grid-runner",
  name: "Grid Runner",
  tier: 2,
  brief: "The long way around downtown: square corners, long straights. Brake late or go home.",
  start: [-349, -852],
  route: [[135, -852], [251, -551], [-84, -560], [-314, -560], [-316, -776], [-316, -852]],
  rules: qa
}, {
  ...An,
  id: "crown-heights",
  name: "Crown Heights",
  tier: 2,
  brief: "Up the north ridge and back down through the heights. The view is great. You won't see it.",
  start: [-217, -1186],
  route: [[49, -1218], [-72, -1336], [-280, -1309], [-268, -1072], [-16, -1073], [-16, -1140]],
  rules: qa
}, {
  ...An,
  id: "seawall-sprint",
  name: "Seawall Sprint",
  tier: 2,
  brief: "From the north boulevard down the seawall road. Salt on the asphalt, sea on your left, clock in your face.",
  start: [388, -960],
  route: [[553, -1020], [635, -850], [807, -644], [869, -424], [784, -387]],
  rules: qa
}, {
  ...An,
  id: "bay-bridge-dash",
  name: "Bay Bridge Dash",
  tier: 2,
  brief: "Up the ramp, across the East Bay Bridge, down onto the island. The deck is wide open. Use all of it.",
  start: [485, 12],
  route: [[642, -18], {
    at: [760, 95],
    deck: "East Bay Bridge"
  }, {
    at: [950, 290],
    deck: "East Bay Bridge"
  }, [1106, 453], [1218, 549]],
  rules: qa
}, {
  ...An,
  id: "ring-road",
  name: "Ring Road Rush",
  tier: 2,
  brief: "The island's ring road is one long curve. Find the line and never lift.",
  start: [1217, 199],
  route: [[1306, 116], [1478, 278], [1438, 437], [1327, 553], [1256, 619], [1206, 647]],
  rules: qa
}, {
  ...An,
  id: "midtown-underpass",
  name: "Midtown Underpass",
  tier: 2,
  brief: "Around midtown's back streets and under the highways. Tight gates, dark pillars. Don't kiss the concrete.",
  start: [-48, -216],
  route: [[152, -213], [136, -344], [-64, -332], [-88, -170], [-389, -186], [-200, 6], [-45, -46]],
  rules: qa
}, {
  ...An,
  id: "southside-slalom",
  name: "Southside Slalom",
  tier: 2,
  brief: "Left, right, left through the south side blocks. Every gate is a corner. Carry the speed.",
  start: [-968, 727],
  route: [[-829, 724], [-792, 888], [-732, 974], [-728, 1086], [-896, 1084], [-880, 971], [-926, 800]],
  rules: qa
}, {
  ...An,
  id: "container-chase",
  name: "Container Chase",
  tier: 2,
  brief: "Around the container yards on the docks. Stacks on both sides, no room for mistakes.",
  start: [-1410, 1004],
  route: [[-1528, 1243], [-1372, 1243], [-1280, 1115], [-1289, 981], [-1324, 926], [-1333, 808]],
  rules: qa
}, {
  ...An,
  id: "west-side-weave",
  name: "West Side Weave",
  tier: 2,
  brief: "Block by block through the west side grid. Short straights, hard corners, harder walls.",
  start: [-980, -350],
  route: [[-885, -328], [-883, -242], [-1060, -247], [-1134, -204], [-1149, -152], [-1104, -56], [-1101, 8], [-1158, 139]],
  rules: qa
}, {
  ...An,
  id: "westgate-run",
  name: "Westgate Run",
  tier: 2,
  brief: "From the shore road into the west side's back streets. Short blocks, sharp kinks, zero forgiveness.",
  start: [-1312, 145],
  route: [[-1044, 144], [-881, 160], [-893, 230], [-1015, 333], [-1144, 380], [-1163, 472], [-1062, 562], [-993, 474]],
  rules: qa
}, {
  ...An,
  id: "hilltop-hairpins",
  name: "Hilltop Hairpins",
  tier: 3,
  brief: "The old hill roads fold back on themselves. Every gate is a hairpin, and every hairpin has a wall.",
  start: [-712, -958],
  route: [[-813, -1099], [-782, -1243], [-714, -1312], [-554, -1270], [-559, -1152], [-612, -929]],
  rules: {
    pace: 50,
    slack: 10
  }
}, {
  ...An,
  id: "island-grand-tour",
  name: "Island Grand Tour",
  tier: 3,
  brief: "The whole island, gate after gate, one clock. By the last one you'll know every corner by name.",
  start: [689, 551],
  route: [[779, 535], [877, 472], [1007, 420], [1066, 583], [1013, 674], [1045, 761], [1122, 860], [1127, 1064], [967, 1054], [885, 989], [727, 914], [643, 648]],
  rules: XN
}, {
  ...An,
  id: "harbor-link-sprint",
  name: "Harbor Link Sprint",
  tier: 3,
  brief: "Up onto the Harbor Link at the docks, and stay on the deck all the way to midtown. The street below doesn't count.",
  start: [-712, 1079],
  route: [[-668, 971], {
    at: [-690, 700],
    deck: "Harbor Link"
  }, {
    at: [-560, 330],
    deck: "Harbor Link"
  }, {
    at: [-300, 115],
    deck: "Harbor Link"
  }, [-12, -216]],
  rules: {
    pace: 75,
    slack: 10
  }
}, {
  ...An,
  id: "freeway-fury",
  name: "Freeway Fury",
  tier: 3,
  brief: "The West Shore Freeway, docks to the north end, flat out. Stay on the deck. The nitro is there for a reason.",
  start: [-1291, 928],
  route: [{
    at: [-1282, 542],
    deck: "West Shore Freeway"
  }, {
    at: [-1230, 76],
    deck: "West Shore Freeway"
  }, {
    at: [-1162, -385],
    deck: "West Shore Freeway"
  }, [-841, -717]],
  rules: {
    pace: 80,
    slack: 10
  }
}, {
  ...An,
  id: "coast-to-coast",
  name: "Coast to Coast",
  tier: 3,
  brief: "The big one: from the west docks to the east island, every district, one clock. Win this and I'll remember your name.",
  start: [-1450, 1243],
  route: [[-1289, 981], [-1231, 1049], [-1063, 1025], [-978, 943], [-829, 724], [-730, 888], [-559, 306], [-448, 188], [-141, 29], [-45, -46], [125, 57], [608, 410], [534, 504]],
  rules: XN
}];
