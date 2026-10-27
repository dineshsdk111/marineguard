const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');

const User = require('../models/User');
const Vessel = require('../models/Vessel');
const CatchRecord = require('../models/CatchRecord');
const FuelRecord = require('../models/FuelRecord');
const WeatherAlert = require('../models/WeatherAlert');
const Violation = require('../models/Violation');
const ComplianceRecord = require('../models/ComplianceRecord');
const FishingZone = require('../models/FishingZone');
const FishingTrip = require('../models/FishingTrip');

async function seedDatabase() {
  try {
    await connectDB();
    console.log('Clearing old data (if any)...');

    // Create Admin if not existing
    let admin = await User.findOne({ email: 'admin@marineguard.gov.in' });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@marineguard.gov.in',
        password: 'MarineGuard@2024',
        role: 'marine_authority',
        phone: '+91-11-23456789',
        organization: 'Directorate of Fisheries, Government of India',
        designation: 'System Administrator',
        employeeId: 'MG-ADMIN-001',
        district: 'New Delhi',
        state: 'Delhi',
        isActive: true,
        isApproved: true,
      });
      console.log('Created Admin account');
    }

    // Create Demo Fisherman if not existing
    let fisherman = await User.findOne({ email: 'fisherman@marineguard.gov.in' });
    if (!fisherman) {
      fisherman = await User.create({
        name: 'Rajesh Kumar',
        email: 'fisherman@marineguard.gov.in',
        password: 'Fisherman@2024',
        role: 'fisherman',
        phone: '+91-9876543210',
        organization: 'Mumbai Fishermen Co-op Society',
        designation: 'Senior Captain',
        employeeId: 'FISH-MUM-042',
        district: 'Mumbai Suburban',
        state: 'Maharashtra',
        isActive: true,
        isApproved: true,
      });
      console.log('Created Demo Fisherman account');
    }

    // Create Demo Cooperative Admin if not existing
    let coopAdmin = await User.findOne({ email: 'coop@marineguard.gov.in' });
    if (!coopAdmin) {
      coopAdmin = await User.create({
        name: 'Suresh Patil',
        email: 'coop@marineguard.gov.in',
        password: 'CoopAdmin@2024',
        role: 'cooperative_admin',
        phone: '+91-9812345678',
        organization: 'Maharashtra Fishery Cooperative Federation',
        designation: 'Cooperative Director',
        employeeId: 'COOP-MH-101',
        district: 'Mumbai',
        state: 'Maharashtra',
        isActive: true,
        isApproved: true,
      });
      console.log('Created Demo Cooperative Admin account');
    }

    // Seed Fishing Zones
    if (await FishingZone.countDocuments() === 0) {
      await FishingZone.create([
        {
          name: 'North Arabian Sea Permitted Zone',
          type: 'permitted',
          description: 'Authorized fishing zone for commercial trawlers and longliners.',
          coordinates: [[72.60, 18.80], [72.60, 19.20], [73.10, 19.20], [73.10, 18.80]],
          maxCatchLimit: 15000,
          speciesAllowed: ['Kingfish', 'Pomfret', 'Mackerel', 'Tuna', 'Shrimp'],
          color: '#22C55E'
        },
        {
          name: 'Coastal Restricted Conservation Area',
          type: 'restricted',
          description: 'Restricted fishing zone to protect juvenile marine life breeding grounds.',
          coordinates: [[72.75, 18.90], [72.75, 19.05], [72.85, 19.05], [72.85, 18.90]],
          maxCatchLimit: 2000,
          speciesAllowed: ['Mackerel', 'Shrimp'],
          color: '#F59E0B'
        },
        {
          name: 'Marine Sanctuary No-Take Zone',
          type: 'protected',
          description: 'Strictly prohibited zone for all motorized fishing activities.',
          coordinates: [[72.50, 18.70], [72.50, 18.85], [72.65, 18.85], [72.65, 18.70]],
          maxCatchLimit: 0,
          speciesAllowed: [],
          color: '#EF4444'
        }
      ]);
      console.log('Seeded Fishing Zones');
    }

    // Seed Vessels
    if (await Vessel.countDocuments() === 0) {
      const vesselsData = [
        {
          vesselId: 'IND-MH-01-1001',
          name: 'Sagar Kanya',
          owner: fisherman._id,
          fisherman: fisherman._id,
          type: 'trawler',
          length: 18.5,
          capacity: 25,
          registrationNumber: 'IND-MH-01-2023-88',
          registrationExpiry: new Date('2028-12-31'),
          fishingPermit: true,
          permitExpiry: new Date('2027-06-30'),
          safetyEquipment: { lifeJackets: true, fireExtinguisher: true, firstAidKit: true, radio: true, gps: true },
          fuelCapacity: 800,
          currentFuel: 650,
          status: 'fishing',
          location: { type: 'Point', coordinates: [72.82, 18.96] },
          speed: 8.5,
          heading: 140,
          isActive: true
        },
        {
          vesselId: 'IND-MH-01-1002',
          name: 'Sea Prince',
          owner: admin._id,
          fisherman: fisherman._id,
          type: 'longliner',
          length: 22.0,
          capacity: 35,
          registrationNumber: 'IND-MH-01-2022-45',
          registrationExpiry: new Date('2027-10-15'),
          fishingPermit: true,
          permitExpiry: new Date('2026-11-30'),
          safetyEquipment: { lifeJackets: true, fireExtinguisher: true, firstAidKit: true, radio: true, gps: true },
          fuelCapacity: 1200,
          currentFuel: 920,
          status: 'at_sea',
          location: { type: 'Point', coordinates: [72.75, 19.02] },
          speed: 11.2,
          heading: 210,
          isActive: true
        },
        {
          vesselId: 'IND-MH-01-1003',
          name: 'Ocean Pearl',
          owner: fisherman._id,
          fisherman: fisherman._id,
          type: 'gillnetter',
          length: 14.0,
          capacity: 15,
          registrationNumber: 'IND-MH-01-2024-12',
          registrationExpiry: new Date('2029-05-20'),
          fishingPermit: true,
          permitExpiry: new Date('2028-01-15'),
          safetyEquipment: { lifeJackets: true, fireExtinguisher: true, firstAidKit: true, radio: false, gps: true },
          fuelCapacity: 500,
          currentFuel: 380,
          status: 'docked',
          location: { type: 'Point', coordinates: [72.85, 18.92] },
          speed: 0,
          heading: 0,
          isActive: true
        }
      ];
      await Vessel.create(vesselsData);
      console.log('Seeded Vessels');
    }

    const vessels = await Vessel.find();
    const primaryVessel = vessels[0];

    // Seed Catch Records
    if (await CatchRecord.countDocuments() === 0 && primaryVessel) {
      const today = new Date();
      const speciesList = ['Kingfish', 'Pomfret', 'Indian Mackerel', 'Yellowfin Tuna', 'Tiger Shrimp', 'Hilsa'];
      const catchRecords = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        speciesList.forEach((sp, idx) => {
          catchRecords.push({
            vessel: vessels[idx % vessels.length]._id,
            fisherman: fisherman._id,
            date: d,
            species: sp,
            quantity: Math.floor(Math.random() * 50) + 10,
            weight: Math.floor(Math.random() * 400) + 100,
            location: { type: 'Point', coordinates: [72.80 + Math.random() * 0.1, 18.90 + Math.random() * 0.1] },
            fishingMethod: 'trawling',
            notes: `Regular morning catch - Good yield of ${sp}`
          });
        });
      }
      await CatchRecord.create(catchRecords);
      console.log('Seeded Catch Records');
    }

    // Seed Fuel Records
    if (await FuelRecord.countDocuments() === 0 && primaryVessel) {
      const today = new Date();
      const fuelRecords = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        fuelRecords.push({
          vessel: vessels[i % vessels.length]._id,
          fisherman: fisherman._id,
          date: d,
          fuelAdded: i === 0 ? 300 : 0,
          fuelConsumed: Math.floor(Math.random() * 80) + 40,
          distanceTravelled: Math.floor(Math.random() * 60) + 20,
          tripDuration: 8,
          efficiency: 1.5,
          notes: 'Standard patrol & fishing operation'
        });
      }
      await FuelRecord.create(fuelRecords);
      console.log('Seeded Fuel Records');
    }

    // Seed Weather Alerts
    if (await WeatherAlert.countDocuments() === 0) {
      await WeatherAlert.create([
        {
          title: 'High Wave & Wind Warning',
          description: 'Strong southwesterly winds (35-45 km/h) with wave heights reaching up to 3.2m expected along North Maharashtra Coast.',
          severity: 'high',
          type: 'high_waves',
          location: { type: 'Point', coordinates: [72.80, 18.95] },
          radius: 60,
          startDate: new Date(),
          endDate: new Date(Date.now() + 48 * 3600 * 1000),
          isActive: true,
          issuedBy: admin._id
        },
        {
          title: 'Squally Weather Advisory',
          description: 'Moderate to heavy rain spells accompanied by squally winds off Mumbai and Thane coastlines.',
          severity: 'medium',
          type: 'storm',
          location: { type: 'Point', coordinates: [72.70, 19.10] },
          radius: 40,
          startDate: new Date(),
          endDate: new Date(Date.now() + 24 * 3600 * 1000),
          isActive: true,
          issuedBy: admin._id
        }
      ]);
      console.log('Seeded Weather Alerts');
    }

    // Seed Compliance & Violations
    if (await Violation.countDocuments() === 0 && primaryVessel) {
      await Violation.create([
        {
          vessel: primaryVessel._id,
          fisherman: fisherman._id,
          type: 'zone_violation',
          description: 'Brief entry into Restricted Conservation Area boundary',
          location: { type: 'Point', coordinates: [72.76, 18.92] },
          severity: 'medium',
          status: 'detected',
          detectedAt: new Date(Date.now() - 3 * 3600 * 1000),
          notes: 'Automatic AIS alert triggered.'
        }
      ]);
      console.log('Seeded Violations');
    }

    if (await ComplianceRecord.countDocuments() === 0 && primaryVessel) {
      await ComplianceRecord.create([
        {
          vessel: primaryVessel._id,
          date: new Date(),
          fishingPermitValid: true,
          vesselRegistrationValid: true,
          catchLimitCompliant: true,
          zoneCompliant: true,
          safetyEquipmentCompliant: true,
          score: 95,
          status: 'compliant',
          issues: [],
          checkedBy: admin._id
        }
      ]);
      console.log('Seeded Compliance Records');
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
