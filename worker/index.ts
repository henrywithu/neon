import { DurableObject } from 'cloudflare:workers';
import { CLOSE, MAX_DRIVERS, PROTOCOL_VERSION, PUBLIC_ROOMS, ROOM_IDS, VEHICLE_IDS, cleanName, validFrame } from '../src/shared/multiplayerProtocol';

interface Driver {
  id: string;
  name: string;
  car: string;
  joinedAt: number;
  activityAt: number;
  rateAt: number;
  messages: number;
}

/** One hibernatable Durable Object per room; poses never enter durable SQL storage. */
export class NeonRoom extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('k', 'k'));
  }

  private sockets(): WebSocket[] {
    return this.ctx.getWebSockets().filter((socket) => socket.readyState === WebSocket.OPEN);
  }

  getStatus(): { count: number } {
    return { count: this.sockets().length };
  }

  private broadcast(frame: unknown[], except?: WebSocket): void {
    const message = JSON.stringify(frame);
    for (const socket of this.sockets()) {
      if (socket === except) continue;
      try { socket.send(message); } catch { /* A disconnect is handled by webSocketClose. */ }
    }
  }

  private refuse(code: number, reason: string): Response {
    const pair = new WebSocketPair();
    pair[1].accept();
    pair[1].send(JSON.stringify(['x', code, reason]));
    pair[1].close(1000, reason);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || '';
    const car = url.searchParams.get('car') || 'quadra';
    if (url.searchParams.get('v') !== String(PROTOCOL_VERSION)) return this.refuse(CLOSE.VERSION, 'Protocol version mismatch');
    if (!/^[A-Za-z0-9]{6,16}$/.test(id) || !VEHICLE_IDS.includes(car as typeof VEHICLE_IDS[number])) return this.refuse(CLOSE.BAD_REQUEST, 'Invalid driver');

    for (const existing of this.sockets()) {
      const driver = existing.deserializeAttachment() as Driver;
      if (driver.id !== id) continue;
      existing.send(JSON.stringify(['x', CLOSE.REPLACED, 'Seat replaced']));
      existing.close(1000, 'Seat replaced');
    }
    const peers = this.sockets().filter((socket) => (socket.deserializeAttachment() as Driver).id !== id);
    if (peers.length >= MAX_DRIVERS) return this.refuse(CLOSE.FULL, 'Room full');
    const pair = new WebSocketPair();
    const now = Date.now();
    const driver: Driver = {
      id, car, name: cleanName(url.searchParams.get('name') || 'RUNNER'),
      joinedAt: now, activityAt: now, rateAt: now, messages: 0,
    };
    this.ctx.acceptWebSocket(pair[1], [id]);
    pair[1].serializeAttachment(driver);
    pair[1].send(JSON.stringify(['w', id, peers.map((socket) => {
      const peer = socket.deserializeAttachment() as Driver;
      return [peer.id, peer.name, peer.car];
    })]));
    this.broadcast(['j', id, driver.name, car], pair[1]);
    if (await this.ctx.storage.getAlarm() === null) await this.ctx.storage.setAlarm(now + 300_000);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  webSocketMessage(socket: WebSocket, data: string | ArrayBuffer): void {
    if (typeof data !== 'string' || data.length > 2_048) {
      socket.close(CLOSE.ABUSE, 'Invalid frame');
      return;
    }
    const driver = socket.deserializeAttachment() as Driver;
    if (Date.now() - driver.rateAt >= 1_000) { driver.rateAt = Date.now(); driver.messages = 0; }
    if (++driver.messages > 60) { socket.close(CLOSE.ABUSE, 'Rate exceeded'); return; }
    let frame: unknown;
    try { frame = JSON.parse(data); } catch { return; }
    if (!validFrame(frame)) return;
    driver.activityAt = Date.now();
    if (frame[0] === 'n') { driver.name = cleanName(frame[1] as string); frame[1] = driver.name; }
    if (frame[0] === 'c') driver.car = frame[1] as string;
    socket.serializeAttachment(driver);
    const output = [frame[0], driver.id, ...frame.slice(1)];
    if (frame[0] === 'rs') {
      output.push(5_000);
      this.broadcast(output);
    } else this.broadcast(output, socket);
  }

  webSocketClose(socket: WebSocket): void {
    const driver = socket.deserializeAttachment() as Driver | null;
    if (!driver) return;
    // A replaced tab must not remove its replacement from the other clients.
    if (!this.sockets().some((other) => other !== socket && (other.deserializeAttachment() as Driver).id === driver.id)) this.broadcast(['l', driver.id], socket);
  }

  webSocketError(socket: WebSocket): void {
    socket.close(1011, 'Connection error');
    this.webSocketClose(socket);
  }

  async alarm(): Promise<void> {
    const now = Date.now();
    for (const socket of this.sockets()) {
      const driver = socket.deserializeAttachment() as Driver;
      if (now - driver.activityAt > 1_200_000) {
        socket.send(JSON.stringify(['x', CLOSE.IDLE, 'Seat released']));
        socket.close(1000, 'Seat released');
      }
    }
    if (this.sockets().length) await this.ctx.storage.setAlarm(now + 300_000);
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/lobby') {
      if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
      const rooms = await Promise.all(PUBLIC_ROOMS.map(async (room) => ({ ...room, ...await env.ROOMS.getByName(room.id).getStatus(), max: MAX_DRIVERS })));
      return Response.json({ open: true, rooms }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const room = url.pathname.match(/^\/room\/([A-Z0-9]{3,16})$/)?.[1];
    if (room) {
      if (!ROOM_IDS.includes(room)) return new Response('Room not found', { status: 404 });
      if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') return new Response('WebSocket required', { status: 426 });
      const origin = request.headers.get('Origin');
      if (origin && origin !== url.origin) {
        const local = /^(localhost|127\.0\.0\.1|\[::1\])$/;
        if (!local.test(url.hostname) || !local.test(new URL(origin).hostname)) return new Response('Origin not allowed', { status: 403 });
      }
      return env.ROOMS.getByName(room).fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
