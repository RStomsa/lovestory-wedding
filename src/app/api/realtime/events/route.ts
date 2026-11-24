import { NextRequest } from 'next/server';
import { addSubscriber, removeSubscriber } from '@/lib/realtimeSync';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId') || `client_${Math.random().toString(36).slice(2, 10)}`;
  const source = (searchParams.get('source') as 'web' | 'desktop') || 'web';

  let heartbeatInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      addSubscriber(clientId, controller, source);

      // Heartbeat ping every 15 seconds to keep connection open across reverse proxies
      const encoder = new TextEncoder();
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: ${Date.now()}\n\n`));
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          removeSubscriber(clientId);
        }
      }, 15000);
    },
    cancel() {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      removeSubscriber(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable proxy buffering for Nginx
    },
  });
}
