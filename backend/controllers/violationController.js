const Violation = require('../models/Violation');

exports.createViolation = async (req, res, next) => {
  try {
    const violation = await Violation.create(req.body);
    res.status(201).json({ success: true, violation });
  } catch (err) {
    next(err);
  }
};

exports.getViolations = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;
    if (req.query.vessel) query.vessel = req.query.vessel;
    const violations = await Violation.find(query).populate('vessel', 'name vesselId').populate('fisherman', 'name').populate('zone', 'name type').sort({ detectedAt: -1 });
    res.json({ success: true, count: violations.length, violations });
  } catch (err) {
    next(err);
  }
};

exports.getViolation = async (req, res, next) => {
  try {
    const violation = await Violation.findById(req.params.id).populate('vessel', 'name vesselId').populate('fisherman', 'name').populate('zone', 'name type');
    if (!violation) {
      return res.status(404).json({ success: false, message: 'Violation not found' });
    }
    res.json({ success: true, violation });
  } catch (err) {
    next(err);
  }
};

exports.updateViolation = async (req, res, next) => {
  try {
    const violation = await Violation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!violation) {
      return res.status(404).json({ success: false, message: 'Violation not found' });
    }
    res.json({ success: true, violation });
  } catch (err) {
    next(err);
  }
};

exports.getViolationStats = async (req, res, next) => {
  try {
    const total = await Violation.countDocuments();
    const active = await Violation.countDocuments({ status: { $in: ['detected', 'acknowledged'] } });
    const byType = await Violation.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const recent = await Violation.find().populate('vessel', 'name vesselId').sort({ detectedAt: -1 }).limit(5);
    res.json({ success: true, stats: { total, active, byType, recent } });
  } catch (err) {
    next(err);
  }
};
