/**
 * Bansify Meet signalling service.
 *
 * Two participants that open the same room code exchange SDP offers, answers and ICE
 * candidates here; the audio and video go directly between browsers. Every room is one
 * Durable Object, so state is consistent and short-lived.
 */
import { MeetingRoom } from './room.ts';

export { MeetingRoom };

interface Env {
  MEET_ROOMS: DurableObjectNamespace;
  MEET_ORIGIN?: string;
}

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': 'https://meet.bansify.com',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  });
}

function roomStub(env: Env, code: string): DurableObjectStub {
  return env.MEET_ROOMS.get(env.MEET_ROOMS.idFromName(code));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    const path = url.pathname.replace(/^\/api\/meet/, '');
    const parts = path.split('/').filter(Boolean);

    // /api/meet/rooms — create a room code
    if (parts[0] === 'rooms' && parts.length === 1 && request.method === 'POST') {
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      await roomStub(env, code).fetch(new Request('https://room/join', {
        method: 'POST',
        body: JSON.stringify({ name: 'host' }),
        headers: { 'content-type': 'application/json' },
      }));
      return json({ ok: true, code });
    }

    // /api/meet/rooms/:code/<action>
    if (parts[0] === 'rooms' && parts[1] && parts[2]) {
      const code = parts[1].toUpperCase();
      const action = parts[2];
      const stub = roomStub(env, code);
      const target = new URL(`https://room/${action}`);
      for (const [key, value] of url.searchParams) target.searchParams.set(key, value);
      return stub.fetch(new Request(target.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method === 'GET' ? undefined : await request.text(),
      }));
    }

    return json({ error: 'not_found' }, 404);
  },
};
