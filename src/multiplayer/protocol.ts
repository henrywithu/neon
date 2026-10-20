// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { FEATURES } from "../world/createWorld.ts";
const protocolVersion = 2;
export { protocolVersion };
const maxDrivers = 4;
export { maxDrivers };
const publicRooms = Object.freeze([Object.freeze({
  id: "KEPLER",
  name: "Kepler"
}), Object.freeze({
  id: "COPERNICUS",
  name: "Copernicus"
}), Object.freeze({
  id: "TURING",
  name: "Turing"
}), Object.freeze({
  id: "LOVELACE",
  name: "Lovelace"
}), Object.freeze({
  id: "TESLA",
  name: "Tesla"
})]);
export { publicRooms };
export const Xce = Object.freeze(publicRooms.map(i => i.id));
const closeCodes = Object.freeze({
  FULL: 4001,
  VERSION: 4002,
  BAD_REQUEST: 4003,
  REPLACED: 4004,
  TOO_MANY: 4005,
  ABUSE: 4008,
  MAINTENANCE: 4009,
  IDLE: 4010
});
export { closeCodes };
const vehicleFlags = Object.freeze({
  BRAKE: 1,
  REVERSE: 2,
  NITRO: 4,
  ON_FOOT: 8,
  DRIFT: 16,
  HORN: 32,
  LIGHTS: 64
});
export { vehicleFlags };
export const wp = Object.freeze(["FOLLOW ME", "WAIT FOR ME", "RACE YOU?", "NICE ONE!", "GG", "THANKS", "SORRY", "LET'S GO"]);
const messageCooldowns = Object.freeze({
  m: 700,
  g: 1500,
  s: 300,
  c: 1e3,
  rs: 5e3,
  rc: 150,
  rf: 1e3,
  rx: 1e3
});
export { messageCooldowns };
export const Jce = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const Zce = /^[A-Z0-9]{3,16}$/;
export function eue(i = 8) {
  const e = crypto.getRandomValues(new Uint8Array(i));
  let t = "";
  for (const s of e) t += Jce[s & 31];
  return t;
}
export const tue = i => Xce.includes(String(i ?? "").toUpperCase());
function normalizeRoomId(i) {
  const e = String(i ?? "").trim().toUpperCase();
  return Zce.test(e) ? e : null;
}
export { normalizeRoomId };
export const uG = 16;
export const dG = i => String(i ?? "").toUpperCase().replace(/[^A-Z0-9 _.-]/g, "");
export const nB = i => dG(i).replace(/\s+/g, " ").trim().slice(0, uG);
export const Tf = i => Math.round(i * 100) / 100;
export const sb = i => Math.round(i * 1e4) / 1e4;
function encodePose(i, e, t, s, n) {
  return JSON.stringify(["p", Math.round(i), Tf(e.x), Tf(e.y), Tf(e.z), sb(t.x), sb(t.y), sb(t.z), sb(t.w), Tf(s.x), Tf(s.y), Tf(s.z), n | 0]);
}
export { encodePose };
function decodePose(i) {
  return {
    id: i[1],
    t: i[2],
    x: i[3],
    y: i[4],
    z: i[5],
    qx: i[6],
    qy: i[7],
    qz: i[8],
    qw: i[9],
    vx: i[10],
    vy: i[11],
    vz: i[12],
    flags: i[13]
  };
}
export { decodePose };
export const iue = typeof location !== "undefined" ? location.host : "neon.henrywithu.com";
export const U0 = {
  name: "trapnest-neon:mp-name",
  id: "trapnest-neon:mp-id"
};
export let hG = typeof location < "u" && new URLSearchParams(location.search).has("mpdown");
export function rue(i) {
  hG = !!i;
}
export function oue(i) {
  return `${/^(localhost|127\.|\[::1\]|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(i) ? "ws" : "wss"}://${i}`;
}
function multiplayerSocketOrigin() {
  return hG ? "ws://127.0.0.1:9" : oue(iue);
}
export { multiplayerSocketOrigin };
function lobbyUrl() {
  const i = multiplayerSocketOrigin();
  return i ? `${i.replace(/^ws/, "http")}/lobby` : "";
}
export { lobbyUrl };
const isMultiplayerEnabled = () => FEATURES.multiplayer && !!multiplayerSocketOrigin() && true;
export { isMultiplayerEnabled };
function roomUrl(i, {
  id: id,
  name: name,
  car: car
}) {
  const n = new URLSearchParams({
    v: String(protocolVersion),
    id: id,
    name: name,
    car: car ?? ""
  });
  return `${multiplayerSocketOrigin()}/room/${i}?${n}`;
}
export { roomUrl };
export function rB(i) {
  try {
    return i === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}
export function lue() {
  const i = rB("session");
  let e = null;
  try {
    e = i == null ? undefined : i.getItem(U0.id);
  } catch {}
  if (!e || !/^[A-Za-z0-9]{6,16}$/.test(e)) {
    e = eue(10);
    try {
      i == null || i.setItem(U0.id, e);
    } catch {}
  }
  return e;
}
export const GE = i => `RUNNER-${i.slice(0, 3)}`;
export function cue(i) {
  var t;
  let e = "";
  try {
    e = ((t = rB("local")) == null ? undefined : t.getItem(U0.name)) ?? "";
  } catch {}
  return nB(e) || GE(i);
}
export function uue(i) {
  try {
    const e = rB("local");
    i ? e == null || e.setItem(U0.name, i) : e == null || e.removeItem(U0.name);
  } catch {}
}
