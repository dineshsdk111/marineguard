const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');

const User = require('../models/User');
const Vessel = require('../models/Vessel');
const CatchRecord = require('../models/CatchRecord');
const FuelRecord = require('../models/FuelRecord');
const FishingTrip = require('../models/FishingTrip');
const FishingZone = require('../models/FishingZone');
const Violation = require('../models/Violation');

async function seedFleet() {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Seeding fleet...');

    // 1. Update existing vessels
    await Vessel.updateMany({}, { $set: { isActive: true } });

    // 2. Fetch users
    const admin = await User.findOne({ email: 'admin@marineguard.gov.in' });
    const fisherman = await User.findOne({ email: 'fisherman@marineguard.gov.in' });
    const coop = await User.findOne({ email: 'coop@marineguard.gov.in' });

    // 3. Add demo vessels if not already existing
    const sampleVessels = [
      {
        vesselId: 'IND-MH-01-1001',
        name: 'Sagar Kanya',
        owner: fisherman?._id || admin?._id,
        fisherman: fisherman?._id || admin?._id,
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
        owner: admin?._id,
        fisherman: fisherman?._id || admin?._id,
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
        owner: fisherman?._id || admin?._id,
        fisherman: fisherman?._id || admin?._id,
        type: 'gillnetter',
        length: 14.0,
        capacity: 15,
        registrationNumber: 'IND-MH-01-2024-12',
        registrationExpiry: new Date('2029-05-20'),
        fishingPermit: true,
        permitExpiry: new Date('2028-01-15'),
        safetyEquipment: { lifeJackets: true, fireExtinguisher: true, firstAidKit: true, radio: true, gps: true },
        fuelCapacity: 500,
        currentFuel: 380,
        status: 'docked',
        location: { type: 'Point', coordinates: [72.85, 18.92] },
        speed: 0,
        heading: 0,
        isActive: true
      }
    ];

    for (const vData of sampleVessels) {
      await Vessel.findOneAndUpdate(
        { vesselId: vData.vesselId },
        { $set: vData },
        { upsert: true, new: true }
      );
    }
    console.log('Sample vessels seeded/updated.');

    // 4. Assign primary vessel to Rajesh Kumar
    const sagarKanya = await Vessel.findOne({ vesselId: 'IND-MH-01-1001' });
    if (fisherman && sagarKanya) {
      await User.findByIdAndUpdate(fisherman._id, { assignedVessel: sagarKanya._id });
    }

    // 5. Seed Catch Records if few
    const catchCount = await CatchRecord.countDocuments();
    if (catchCount < 10 && sagarKanya) {
      const vessels = await Vessel.find({ isActive: true });
      const speciesList = ['Pomfret', 'Kingfish', 'Indian Mackerel', 'Yellowfin Tuna', 'Tiger Shrimp', 'Hilsa'];
      const catches = [];
      const now = new Date();

      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        for (let j = 0; j < 3; j++) {
          const sp = speciesList[(i + j) % speciesList.length];
          catches.push({
            vessel: vessels[j % vessels.length]._id,
            fisherman: fisherman?._id || admin?._id,
            date: d,
            species: sp,
            quantity: Math.floor(Math.random() * 40) + 15,
            weight: Math.floor(Math.random() * 350) + 120,
            location: { type: 'Point', coordinates: [72.82 + (Math.random() - 0.5) * 0.1, 18.95 + (Math.random() - 0.5) * 0.1] },
            fishingMethod: 'trawling',
            notes: `Morning voyage haul - ${sp}`
          });
        }
      }
      await CatchRecord.insertMany(catches);
      console.log('Catch records seeded.');
    }

    // 6. Seed Fuel Records if few
    const fuelCount = await FuelRecord.countDocuments();
    if (fuelCount < 5 && sagarKanya) {
      const vessels = await Vessel.find({ isActive: true });
      const fuelRecords = [];
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        fuelRecords.push({
          vessel: vessels[i % vessels.length]._id,
          fisherman: fisherman?._id || admin?._id,
          date: d,
          fuelAdded: i === 0 ? 250 : 0,
          fuelConsumed: Math.floor(Math.random() * 60) + 30,
          distanceTravelled: Math.floor(Math.random() * 45) + 20,
          tripDuration: 6,
          efficiency: 1.6,
          notes: 'Standard coastal patrol/fishing run'
        });
      }
      await FuelRecord.insertMany(fuelRecords);
      console.log('Fuel records seeded.');
    }

    // 7. Seed active trip
    if (sagarKanya && fisherman) {
      try {
        await mongoose.connection.db.collection('fishingtrips').dropIndex('tripNumber_1');
      } catch (e) {
        // index might not exist or already dropped
      }
      await FishingTrip.deleteMany({ tripId: 'TRIP-2024-101' });
      await FishingTrip.create({
        vessel: sagarKanya._id,
        fisherman: fisherman._id,
        tripId: 'TRIP-2024-101',
        startDate: new Date(Date.now() - 4 * 3600 * 1000),
        status: 'active',
        startLocation: [72.85, 18.92],
        totalCatch: 18,
        totalWeight: 420,
        distanceTravelled: 28,
        fuelUsed: 42,
        notes: 'High yield trawling run in Alpha Zone'
      });
      console.log('Active trip seeded.');
    }

    console.log('Demo fleet seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding demo fleet:', err);
    process.exit(1);
  }
}

seedFleet();
