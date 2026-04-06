/**
 * Geo utility functions for coordinate math, distance, and polygon checks.
 */

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Polygon {
  coordinates: Coordinate[];
}

/**
 * Haversine distance between two points in meters.
 */
export function haversineDistance(p1: Coordinate, p2: Coordinate): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Ray-casting algorithm to determine if a point is inside a polygon.
 */
export function isPointInPolygon(point: Coordinate, polygon: Coordinate[]): boolean {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Calculate bearing between two points in degrees.
 */
export function calculateBearing(from: Coordinate, to: Coordinate): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Calculate speed in km/h between two timestamped points.
 */
export function calculateSpeed(
  p1: Coordinate,
  t1: Date,
  p2: Coordinate,
  t2: Date
): number {
  const distanceMeters = haversineDistance(p1, p2);
  const timeDiffSeconds = (t2.getTime() - t1.getTime()) / 1000;

  if (timeDiffSeconds <= 0) return 0;
  return (distanceMeters / timeDiffSeconds) * 3.6; // m/s to km/h
}

/**
 * Find minimum distance from a point to the nearest edge of a polygon in meters.
 */
export function distanceToPolygonEdge(point: Coordinate, polygon: Coordinate[]): number {
  let minDist = Infinity;

  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const dist = distanceToSegment(point, polygon[i], polygon[j]);
    if (dist < minDist) {
      minDist = dist;
    }
  }

  return minDist;
}

function distanceToSegment(p: Coordinate, a: Coordinate, b: Coordinate): number {
  const dx = b.lat - a.lat;
  const dy = b.lng - a.lng;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return haversineDistance(p, a);

  let t = ((p.lat - a.lat) * dx + (p.lng - a.lng) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const closest: Coordinate = {
    lat: a.lat + t * dx,
    lng: a.lng + t * dy,
  };

  return haversineDistance(p, closest);
}

/**
 * Calculate the centroid of a polygon.
 */
export function polygonCentroid(polygon: Coordinate[]): Coordinate {
  const n = polygon.length;
  const sum = polygon.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 }
  );
  return { lat: sum.lat / n, lng: sum.lng / n };
}
