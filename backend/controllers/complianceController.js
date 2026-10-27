const ComplianceRecord = require('../models/ComplianceRecord');
const Vessel = require('../models/Vessel');

exports.createCompliance = async (req, res, next) => {
  try {
    let score = 0;
    if (req.body.fishingPermitValid) score += 20;
    if (req.body.vesselRegistrationValid) score += 20;
    if (req.body.catchLimitCompliant) score += 20;
    if (req.body.zoneCompliant) score += 20;
    if (req.body.safetyEquipmentCompliant) score += 20;
    req.body.score = score;
    req.body.status = score === 100 ? 'compliant' : score >= 60 ? 'warning' : 'violation';
    const record = await ComplianceRecord.create(req.body);
    res.status(201).json({ success: true, record });
  } catch (err) {
    next(err);
  }
};

exports.getCompliance = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.vessel) query.vessel = req.query.vessel;
    if (req.query.status) query.status = req.query.status;
    const records = await ComplianceRecord.find(query).populate('vessel', 'name vesselId').sort({ date: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    next(err);
  }
};

exports.getComplianceStats = async (req, res, next) => {
  try {
    const vessels = await Vessel.find({ isActive: true });
    let compliant = 0, warning = 0, violation = 0;
    for (const vessel of vessels) {
      const latest = await ComplianceRecord.findOne({ vessel: vessel._id }).sort({ date: -1 });
      if (latest) {
        if (latest.status === 'compliant') compliant++;
        else if (latest.status === 'warning') warning++;
        else violation++;
      } else {
        violation++;
      }
    }
    const total = vessels.length;
    const percentage = total > 0 ? Math.round((compliant / total) * 100) : 0;
    res.json({ success: true, stats: { total, compliant, warning, violation, percentage } });
  } catch (err) {
    next(err);
  }
};

exports.updateCompliance = async (req, res, next) => {
  try {
    const record = await ComplianceRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Compliance record not found' });
    }
    res.json({ success: true, record });
  } catch (err) {
    next(err);
  }
};

exports.deleteCompliance = async (req, res, next) => {
  try {
    const record = await ComplianceRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Compliance record not found' });
    }
    res.json({ success: true, message: 'Compliance record deleted' });
  } catch (err) {
    next(err);
  }
};
