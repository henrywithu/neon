import assert from 'node:assert/strict';

const origin = process.argv[2] || 'http://127.0.0.1:8787';
const sockets = [];
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function connect(id, version = 2) {
  const url = new URL('/room/KEPLER', origin.replace(/^http/, 'ws'));
  url.search = new URLSearchParams({ id, v: String(version), name: id, car: 'quadra' });
  const socket = new WebSocket(url);
  const frames = [];
  socket.addEventListener('message', ({ data }) => {
    if (data !== 'k') frames.push(JSON.parse(data));
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
  return { socket, frames, frame };
}

try {
  const response = await fetch(new URL('/lobby', origin));
  assert.equal(response.status, 200);
  const lobby = await response.json();
  assert.equal(lobby.open, true);
  assert.equal(lobby.rooms.length, 5);
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

  for (const id of ['TESTC001', 'TESTD001']) await connect(id).frame('w');
  const full = await connect('TESTE001').frame('x');
  assert.equal(full[1], 4001);
  const wrongVersion = await connect('TESTV001', 1).frame('x');
  assert.equal(wrongVersion[1], 4002);
  assert.equal((await (await fetch(new URL('/lobby', origin))).json()).rooms[0].count, 4);
  console.log('PASS: lobby, presence, pose identity, sanitization, race echo, capacity, protocol version.');
} finally {
  for (const socket of sockets) if (socket.readyState < WebSocket.CLOSING) socket.close();
}
