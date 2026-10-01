import React, { useMemo } from 'react';

/**
 * Authentic Automotive Analog Dial with 270° Sweep Geometry
 * Features:
 * - 270-degree true sweep
 * - Major & minor radial ticks with numeric labels
 * - Colored semantic arc zones (Sweet spot, Cruise, Caution, Redline)
 * - Tapered needle with brushed-metal central hub cap
 * - Inset digital readout
 */
export function AnalogDial({
  value = 0,
  min = 0,
  max = 140,
  label = 'SPEED',
  unit = 'km/h',
  speedLimit = null,
  majorStep = 20,
  minorStep = 5,
  size = 240,
  darkTheme = false, // true for instrument cluster, false for white cards
  bands = [
    { from: 0, to: 55, color: '#0B3D91' },     // Blue
    { from: 55, to: 65, color: '#0F9D6B' },   // Green sweet spot
    { from: 65, to: 90, color: '#1E88E5' },   // Sky blue
    { from: 90, to: 110, color: '#F2A900' },  // Amber warning
    { from: 110, to: 140, color: '#D7263D' }, // Redline
  ],
  secondaryReadout = null,
}) {
  const clampedVal = Math.min(max, Math.max(min, value));
  const pct = (clampedVal - min) / (max - min);

  // 270-degree sweep: from 135° (bottom left) to 405° (bottom right)
  const startAngle = 135;
  const sweepAngle = 270;
  const currentAngle = startAngle + pct * sweepAngle;

  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) - 18;

  // Polar to cartesian
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x, y, radius, startAng, endAng) => {
    const start = polarToCartesian(x, y, radius, endAng);
    const end = polarToCartesian(x, y, radius, startAng);
    const largeArcFlag = endAng - startAng <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // Generate tick marks
  const ticks = useMemo(() => {
    const list = [];
    const totalTicks = Math.round((max - min) / minorStep);
    for (let i = 0; i <= totalTicks; i++) {
      const val = min + i * minorStep;
      const isMajor = val % majorStep === 0;
      const angle = startAngle + ((val - min) / (max - min)) * sweepAngle;
      const tickOuterR = r - 2;
      const tickInnerR = isMajor ? r - 12 : r - 7;
      const p1 = polarToCartesian(cx, cy, tickOuterR, angle);
      const p2 = polarToCartesian(cx, cy, tickInnerR, angle);
      const labelPos = isMajor ? polarToCartesian(cx, cy, r - 22, angle) : null;

      list.push({
        val,
        isMajor,
        p1,
        p2,
        labelPos,
        angle,
      });
    }
    return list;
  }, [min, max, majorStep, minorStep, r, cx, cy]);

  // Speed limit marker
  const speedLimitMarker = useMemo(() => {
    if (!speedLimit || speedLimit < min || speedLimit > max) return null;
    const ang = startAngle + ((speedLimit - min) / (max - min)) * sweepAngle;
    const p1 = polarToCartesian(cx, cy, r + 4, ang);
    const p2 = polarToCartesian(cx, cy, r - 14, ang);
    return { p1, p2 };
  }, [speedLimit, min, max, r, cx, cy]);

  // Colors based on darkTheme
  const dialBg = darkTheme ? '#0A0F1C' : '#FFFFFF';
  const tickColor = darkTheme ? 'rgba(255, 255, 255, 0.5)' : '#475569';
  const majorTickColor = darkTheme ? '#F8FAFC' : '#0F172A';
  const labelColor = darkTheme ? '#F1F5F9' : '#0F172A';
  const bezelColor = darkTheme ? '#1E293B' : '#CBD5E1';
  const needleColor = '#D7263D'; // Classic red needle

  // Needle tip
  const needleLen = r - 16;
  const needleTip = polarToCartesian(cx, cy, needleLen, currentAngle);
  const needleBase1 = polarToCartesian(cx, cy, 10, currentAngle + 90);
  const needleBase2 = polarToCartesian(cx, cy, 10, currentAngle - 90);
  const needleTail = polarToCartesian(cx, cy, 14, currentAngle + 180);

  return (
    <div className="relative inline-flex flex-col items-center justify-center select-none">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {/* Bezel Ring Gradient */}
          <linearGradient id={`bezel-grad-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={darkTheme ? '#334155' : '#F8FAFC'} />
            <stop offset="50%" stopColor={darkTheme ? '#0F172A' : '#CBD5E1'} />
            <stop offset="100%" stopColor={darkTheme ? '#1E293B' : '#94A3B8'} />
          </linearGradient>

          {/* Hub Cap Gradient */}
          <radialGradient id={`hub-grad-${size}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#CBD5E1" />
            <stop offset="90%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </radialGradient>

          {/* Needle Shadow */}
          <filter id={`needle-shadow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Outer Chrome Bezel Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={size / 2 - 2}
          fill="none"
          stroke={`url(#bezel-grad-${size})`}
          strokeWidth="3.5"
        />

        {/* Inner Dial Face */}
        <circle
          cx={cx}
          cy={cy}
          r={size / 2 - 5}
          fill={dialBg}
          stroke={bezelColor}
          strokeWidth="1"
        />

        {/* Colored Arc Bands */}
        {bands.map((b, idx) => {
          const bStartP = (Math.max(min, b.from) - min) / (max - min);
          const bEndP = (Math.min(max, b.to) - min) / (max - min);
          const bStartA = startAngle + bStartP * sweepAngle;
          const bEndA = startAngle + bEndP * sweepAngle;
          return (
            <path
              key={idx}
              d={describeArc(cx, cy, r - 3, bStartA, bEndA)}
              fill="none"
              stroke={b.color}
              strokeWidth="4"
              strokeOpacity={darkTheme ? '0.75' : '0.85'}
              strokeLinecap="butt"
            />
          );
        })}

        {/* Tick Marks & Numeric Labels */}
        {ticks.map((t, idx) => (
          <g key={idx}>
            <line
              x1={t.p1.x}
              y1={t.p1.y}
              x2={t.p2.x}
              y2={t.p2.y}
              stroke={t.isMajor ? majorTickColor : tickColor}
              strokeWidth={t.isMajor ? 2 : 1}
              strokeLinecap="round"
            />
            {t.isMajor && t.labelPos && (
              <text
                x={t.labelPos.x}
                y={t.labelPos.y + 3.5}
                textAnchor="middle"
                fontSize={size > 200 ? '9.5' : '8'}
                fontWeight="700"
                fontFamily="Rajdhani, sans-serif"
                fill={labelColor}
              >
                {t.val}
              </text>
            )}
          </g>
        ))}

        {/* Speed Limit Marker Flag */}
        {speedLimitMarker && (
          <line
            x1={speedLimitMarker.p1.x}
            y1={speedLimitMarker.p1.y}
            x2={speedLimitMarker.p2.x}
            y2={speedLimitMarker.p2.y}
            stroke="#D7263D"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* Precision Needle with Hub Cap */}
        <g filter={`url(#needle-shadow-${size})`} className="transition-all duration-200 ease-out">
          {/* Needle Blade */}
          <polygon
            points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleTail.x},${needleTail.y} ${needleBase2.x},${needleBase2.y}`}
            fill={needleColor}
          />
          {/* Needle Spine Accent */}
          <line
            x1={cx}
            y1={cy}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeOpacity="0.7"
          />
          {/* Metallic Hub Cap */}
          <circle cx={cx} cy={cy} r="10" fill={`url(#hub-grad-${size})`} stroke="#475569" strokeWidth="1" />
          <circle cx={cx} cy={cy} r="3" fill="#1E293B" />
        </g>

        {/* Digital Readout Inset Window */}
        <g transform={`translate(${cx}, ${cy + r * 0.48})`}>
          <rect
            x="-36"
            y="-14"
            width="72"
            height="26"
            rx="4"
            fill={darkTheme ? '#050912' : '#F1F5F9'}
            stroke={darkTheme ? 'rgba(255,255,255,0.1)' : '#CBD5E1'}
            strokeWidth="1"
          />
          <text
            x="0"
            y="2"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="700"
            fontSize="14"
            fill={darkTheme ? '#F8FAFC' : '#0F172A'}
            className="tabular-nums"
          >
            {typeof value === 'number' ? (value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toFixed(0)) : value}
          </text>
          <text
            x="0"
            y="9"
            textAnchor="middle"
            fontFamily="Rajdhani, sans-serif"
            fontWeight="700"
            fontSize="7"
            fill={darkTheme ? '#94A3B8' : '#0B3D91'}
            letterSpacing="0.1em"
          >
            {unit.toUpperCase()}
          </text>
        </g>

        {/* Label text at top */}
        <text
          x={cx}
          y={cy - r * 0.44}
          textAnchor="middle"
          fontFamily="Rajdhani, sans-serif"
          fontWeight="700"
          fontSize="10"
          letterSpacing="0.2em"
          fill={darkTheme ? '#CBD5E1' : '#0B3D91'}
        >
          {label.toUpperCase()}
        </text>

        {secondaryReadout && (
          <text
            x={cx}
            y={cy - r * 0.28}
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="600"
            fontSize="9"
            fill="#0F9D6B"
          >
            {secondaryReadout}
          </text>
        )}
      </svg>
    </div>
  );
}
