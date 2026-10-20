export const PROTOCOL_VERSION = 2;
export const MAX_DRIVERS = 4;
export const PUBLIC_ROOMS = [{
  id: 'KEPLER',
  name: 'Kepler'
}, {
  id: 'COPERNICUS',
  name: 'Copernicus'
}, {
  id: 'TURING',
  name: 'Turing'
}, {
  id: 'LOVELACE',
  name: 'Lovelace'
}, {
  id: 'TESLA',
  name: 'Tesla'
}] as const;
export const VEHICLE_IDS = ['quadra', 'tachyon', 'tsurugi', 'velora', 'raijin', 'vanta', 'katana', 'chrysalis'] as const;
export const ROOM_IDS: readonly string[] = PUBLIC_ROOMS.map(room => room.id);
export const CLOSE = {
  FULL: 4001,
  VERSION: 4002,
  BAD_REQUEST: 4003,
  REPLACED: 4004,
  TOO_MANY: 4005,
  ABUSE: 4008,
  MAINTENANCE: 4009,
  IDLE: 4010
} as const;
export function cleanName(value: string): string {
  return value.normalize('NFKC').replace(/[^a-zA-Z0-9 _.-]/g, '').trim().slice(0, 20) || 'RUNNER';
}

/** Client messages contain no sender ID; the room adds the verified connection ID. */
export function validFrame(value: unknown): value is [string, ...unknown[]] {
  if (!Array.isArray(value) || typeof value[0] !== 'string') return false;
  const finite = (n: unknown, max = 100_000): n is number => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= max;
  const identifier = (s: unknown): s is string => typeof s === 'string' && /^[a-z0-9-]{1,64}$/i.test(s);
  switch (value[0]) {
    case 'p':
      return value.length === 13 && value.slice(1, 12).every(n => finite(n, 1e12)) && Number.isInteger(value[12]) && value[12] >= 0 && value[12] <= 127;
    case 'n':
      return value.length === 2 && typeof value[1] === 'string' && value[1].length <= 80;
    case 'c':
      return value.length === 2 && VEHICLE_IDS.includes(value[1] as typeof VEHICLE_IDS[number]);
    case 'm':
      return value.length === 2 && Number.isInteger(value[1]) && value[1] >= 0 && value[1] < 8;
    case 'g':
      return value.length === 3 && finite(value[1]) && finite(value[2]);
    case 's':
      return value.length === 3 && [0, 1, 2].includes(value[1]) && identifier(value[2]);
    case 'rs':
    case 'rx':
      return value.length === 2 && identifier(value[1]);
    case 'rc':
    case 'rf':
      return value.length === 3 && identifier(value[1]) && finite(value[2], 1e9) && value[2] >= 0;
    default:
      return false;
  }
}
