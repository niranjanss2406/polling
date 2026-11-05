import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for poll-specific real-time WebSocket connection
 * @param {string} pollId - Unique ID of the poll
 * @param {function} onMessage - Callback for incoming messages
 */
export function useWebSocket(pollId, onMessage) {
  const [isConnected, setIsConnected] = useState(false);
  const [liveViewers, setLiveViewers] = useState(1);
  const [lastEvent, setLastEvent] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const onMessageRef = useRef(onMessage);

  // Keep latest onMessage ref to avoid unnecessary reconnects
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!pollId) return;

    // Build WS URL: Route through current host so Vite proxy handles /ws across LAN, localhost, and tunnels
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsBase = `${protocol}//${window.location.host}`;
    if (import.meta.env.VITE_WS_URL && !import.meta.env.DEV) {
      wsBase = import.meta.env.VITE_WS_URL;
    }
    wsBase = wsBase.replace(/\/$/, '');
    const wsUrl = `${wsBase}/ws/polls/${pollId}`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent(data);

          // Handle viewer count updates
          if (data.type === 'viewer_count' && typeof data.viewers === 'number') {
            setLiveViewers(data.viewers);
          }

          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket encountered error:', err);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        // Only reconnect if not closed cleanly intentionally
        if (event.code !== 1000) {
          const nextAttempt = reconnectAttemptsRef.current + 1;
          reconnectAttemptsRef.current = nextAttempt;
          // Exponential backoff up to 10s
          const delay = Math.min(1000 * Math.pow(1.5, nextAttempt), 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setIsConnected(false);
    }
  }, [pollId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted');
        socketRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      socketRef.current.send(payload);
    } else {
      console.warn('Cannot send message, WebSocket is not open');
    }
  }, []);

  return {
    isConnected,
    liveViewers,
    lastEvent,
    sendMessage,
  };
}

export default useWebSocket;

