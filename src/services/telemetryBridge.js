/**
 * VelocIQ Telemetry Bridge
 * Multi-transport:
 * 1. Vite HMR WebSocket relay (phone over LAN / Wi-Fi)
 * 2. BroadcastChannel (same-browser tabs <1ms)
 * 3. LocalStorage events (cross-window fallback)
 */

const CHANNEL_NAME = 'velociq_vehicle_control';

let _channel = null;
let _listeners = [];
let _feedbackListeners = [];
let _connectionStatus = 'disconnected'; // 'disconnected' | 'broadcast' | 'websocket'
let _latencyMs = 0;
let _statusListeners = [];
let _initialized = false;

function _notifyListeners(packet) {
  _listeners.forEach(fn => { try { fn(packet); } catch (e) { /* noop */ } });
}

function _notifyStatus(status, latency = 0) {
  _connectionStatus = status;
  _latencyMs = latency;
  _statusListeners.forEach(fn => { try { fn({ status, latency: _latencyMs }); } catch (e) { /* noop */ } });
}

function _notifyFeedback(packet) {
  _feedbackListeners.forEach(fn => { try { fn(packet); } catch (e) { /* noop */ } });
}

// ─── BroadcastChannel (same-browser tabs) ──────────────────────────────────
function _initBroadcastChannel() {
  if (typeof BroadcastChannel === 'undefined' || _channel) return;
  try {
    _channel = new BroadcastChannel(CHANNEL_NAME);
    _channel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'CONTROL') _notifyListeners(payload);
      if (type === 'FEEDBACK') _notifyFeedback(payload);
      if (type === 'PING') {
        _channel.postMessage({ type: 'PONG', ts: event.data.ts });
      }
      if (type === 'PONG') {
        const lat = Math.round(Date.now() - event.data.ts);
        _notifyStatus(_connectionStatus === 'websocket' ? 'websocket' : 'broadcast', lat);
      }
    };
  } catch (_) {}
}

function _sendViaBroadcast(packet) {
  if (!_channel) return false;
  try {
    _channel.postMessage({ type: 'CONTROL', payload: packet });
    return true;
  } catch { return false; }
}

function _sendFeedbackViaBroadcast(feedback) {
  if (!_channel) return;
  try {
    _channel.postMessage({ type: 'FEEDBACK', payload: feedback });
  } catch (_) {}
}

let _prodWS = null;

// ─── WebSocket Relay (Vite HMR in dev, native ws:// or wss:// in production) ──
function _initViteRelay() {
  if (typeof window === 'undefined') return;

  if (import.meta.hot) {
    _notifyStatus('websocket', 2);

    import.meta.hot.on('velociq:control', (data) => {
      _notifyListeners(data);
      _notifyStatus('websocket', 2);
    });

    import.meta.hot.on('velociq:feedback', (data) => {
      _notifyFeedback(data);
      _notifyStatus('websocket', 2);
    });
  } else {
    // Production Mode (Render / Docker / Node Server): Connect to backend /ws
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      _prodWS = new WebSocket(wsUrl);

      _prodWS.onopen = () => {
        _notifyStatus('websocket', 5);
      };

      _prodWS.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'CONTROL' || payload.event === 'velociq:control') {
            _notifyListeners(payload.data || payload.payload);
            _notifyStatus('websocket', 5);
          } else if (payload.type === 'FEEDBACK' || payload.event === 'velociq:feedback') {
            _notifyFeedback(payload.data || payload.payload);
            _notifyStatus('websocket', 5);
          }
        } catch (_) {}
      };

      _prodWS.onclose = () => {
        _prodWS = null;
        if (_channel) _notifyStatus('broadcast', 1);
        setTimeout(_initViteRelay, 3000);
      };

      _prodWS.onerror = () => {
        if (_channel) _notifyStatus('broadcast', 1);
      };
    } catch (_) {
      if (_channel) _notifyStatus('broadcast', 1);
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────

export function initBridge(role = 'vehicle') {
  if (_initialized) return;
  _initialized = true;

  _initBroadcastChannel();
  _initViteRelay();

  // Periodic keepalive / latency check
  setInterval(() => {
    if (_channel) {
      try {
        _channel.postMessage({ type: 'PING', ts: Date.now() });
      } catch (_) {}
    }
  }, 2000);
}

export function sendControl(packet) {
  let sentWS = false;
  if (import.meta.hot) {
    try {
      import.meta.hot.send('velociq:control', packet);
      sentWS = true;
    } catch (_) {}
  } else if (_prodWS && _prodWS.readyState === 1) { // 1 = OPEN
    try {
      _prodWS.send(JSON.stringify({ event: 'velociq:control', data: packet }));
      sentWS = true;
    } catch (_) {}
  }
  const sentBC = _sendViaBroadcast(packet);
  return sentWS || sentBC;
}

export function sendFeedback(feedback) {
  if (import.meta.hot) {
    try {
      import.meta.hot.send('velociq:feedback', feedback);
    } catch (_) {}
  } else if (_prodWS && _prodWS.readyState === 1) {
    try {
      _prodWS.send(JSON.stringify({ event: 'velociq:feedback', data: feedback }));
    } catch (_) {}
  }
  _sendFeedbackViaBroadcast(feedback);
}

export function onControlPacket(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(f => f !== fn); };
}

export function onFeedbackPacket(fn) {
  _feedbackListeners.push(fn);
  return () => { _feedbackListeners = _feedbackListeners.filter(f => f !== fn); };
}

export function onStatusChange(fn) {
  _statusListeners.push(fn);
  fn({ status: _connectionStatus, latency: _latencyMs });
  return () => { _statusListeners = _statusListeners.filter(f => f !== fn); };
}

export function getStatus() {
  return { status: _connectionStatus, latency: _latencyMs };
}

export function destroyBridge() {
  _channel?.close();
  _channel = null;
  _listeners = [];
  _feedbackListeners = [];
  _statusListeners = [];
  _initialized = false;
}
