import assert from 'node:assert/strict';

const origin = process.argv[2] || 'http://127.0.0.1:8787';
if (!['127.0.0.1', 'localhost', '[::1]'].includes(new URL(origin).hostname)) throw new Error('Room verification requires an isolated local Worker; public rooms are not test fixtures.');
const sockets = [];
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function connect(id, version = 2) {
  const url = new URL('/room/KEPLER', origin.replace(/^http/, 'ws'));
  url.search = new URLSearchParams({ id, v: String(version), name: id, car: 'quadra' });
  const socket = new WebSocket(url);
  const frames = [];
  let heartbeat = false;
  socket.addEventListener('message', ({ data }) => {
    if (data === 'k') heartbeat = true;
    else frames.push(JSON.parse(data));
  });
  sockets.push(socket);
  async function frame(type, predicate = () => true) {
    for (let i = 0; i < 100; i++) {
      const match = frames.find((value) => value[0] === type && predicate(value));
      if (match) return match;
      await pause(20);
    }
    throw new Error(`Timed out waiting for ${type}: ${JSON.stringify(frames)}`);
  }
  return { socket, frames, frame, get heartbeat() { return heartbeat; } };
}

try {
  const response = await fetch(new URL('/lobby', origin));
  assert.equal(response.status, 200);
  const lobby = await response.json();
  assert.equal(lobby.open, true);
  assert.equal(lobby.rooms.length, 5);
  assert.equal(lobby.rooms[0].count, 0, 'Start with an empty isolated KEPLER room.');
  const a = connect('TESTA001');
  await a.frame('w');
  const b = connect('TESTB001');
  const welcome = await b.frame('w');
  assert.equal(welcome[2][0][0], 'TESTA001');
  await a.frame('j', (f) => f[1] === 'TESTB001');

  a.socket.send(JSON.stringify(['p', 1000, 1, 2, 3, 0, 0, 0, 1, 4, 0, 5, 4]));
  const pose = await b.frame('p');
  assert.deepEqual(pose, ['p', 'TESTA001', 1000, 1, 2, 3, 0, 0, 0, 1, 4, 0, 5, 4]);
  assert.equal(a.frames.some((f) => f[0] === 'p'), false);

  a.socket.send(JSON.stringify(['n', '<b>DRIVER</b>']));
  const renamed = await b.frame('n');
  assert.equal(renamed[2].includes('<'), false);
  a.socket.send(JSON.stringify(['rs', 'downtown-dash']));
  assert.equal((await a.frame('rs'))[3], 5000);
  await b.frame('rs');

  a.socket.send('k');
  for (let i = 0; i < 100 && !a.heartbeat; i++) await pause(20);
  assert.equal(a.heartbeat, true);
  a.socket.send(JSON.stringify(['m', 2]));
  assert.deepEqual(await b.frame('m'), ['m', 'TESTA001', 2]);
  a.socket.send(JSON.stringify(['g', 120, -220]));
  assert.deepEqual(await b.frame('g'), ['g', 'TESTA001', 120, -220]);
  a.socket.send(JSON.stringify(['c', 'tsurugi']));
  assert.deepEqual(await b.frame('c'), ['c', 'TESTA001', 'tsurugi']);

  const reconnect = connect('TESTA001');
  assert.equal((await reconnect.frame('w'))[1], 'TESTA001');
  assert.equal((await a.frame('x'))[1], 4004);
  await pause(100);
  assert.equal(b.frames.some(f => f[0] === 'l' && f[1] === 'TESTA001'), false, 'Replacing a tab must not remove its replacement.');
  b.socket.close();
  await reconnect.frame('l', f => f[1] === 'TESTB001');
  const rejoin = connect('TESTB001');
  assert.equal((await rejoin.frame('w'))[2][0][0], 'TESTA001');

  for (const id of ['TESTC001', 'TESTD001']) await connect(id).frame('w');
  const full = await connect('TESTE001').frame('x');
  assert.equal(full[1], 4001);
  const wrongVersion = await connect('TESTV001', 1).frame('x');
  assert.equal(wrongVersion[1], 4002);
  assert.equal((await (await fetch(new URL('/lobby', origin))).json()).rooms[0].count, 4);
  console.log('PASS: empty lobby, presence, pose identity, sanitization, shared race countdown, heartbeat, quick chat, map ping, car change, reconnect/replacement, leave/rejoin, four-seat capacity, protocol version.');
} finally {
  for (const socket of sockets) if (socket.readyState < WebSocket.CLOSING) socket.close();
  for (let i = 0; i < 100 && sockets.some(socket => socket.readyState !== WebSocket.CLOSED); i++) await pause(20);
}
