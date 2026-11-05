// Cross-tab real-time event pipeline using BroadcastChannel API
const BROADCAST_CHANNEL_NAME = 'pulse_realtime_channel';

/**
 * Broadcast an event to all open browser tabs
 * @param {object} event - Event payload (e.g. { type: 'vote_cast', pollId, results })
 */
export function broadcastPulseEvent(event) {
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage({
        ...event,
        broadcastTime: Date.now(),
      });
      // Small timeout before closing to guarantee delivery
      setTimeout(() => {
        try {
          channel.close();
        } catch {}
      }, 500);
    }
  } catch (err) {
    console.debug('BroadcastChannel error:', err);
  }
}

/**
 * Subscribe to cross-tab pulse events
 * @param {function} handler - Callback invoked with event data
 * @returns {function} Unsubscribe cleanup function
 */
export function subscribePulseEvents(handler) {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return () => {};
  }
  const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  channel.onmessage = (messageEvent) => {
    if (messageEvent && messageEvent.data) {
      handler(messageEvent.data);
    }
  };
  return () => {
    try {
      channel.close();
    } catch {}
  };
}

export default {
  broadcastPulseEvent,
  subscribePulseEvents,
};

