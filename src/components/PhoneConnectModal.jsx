import React, { useState, useEffect } from 'react';
import { onStatusChange, initBridge } from '../services/telemetryBridge';

// Resolve the local IP from window.location for display in QR
function getLocalUrl(path = '/remote') {
  return `${window.location.protocol}//${window.location.hostname}:${window.location.port}${path}`;
}

// Tiny QR code via Google Charts API (no npm package needed)
function QRCodeImg({ url, size = 180 }) {
  const encoded = encodeURIComponent(url);
  const src = `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=${size}x${size}&color=00D4FF&bgcolor=0A0E15&margin=2`;
  return (
    <img
      src={src}
      alt="QR Code"
      style={{ width: size, height: size, borderRadius: 8, display: 'block' }}
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
}

export default function PhoneConnectModal({ onClose }) {
  const url = getLocalUrl('/remote');
  const [conn, setConn] = useState({ status: 'disconnected', latency: 0 });

  useEffect(() => {
    initBridge('vehicle');
    const unsub = onStatusChange(setConn);
    return unsub;
  }, []);

  const statusColor = conn.status === 'websocket' ? '#22C55E'
    : conn.status === 'broadcast' ? '#38BDF8'
    : '#EF4444';

  const statusLabel = conn.status === 'websocket' ? `● PHONE CONNECTED · ${conn.latency}ms`
    : conn.status === 'broadcast' ? `● SAME-DEVICE · ${conn.latency}ms`
    : '○ WAITING FOR CONTROLLER...';

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: 'linear-gradient(145deg, #111318 0%, #0F1218 100%)',
        border: '1px solid #1E232E',
        borderRadius: 20, padding: '24px 28px',
        width: '100%', maxWidth: 380,
        boxShadow: '0 0 60px #00D4FF18',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#00D4FF', letterSpacing: '0.05em' }}>
              📱 CONNECT PHONE CONTROLLER
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
              Scan QR on same Wi-Fi network
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#1A1E28', border: '1px solid #2D3340',
              color: '#9CA3AF', fontSize: 14, cursor: 'pointer',
            }}
          >✕</button>
        </div>

        {/* QR Code */}
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 16,
          background: '#0A0E15', borderRadius: 12, padding: 16,
          border: '1px solid #1E232E',
        }}>
          <QRCodeImg url={url} size={180} />
        </div>

        {/* URL */}
        <div style={{
          background: '#0A0E15', borderRadius: 10, padding: '10px 14px',
          fontFamily: 'monospace', fontSize: 12, color: '#00D4FF',
          wordBreak: 'break-all', border: '1px solid #1E232E', marginBottom: 14,
          userSelect: 'all',
        }}>
          {url}
        </div>

        {/* Connection status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#0A0E15', borderRadius: 10, padding: '10px 14px',
          border: `1px solid ${statusColor}44`,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: statusColor,
            boxShadow: `0 0 6px ${statusColor}`, flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, fontFamily: 'monospace' }}>
            {statusLabel}
          </span>
        </div>

        {/* Instructions */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 8, letterSpacing: '0.08em' }}>
            HOW TO CONNECT
          </div>
          {[
            '① Make sure your phone is on the same Wi-Fi as this computer',
            '② Point your phone camera at the QR code above',
            '③ Open the link — the phone cockpit opens immediately, no app needed',
            '④ Tap ENGINE START on your phone to begin driving',
          ].map((step, i) => (
            <div key={i} style={{
              fontSize: 11, color: '#9CA3AF', marginBottom: 6, lineHeight: 1.5,
            }}>{step}</div>
          ))}
        </div>

        {/* Desktop fallback note */}
        <div style={{
          marginTop: 14, padding: '8px 12px', borderRadius: 10,
          background: '#0A0E15', border: '1px solid #1E232E', fontSize: 10, color: '#6B7280',
        }}>
          💻 <strong style={{ color: '#9CA3AF' }}>Desktop fallback:</strong> Use <span style={{ color: '#00D4FF', fontFamily: 'monospace' }}>W A S D</span> + <span style={{ color: '#00D4FF', fontFamily: 'monospace' }}>Space</span> + <span style={{ color: '#00D4FF', fontFamily: 'monospace' }}>E</span> keys directly in the 3D World view.
        </div>
      </div>
    </div>
  );
}
