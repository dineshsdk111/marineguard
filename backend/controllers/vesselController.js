const Vessel = require('../models/Vessel');

exports.createVessel = async (req, res, next) => {
  try {
    const vessel = await Vessel.create(req.body);
    res.status(201).json({ success: true, vessel });
  } catch (err) {
    next(err);
  }
};

exports.getVessels = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;
    const vessels = await Vessel.find(query).populate('owner', 'name email').populate('fisherman', 'name email');
    res.json({ success: true, count: vessels.length, vessels });
  } catch (err) {
    next(err);
  }
};

exports.getVessel = async (req, res, next) => {
  try {
    const vessel = await Vessel.findById(req.params.id).populate('owner', 'name email phone').populate('fisherman', 'name email phone');
    if (!vessel) {
      return res.status(404).json({ success: false, message: 'Vessel not found' });
    }
    res.json({ success: true, vessel });
  } catch (err) {
    next(err);
  }
};

exports.updateVessel = async (req, res, next) => {
  try {
    const vessel = await Vessel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vessel) {
      return res.status(404).json({ success: false, message: 'Vessel not found' });
    }
    res.json({ success: true, vessel });
  } catch (err) {
    next(err);
  }
};

exports.updateVesselLocation = async (req, res, next) => {
  try {
    const { lat, lng, speed, heading, status } = req.body;
    const vessel = await Vessel.findByIdAndUpdate(
      req.params.id,
      { location: { type: 'Point', coordinates: [lng, lat] }, speed, heading, status, lastUpdated: new Date() },
      { new: true }
    );
    if (!vessel) {
      return res.status(404).json({ success: false, message: 'Vessel not found' });
    }
    res.json({ success: true, vessel });
  } catch (err) {
    next(err);
  }
};

exports.deleteVessel = async (req, res, next) => {
  try {
    const vessel = await Vessel.findByIdAndDelete(req.params.id);
    if (!vessel) {
      return res.status(404).json({ success: false, message: 'Vessel not found' });
    }
    res.json({ success: true, message: 'Vessel deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getVesselStats = async (req, res, next) => {
  try {
    const total = await Vessel.countDocuments({ isActive: true });
    const atSea = await Vessel.countDocuments({ status: { $in: ['at_sea', 'fishing'] } });
    const fishing = await Vessel.countDocuments({ status: 'fishing' });
    const docked = await Vessel.countDocuments({ status: 'docked' });
    res.json({ success: true, stats: { total, atSea, fishing, docked } });
  } catch (err) {
    next(err);
  }
};
