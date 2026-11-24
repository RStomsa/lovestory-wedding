/**
 * LoveStory Realtime Sync Engine (Web <-> Desktop App)
 * Provides Server-Sent Events (SSE) broadcast bus, element-level merging,
 * and optimistic locking across Web and Desktop Tauri clients.
 */

export interface SyncPayload {
  source: 'web' | 'desktop';
  clientId: string;
  entityType: 'template' | 'graphic' | 'block' | 'shape';
  action: 'create' | 'update' | 'delete';
  id: string;
  data: any;
  timestamp: number;
  version?: number;
}

interface Subscriber {
  id: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
  source: 'web' | 'desktop';
}

// Global singleton to survive Next.js module reloads in dev mode
const globalForSync = globalThis as unknown as {
  lovestorySubscribers?: Map<string, Subscriber>;
};

if (!globalForSync.lovestorySubscribers) {
  globalForSync.lovestorySubscribers = new Map();
}

const subscribers = globalForSync.lovestorySubscribers;

export function addSubscriber(
  id: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  source: 'web' | 'desktop' = 'web'
): void {
  subscribers.set(id, { id, controller, source });
  // Send initial connection ACK
  try {
    const encoder = new TextEncoder();
    const ackMessage = `event: connected\ndata: ${JSON.stringify({
      status: 'connected',
      clientId: id,
      subscribersCount: subscribers.size,
      timestamp: Date.now(),
    })}\n\n`;
    controller.enqueue(encoder.encode(ackMessage));
  } catch (err) {
    console.error('Failed to send connect ACK to subscriber:', err);
  }
}

export function removeSubscriber(id: string): void {
  subscribers.delete(id);
}

export function getSubscriberCount(): number {
  return subscribers.size;
}

export function broadcastSyncEvent(payload: SyncPayload): void {
  const encoder = new TextEncoder();
  const eventMessage = `event: sync\ndata: ${JSON.stringify(payload)}\n\n`;
  const encoded = encoder.encode(eventMessage);

  const staleSubscribers: string[] = [];

  subscribers.forEach((sub, subId) => {
    // Avoid echoing back to the exact same client instance that sent the update
    if (subId === payload.clientId) return;

    try {
      sub.controller.enqueue(encoded);
    } catch {
      // Stream closed or broken connection
      staleSubscribers.push(subId);
    }
  });

  // Cleanup broken connections
  for (const deadId of staleSubscribers) {
    subscribers.delete(deadId);
  }
}

/**
 * Intelligent Element-Level Merge:
 * Prevents full overwrite collisions when both Web and Desktop edit different
 * elements of the same wedding invitation simultaneously.
 */
export function mergeTemplateElements(
  baseElements: any[] = [],
  incomingElements: any[] = []
): any[] {
  if (!incomingElements || incomingElements.length === 0) return baseElements;
  if (!baseElements || baseElements.length === 0) return incomingElements;

  const incomingMap = new Map<string, any>();
  for (const elem of incomingElements) {
    if (elem && elem.id) {
      incomingMap.set(elem.id, elem);
    }
  }

  const merged: any[] = [];
  const processedIncomingIds = new Set<string>();

  for (const baseElem of baseElements) {
    const incomingElem = incomingMap.get(baseElem.id);
    if (incomingElem) {
      // Element exists in both: merge fields with incoming priority
      merged.push({
        ...baseElem,
        ...incomingElem,
      });
      processedIncomingIds.add(baseElem.id);
    } else {
      // Element exists in base, keep it unless explicitly removed
      merged.push(baseElem);
    }
  }

  // Add brand-new elements created in incoming
  for (const incomingElem of incomingElements) {
    if (incomingElem && incomingElem.id && !processedIncomingIds.has(incomingElem.id)) {
      merged.push(incomingElem);
    }
  }

  return merged;
}
