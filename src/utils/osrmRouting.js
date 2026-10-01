/**
 * osrmRouting.js
 * 
 * Real-road navigation engine utilizing OSRM (Open Source Routing Machine)
 * for turn-by-turn road snapping, route polyline geometry, heading bearing calculation,
 * and high-fidelity fallback expressway geometry between Fleet Hub and Cargo Terminal.
 */

// Fallback high-fidelity real expressway road coordinates (Delhi Connaught Place -> IGI Airport via Sardar Patel Marg & NH48)
export const DEFAULT_ROAD_COORDINATES = [
  [28.6315, 77.2167], // Connaught Place (Fleet Hub)
  [28.6288, 77.2120],
  [28.6250, 77.2065],
  [28.6210, 77.2015], // Gole Market
  [28.6185, 77.1980],
  [28.6142, 77.1950], // Shankar Road
  [28.6080, 77.1915],
  [28.6025, 77.1870], // Vande Mataram Marg
  [28.5980, 77.1820],
  [28.5935, 77.1765],
  [28.5900, 77.1710], // Dhaula Kuan Flyover interchange
  [28.5870, 77.1655],
  [28.5835, 77.1590], // Ring Road merging NH48
  [28.5805, 77.1530],
  [28.5770, 77.1465],
  [28.5735, 77.1400], // Delhi Cantt / Subroto Park
  [28.5700, 77.1335],
  [28.5670, 77.1275],
  [28.5640, 77.1210], // Mahipalpur Flyover entry
  [28.5615, 77.1150],
  [28.5590, 77.1090], // Aerocity approach
  [28.5575, 77.1040],
  [28.5562, 77.1000]  // Airport Cargo Terminal
];

// Pre-defined road maneuver steps along the default route
export const DEFAULT_MANEUVERS = [
  { atProgress: 0, instruction: 'Depart Fleet Hub onto Radial Road 2', type: 'straight', street: 'Radial Rd 2', distMeters: 850 },
  { atProgress: 12, instruction: 'Turn left onto Shankar Road', type: 'turn-left', street: 'Shankar Rd', distMeters: 1400 },
  { atProgress: 28, instruction: 'Keep right onto Vande Mataram Marg', type: 'fork-right', street: 'Vande Mataram Marg', distMeters: 2800 },
  { atProgress: 48, instruction: 'Take Dhaula Kuan flyover ramp toward NH 48', type: 'ramp-right', street: 'Dhaula Kuan Interchange', distMeters: 900 },
  { atProgress: 60, instruction: 'Merge onto NH 48 (Delhi-Gurgaon Expressway)', type: 'merge', street: 'NH 48 Expressway', distMeters: 6200 },
  { atProgress: 84, instruction: 'Take exit toward Airport Cargo Road / Aerocity', type: 'exit-left', street: 'Airport Cargo Access Rd', distMeters: 1200 },
  { atProgress: 98, instruction: 'Arrive at Airport Cargo Terminal', type: 'destination', street: 'Terminal Gateway', distMeters: 200 }
];

/**
 * Calculates geographic bearing angle (0 - 360 degrees) between two lat/lon coordinates
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;

  const phi1 = lat1 * toRad;
  const phi2 = lat2 * toRad;
  const deltaLambda = (lon2 - lon1) * toRad;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  const bearing = (theta * toDeg + 360) % 360;

  return Math.round(bearing);
}

/**
 * Given route coordinates and a trip progress percentage (0 - 100%),
 * finds the interpolated current coordinate, road segment index, and instantaneous heading bearing.
 */
export function interpolateRoadPosition(roadCoords = DEFAULT_ROAD_COORDINATES, progress = 0) {
  if (!roadCoords || roadCoords.length === 0) {
    return { lat: 28.6139, lon: 77.2090, heading: 0, segmentIndex: 0 };
  }

  const clampedProgress = Math.max(0, Math.min(100, progress));
  const totalSegments = roadCoords.length - 1;
  const floatIndex = (clampedProgress / 100) * totalSegments;
  const segmentIndex = Math.min(totalSegments - 1, Math.floor(floatIndex));
  const segmentFraction = floatIndex - segmentIndex;

  const [lat1, lon1] = roadCoords[segmentIndex];
  const [lat2, lon2] = roadCoords[segmentIndex + 1] || roadCoords[segmentIndex];

  // Linear interpolation along road segment
  const currentLat = lat1 + (lat2 - lat1) * segmentFraction;
  const currentLon = lon1 + (lon2 - lon1) * segmentFraction;

  const heading = calculateBearing(lat1, lon1, lat2, lon2);

  // Find next upcoming maneuver
  const nextManeuver = DEFAULT_MANEUVERS.find(m => m.atProgress >= clampedProgress) || DEFAULT_MANEUVERS[DEFAULT_MANEUVERS.length - 1];

  return {
    lat: currentLat,
    lon: currentLon,
    heading,
    segmentIndex,
    nextManeuver
  };
}

/**
 * Asynchronously attempts to fetch live real-road routing geometry from public OSRM server
 */
export async function fetchLiveOsrmRoute(startCoord, endCoord) {
  try {
    const [startLat, startLon] = startCoord;
    const [endLat, endLon] = endCoord;

    const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    
    if (!res.ok) throw new Error(`OSRM request failed with HTTP ${res.status}`);

    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const geoCoords = data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      const distanceKm = Math.round((data.routes[0].distance / 1000) * 10) / 10;
      const durationMin = Math.round((data.routes[0].duration / 60) * 10) / 10;

      return {
        success: true,
        coordinates: geoCoords,
        distanceKm,
        durationMin
      };
    }
  } catch (err) {
    // Graceful fallback to pre-computed highway geometry
    console.warn('OSRM live network fetch bypassed; using calibrated local highway geometry:', err.message);
  }

  return {
    success: false,
    coordinates: DEFAULT_ROAD_COORDINATES,
    distanceKm: 24.8,
    durationMin: 28.5
  };
}
