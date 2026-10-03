/**
 * VelocIQ Telemetry Bridge
 * Dual-transport: BroadcastChannel (same-device <1ms) + WebSocket relay (phone over LAN)
 * Automatically selects the best available transport.
 */

const CHANNEL_NAME = 'velociq_vehicle_control';
const WS_RECONNECT_MS = 2000;

let _channel = null;
let _ws = null;
let _listeners = [];
let _feedbackListeners = [];
let _connectionStatus = 'disconnected'; // 'disconnected' | 'broadcast' | 'websocket'
let _wsReconnectTimer = null;
let _latencyMs = 0;
let _lastPingTime = 0;
let _statusListeners = [];

// ─── Internal helpers ─────────────────────────────────────────────────────────

function _notifyListeners(packet) {
  _listeners.forEach(fn => { try { fn(packet); } catch (e) { /* noop */ } });
}

function _notifyStatus(status, latency) {
  _connectionStatus = status;
  if (latency !== undefined) _latencyMs = latency;
  _statusListeners.forEach(fn => { try { fn({ status, latency: _latencyMs }); } catch (e) { /* noop */ } });
}

function _notifyFeedback(packet) {
  _feedbackListeners.forEach(fn => { try { fn(packet); } catch (e) { /* noop */ } });
}

// ─── BroadcastChannel (same-browser, desktop fallback) ────────────────────────

function _initBroadcastChannel() {
  if (typeof BroadcastChannel === 'undefined') return;
  _channel = new BroadcastChannel(CHANNEL_NAME);
  _channel.onmessage = (event) => {
    const { type, payload } = event.data || {};
    if (type === 'CONTROL') _notifyListeners(payload);
    if (type === 'FEEDBACK_REQUEST') _sendFeedbackViaBroadcast(event.data.feedback);
    if (type === 'PING') {
      // Send pong back
      _channel.postMessage({ type: 'PONG', ts: event.data.ts });
    }
    if (type === 'PONG') {
      _latencyMs = Math.round(Date.now() - event.data.ts);
      _notifyStatus('broadcast', _latencyMs);
    }
  };
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
  _channel.postMessage({ type: 'FEEDBACK', payload: feedback });
}

function _pingBroadcast() {
  if (!_channel) return;
  _channel.postMessage({ type: 'PING', ts: Date.now() });
}

// ─── WebSocket (phone over LAN) ───────────────────────────────────────────────

function _initWebSocket() {
  if (typeof WebSocket === 'undefined') return;
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const wsUrl = `${proto}://${location.host}/ws/vehicle-control`;

  try {
    _ws = new WebSocket(wsUrl);
  } catch { return; }

  _ws.onopen = () => {
    _notifyStatus('websocket', 0);
    // Start ping loop
    _lastPingTime = Date.now();
    _ws.send(JSON.stringify({ type: 'PING', ts: Date.now() }));
  };

  _ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'CONTROL') _notifyListeners(msg.payload);
      if (msg.type === 'PONG') {
        _latencyMs = Math.round(Date.now() - msg.ts);
        _notifyStatus('websocket', _latencyMs);
      }
      if (msg.type === 'FEEDBACK') _notifyFeedback(msg.payload);
    } catch { /* noop */ }
  };

  _ws.onclose = () => {
    _ws = null;
    _notifyStatus('disconnected', undefined);
    // Retry connection
    _wsReconnectTimer = setTimeout(_initWebSocket, WS_RECONNECT_MS);
  };

  _ws.onerror = () => {
    _ws?.close();
  };
}

function _sendViaWS(packet) {
  if (!_ws || _ws.readyState !== WebSocket.OPEN) return false;
  try {
    _ws.send(JSON.stringify({ type: 'CONTROL', payload: packet }));
    return true;
  } catch { return false; }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialize the bridge. Call once from App.jsx / RemoteControllerPage.
 * @param {'controller' | 'vehicle'} role - 'controller' = phone side, 'vehicle' = desktop side
 */
export function initBridge(role = 'vehicle') {
  _initBroadcastChannel();
  if (role === 'vehicle') {
    _initWebSocket();
    // Ping broadcast every 2s to measure latency
    setInterval(_pingBroadcast, 2000);
  }
}

/**
 * Send a control packet from phone -> desktop
 * @param {Object} packet - e.g. { throttle, brake, steer, gear, engineOn, driveMode, ... }
 */
export function sendControl(packet) {
  if (_sendViaWS(packet)) return;
  if (_sendViaBroadcast(packet)) return;
}

/**
 * Send telemetry feedback from desktop -> phone (speed, RPM, etc.)
 */
export function sendFeedback(feedback) {
  if (_ws && _ws.readyState === WebSocket.OPEN) {
    _ws.send(JSON.stringify({ type: 'FEEDBACK', payload: feedback }));
    return;
  }
  if (_channel) {
    _channel.postMessage({ type: 'FEEDBACK', payload: feedback });
  }
}

/**
 * Register a listener for incoming control packets (desktop side)
 */
export function onControlPacket(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(f => f !== fn); };
}

/**
 * Register a listener for feedback packets (phone side)
 */
export function onFeedbackPacket(fn) {
  _feedbackListeners.push(fn);
  return () => { _feedbackListeners = _feedbackListeners.filter(f => f !== fn); };
}

/**
 * Register a listener for connection status changes
 */
export function onStatusChange(fn) {
  _statusListeners.push(fn);
  // Fire immediately with current state
  fn({ status: _connectionStatus, latency: _latencyMs });
  return () => { _statusListeners = _statusListeners.filter(f => f !== fn); };
}

export function getStatus() {
  return { status: _connectionStatus, latency: _latencyMs };
}

export function destroyBridge() {
  _channel?.close();
  _ws?.close();
  clearTimeout(_wsReconnectTimer);
  _listeners = [];
  _feedbackListeners = [];
  _statusListeners = [];
}
