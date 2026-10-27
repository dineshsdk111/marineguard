const FishingTrip = require('../models/FishingTrip');
const Vessel = require('../models/Vessel');

exports.createTrip = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.vessel) {
      return res.status(400).json({ success: false, message: 'Please select a vessel' });
    }

    if (!data.fisherman) {
      if (req.user) {
        data.fisherman = req.user._id || req.user.id;
      } else {
        const v = await Vessel.findById(data.vessel);
        if (v && v.fisherman) data.fisherman = v.fisherman;
        else if (v && v.owner) data.fisherman = v.owner;
      }
    }

    if (!data.tripId) {
      data.tripId = `TRIP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (!data.startDate) {
      data.startDate = new Date();
    }

    const trip = await FishingTrip.create(data);
    const populated = await FishingTrip.findById(trip._id)
      .populate('vessel', 'name vesselId')
      .populate('fisherman', 'name');
    res.status(201).json({ success: true, trip: populated });
  } catch (err) {
    next(err);
  }
};

exports.getTrips = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.vessel) query.vessel = req.query.vessel;
    const trips = await FishingTrip.find(query).populate('vessel', 'name vesselId').populate('fisherman', 'name').sort({ startDate: -1 });
    res.json({ success: true, count: trips.length, trips });
  } catch (err) {
    next(err);
  }
};

exports.getTrip = async (req, res, next) => {
  try {
    const trip = await FishingTrip.findById(req.params.id).populate('vessel', 'name vesselId').populate('fisherman', 'name');
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
};

exports.updateTrip = async (req, res, next) => {
  try {
    const trip = await FishingTrip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
};

exports.endTrip = async (req, res, next) => {
  try {
    const trip = await FishingTrip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    trip.endDate = new Date();
    trip.status = 'completed';
    if (req.body.endLocation) trip.endLocation = req.body.endLocation;
    if (req.body.distanceTravelled) trip.distanceTravelled = req.body.distanceTravelled;
    if (req.body.fuelUsed) trip.fuelUsed = req.body.fuelUsed;
    await trip.save();
    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
};
