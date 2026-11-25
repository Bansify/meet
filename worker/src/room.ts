/**
 * One Durable Object per meeting room. It keeps the participant list and relays signalling
 * messages between peers; media never passes through the Worker.
 */
export interface Participant {
  id: string;
  name: string;
  joinedAt: number;
}

interface SignalMessage {
  from: string;
  to?: string;
  payload: unknown;
  at: number;
}

export class MeetingRoom {
  private state: DurableObjectState;
  private participants = new Map<string, Participant>();
  private signals: SignalMessage[] = [];
  private chat: Array<{ from: string; name: string; text: string; at: number }> = [];

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop();

    if (request.method === 'POST' && action === 'join') {
      const body = (await request.json().catch(() => ({}))) as { id?: string; name?: string };
      const id = body.id ?? crypto.randomUUID();
      this.participants.set(id, { id, name: body.name ?? 'Guest', joinedAt: Date.now() });
      return Response.json({ ok: true, id, participants: [...this.participants.values()] });
    }

    if (request.method === 'POST' && action === 'leave') {
      const body = (await request.json().catch(() => ({}))) as { id?: string };
      if (body.id) this.participants.delete(body.id);
      return Response.json({ ok: true, participants: [...this.participants.values()] });
    }

    if (request.method === 'POST' && action === 'signal') {
      const body = (await request.json().catch(() => ({}))) as SignalMessage;
      if (!body?.from) return Response.json({ error: 'from_required' }, { status: 400 });
      this.signals.push({ ...body, at: Date.now() });
      if (this.signals.length > 200) this.signals = this.signals.slice(-200);
      return Response.json({ ok: true });
    }

    if (request.method === 'GET' && action === 'signal') {
      const since = Number(url.searchParams.get('since') ?? '0');
      const to = url.searchParams.get('to');
      const messages = this.signals.filter((s) => s.at > since && (!s.to || !to || s.to === to));
      return Response.json({ messages, participants: [...this.participants.values()] });
    }

    if (request.method === 'POST' && action === 'chat') {
      const body = (await request.json().catch(() => ({}))) as { from?: string; name?: string; text?: string };
      if (!body?.text) return Response.json({ error: 'text_required' }, { status: 400 });
      this.chat.push({ from: body.from ?? 'guest', name: body.name ?? 'Guest', text: body.text, at: Date.now() });
      if (this.chat.length > 200) this.chat = this.chat.slice(-200);
      return Response.json({ ok: true });
    }

    if (request.method === 'GET' && action === 'chat') {
      return Response.json({ messages: this.chat });
    }

    return Response.json({ participants: [...this.participants.values()] });
  }
}
