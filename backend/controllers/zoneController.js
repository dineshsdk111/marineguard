const FishingZone = require('../models/FishingZone');

exports.createZone = async (req, res, next) => {
  try {
    const zone = await FishingZone.create(req.body);
    res.status(201).json({ success: true, zone });
  } catch (err) {
    next(err);
  }
};

exports.getZones = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.type) query.type = req.query.type;
    const zones = await FishingZone.find(query);
    res.json({ success: true, count: zones.length, zones });
  } catch (err) {
    next(err);
  }
};

exports.getZone = async (req, res, next) => {
  try {
    const zone = await FishingZone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }
    res.json({ success: true, zone });
  } catch (err) {
    next(err);
  }
};

exports.updateZone = async (req, res, next) => {
  try {
    const zone = await FishingZone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }
    res.json({ success: true, zone });
  } catch (err) {
    next(err);
  }
};

exports.deleteZone = async (req, res, next) => {
  try {
    const zone = await FishingZone.findByIdAndDelete(req.params.id);
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }
    res.json({ success: true, message: 'Zone deleted' });
  } catch (err) {
    next(err);
  }
};
