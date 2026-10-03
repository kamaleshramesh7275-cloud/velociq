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
    <div className="relative inline-flex flex-col items-center justify-center select-none max-w-full">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto">
        <defs>
          {/* CNC Diamond Knurling Pattern */}
          <pattern id={`knurl-pat-${size}`} width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 0 2 L 2 0 L 4 2 L 2 4 Z" fill="none" stroke="#94A3B8" strokeWidth="0.65" opacity="0.75" />
          </pattern>

          {/* Luminous Titanium/Platinum Bezel Ring Gradient */}
          <linearGradient id={`bezel-grad-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={darkTheme ? '#334155' : '#FFFFFF'} />
            <stop offset="35%" stopColor={darkTheme ? '#1E293B' : '#E2E8F0'} />
            <stop offset="70%" stopColor={darkTheme ? '#0F172A' : '#CBD5E1'} />
            <stop offset="100%" stopColor={darkTheme ? '#1E293B' : '#94A3B8'} />
          </linearGradient>

          {/* Dial Face Ceramic Radial Gradient */}
          <radialGradient id={`dial-face-grad-${size}`} cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor={darkTheme ? '#0F172A' : '#FFFFFF'} />
            <stop offset="70%" stopColor={darkTheme ? '#0A0F1C' : '#F8FAFC'} />
            <stop offset="100%" stopColor={darkTheme ? '#050811' : '#EDF2F7'} />
          </radialGradient>

          {/* Precision CNC Hub Cap Gradient */}
          <radialGradient id={`hub-grad-${size}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#CBD5E1" />
            <stop offset="85%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#334155" />
          </radialGradient>

          {/* Sapphire Glass Top Specular Glare */}
          <linearGradient id={`dial-glare-${size}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Needle Shadow */}
          <filter id={`needle-shadow-${size}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="1.5" dy="2.5" stdDeviation="2.5" floodColor="#0F172A" floodOpacity={darkTheme ? "0.6" : "0.22"} />
          </filter>
        </defs>

        {/* Outer Sculpted Titanium Bezel Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={size / 2 - 2}
          fill="none"
          stroke={`url(#bezel-grad-${size})`}
          strokeWidth="4.5"
        />

        {/* Diamond Knurled Grip Texture Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={size / 2 - 3.5}
          fill="none"
          stroke={`url(#knurl-pat-${size})`}
          strokeWidth="3.5"
        />

        {/* Inner Chamfer Bezel Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={size / 2 - 5.5}
          fill="none"
          stroke={darkTheme ? '#1E293B' : '#E2E8F0'}
          strokeWidth="1.5"
        />

        {/* Inner Ceramic Dial Face */}
        <circle
          cx={cx}
          cy={cy}
          r={size / 2 - 6.5}
          fill={`url(#dial-face-grad-${size})`}
          stroke={bezelColor}
          strokeWidth="1"
        />

        {/* Concentric Precision Instrument Etch Lines */}
        <circle
          cx={cx}
          cy={cy}
          r={r - 4}
          fill="none"
          stroke={darkTheme ? 'rgba(255,255,255,0.08)' : '#CBD5E1'}
          strokeWidth="0.75"
          strokeDasharray="2 3"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r - 18}
          fill="none"
          stroke={darkTheme ? 'rgba(255,255,255,0.05)' : '#E2E8F0'}
          strokeWidth="0.75"
        />

        {/* Colored Arc Bands with Precision Glow */}
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
              strokeWidth="4.5"
              strokeOpacity={darkTheme ? '0.85' : '0.92'}
              strokeLinecap="round"
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
              strokeWidth={t.isMajor ? 2.2 : 1}
              strokeLinecap="round"
            />
            {t.isMajor && t.labelPos && (
              <text
                x={t.labelPos.x}
                y={t.labelPos.y + 3.5}
                textAnchor="middle"
                fontSize={size > 200 ? '10' : '8.5'}
                fontWeight="800"
                fontFamily="Rajdhani, sans-serif"
                fill={labelColor}
                letterSpacing="0.02em"
              >
                {t.val}
              </text>
            )}
          </g>
        ))}

        {/* Speed Limit Marker Flag */}
        {speedLimitMarker && (
          <g>
            <line
              x1={speedLimitMarker.p1.x}
              y1={speedLimitMarker.p1.y}
              x2={speedLimitMarker.p2.x}
              y2={speedLimitMarker.p2.y}
              stroke="#D7263D"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx={speedLimitMarker.p1.x} cy={speedLimitMarker.p1.y} r="2.5" fill="#D7263D" />
          </g>
        )}

        {/* Sapphire Glass Top Specular Glare Arc */}
        <path
          d={`M ${cx - r * 0.75} ${cy - r * 0.25} A ${r * 0.85} ${r * 0.65} 0 0 1 ${cx + r * 0.75} ${cy - r * 0.25} Z`}
          fill={`url(#dial-glare-${size})`}
          pointerEvents="none"
        />

        {/* Precision Needle with Hub Cap */}
        <g filter={`url(#needle-shadow-${size})`} className="transition-all duration-150 ease-out">
          {/* Needle Blade */}
          <polygon
            points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleTail.x},${needleTail.y} ${needleBase2.x},${needleBase2.y}`}
            fill={needleColor}
          />
          {/* Needle Center Illuminated Core */}
          <line
            x1={cx}
            y1={cy}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeOpacity="0.85"
            strokeLinecap="round"
          />
          {/* Metallic CNC Center Hub */}
          <circle cx={cx} cy={cy} r="11" fill={`url(#hub-grad-${size})`} stroke="#64748B" strokeWidth="1" />
          <circle cx={cx} cy={cy} r="8" fill="none" stroke="#CBD5E1" strokeWidth="0.75" />
          <circle cx={cx} cy={cy} r="3.5" fill="#0B3D91" />
          <circle cx={cx} cy={cy} r="1.5" fill="#FFFFFF" opacity="0.9" />
        </g>

        {/* Digital Readout Inset Window */}
        <g transform={`translate(${cx}, ${cy + r * 0.48})`}>
          <rect
            x="-38"
            y="-15"
            width="76"
            height="28"
            rx="6"
            fill={darkTheme ? '#050912' : '#FFFFFF'}
            stroke={darkTheme ? 'rgba(255,255,255,0.12)' : '#CBD5E1'}
            strokeWidth="1.2"
            filter="drop-shadow(0 2px 4px rgba(15,23,42,0.06))"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="800"
            fontSize="14.5"
            fill={darkTheme ? '#F8FAFC' : '#0F172A'}
            className="tabular-nums"
          >
            {typeof value === 'number' ? (value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toFixed(0)) : value}
          </text>
        </g>

        {/* Dial Unit & Semantic Label */}
        <text
          x={cx}
          y={cy + r * 0.76}
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="800"
          fontFamily="Rajdhani, sans-serif"
          letterSpacing="0.1em"
          fill={darkTheme ? '#94A3B8' : '#475569'}
        >
          {unit.toUpperCase()}
        </text>

        {/* Dial Semantic Title (Top Center) */}
        <text
          x={cx}
          y={cy - r * 0.44}
          textAnchor="middle"
          fontFamily="Rajdhani, sans-serif"
          fontWeight="800"
          fontSize="10.5"
          letterSpacing="0.22em"
          fill={darkTheme ? '#CBD5E1' : '#0B3D91'}
        >
          {label.toUpperCase()}
        </text>

        {/* Secondary Readout Pill if supplied */}
        {secondaryReadout && (
          <g transform={`translate(${cx}, ${cy - r * 0.26})`}>
            <rect
              x="-36"
              y="-8"
              width="72"
              height="16"
              rx="4"
              fill={darkTheme ? 'rgba(30,136,229,0.2)' : '#EFF6FF'}
              stroke={darkTheme ? 'rgba(30,136,229,0.4)' : '#BFDBFE'}
              strokeWidth="0.8"
            />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="800"
              fontFamily="Rajdhani, sans-serif"
              letterSpacing="0.08em"
              fill={darkTheme ? '#60A5FA' : '#1D4ED8'}
            >
              {secondaryReadout}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
