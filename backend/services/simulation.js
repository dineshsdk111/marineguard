const Vessel = require('../models/Vessel');
const FishingZone = require('../models/FishingZone');
const Violation = require('../models/Violation');
const Notification = require('../models/Notification');

let simulationInterval = null;

const BASE_ZONES = [
  { name: 'Coastal Zone Alpha', type: 'permitted', coordinates: [[72.8, 19.0], [72.9, 19.0], [72.9, 18.9], [72.8, 18.9]] },
  { name: 'Deep Sea Zone Beta', type: 'permitted', coordinates: [[73.0, 19.2], [73.2, 19.2], [73.2, 19.0], [73.0, 19.0]] },
  { name: 'Coral Reef Protected Area', type: 'protected', coordinates: [[72.85, 18.95], [72.88, 18.95], [72.88, 18.92], [72.85, 18.92]] },
  { name: 'Mangrove Reserve Zone', type: 'restricted', coordinates: [[72.75, 18.88], [72.78, 18.88], [72.78, 18.85], [72.75, 18.85]] },
  { name: 'Shipping Lane Restricted', type: 'restricted', coordinates: [[73.05, 18.95], [73.1, 18.95], [73.1, 18.92], [73.05, 18.92]] },
];

function isInZone(lng, lat, zone) {
  const coords = zone.coordinates;
  let inside = false;
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const xi = coords[i][0], yi = coords[i][1];
    const xj = coords[j][0], yj = coords[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > point[1]) !== (yj > point[1])) && (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function randomOffset(base, range) {
  return base + (Math.random() - 0.5) * range;
}

async function simulateMovement(io) {
  try {
    const vessels = await Vessel.find({ status: { $in: ['at_sea', 'fishing', 'active', 'returning'] } });
    const zones = await FishingZone.find({ isActive: true });
    
    for (const vessel of vessels) {
      const lat = vessel.location.coordinates[1];
      const lng = vessel.location.coordinates[0];
      const speed = 0.001 + Math.random() * 0.003;
      const angle = Math.random() * Math.PI * 2;
      const newLng = lng + Math.cos(angle) * speed;
      const newLat = lat + Math.sin(angle) * speed;
      const newSpeed = 2 + Math.random() * 8;
      const newHeading = (angle * 180 / Math.PI + 360) % 360;

      await Vessel.findByIdAndUpdate(vessel._id, {
        location: { type: 'Point', coordinates: [newLng, newLat] },
        speed: parseFloat(newSpeed.toFixed(1)),
        heading: parseFloat(newHeading.toFixed(1)),
        lastUpdated: new Date()
      });

      for (const zone of zones) {
        if (zone.type === 'restricted' || zone.type === 'protected') {
          if (pointInPolygon([newLng, newLat], zone.coordinates)) {
            const existingViolation = await Violation.findOne({
              vessel: vessel._id,
              zone: zone._id,
              status: { $in: ['detected', 'acknowledged'] }
            });
            if (!existingViolation) {
              const violation = await Violation.create({
                vessel: vessel._id,
                fisherman: vessel.fisherman,
                type: 'zone_violation',
                description: `Vessel ${vessel.name} entered ${zone.type} zone: ${zone.name}`,
                zone: zone._id,
                location: { type: 'Point', coordinates: [newLng, newLat] },
                severity: zone.type === 'protected' ? 'high' : 'medium'
              });
              io.to('tracking_room').emit('violation_detected', { vessel: vessel.name, zone: zone.name, type: zone.type });
            }
          }
        }
      }

      io.to('tracking_room').emit('vessel_location_update', {
        _id: vessel._id,
        vesselId: vessel.vesselId,
        name: vessel.name,
        location: { type: 'Point', coordinates: [newLng, newLat] },
        speed: newSpeed,
        heading: newHeading,
        status: vessel.status,
        lastUpdated: new Date()
      });
    }
  } catch (error) {
    console.error('Simulation error:', error.message);
  }
}

function startSimulation(io) {
  if (simulationInterval) clearInterval(simulationInterval);
  simulationInterval = setInterval(() => simulateMovement(io), 5000);
  console.log('Vessel simulation started (5s interval)');
}

function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('Vessel simulation stopped');
  }
}

module.exports = { startSimulation, stopSimulation, BASE_ZONES };
