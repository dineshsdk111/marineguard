const FuelRecord = require('../models/FuelRecord');
const Vessel = require('../models/Vessel');

exports.createFuelRecord = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.fisherman && req.user) {
      data.fisherman = req.user._id || req.user.id;
    }
    const record = await FuelRecord.create(data);
    if (data.fuelAdded) {
      await Vessel.findByIdAndUpdate(data.vessel, { $inc: { currentFuel: data.fuelAdded } });
    }
    if (data.fuelConsumed) {
      await Vessel.findByIdAndUpdate(data.vessel, { $inc: { currentFuel: -data.fuelConsumed } });
    }
    res.status(201).json({ success: true, record });
  } catch (err) {
    next(err);
  }
};

exports.getFuelRecords = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.vessel) query.vessel = req.query.vessel;
    const records = await FuelRecord.find(query).populate('vessel', 'name vesselId').populate('fisherman', 'name').sort({ date: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    next(err);
  }
};

exports.getFuelStats = async (req, res, next) => {
  try {
    const totalConsumed = await FuelRecord.aggregate([
      { $group: { _id: null, total: { $sum: '$fuelConsumed' }, totalAdded: { $sum: '$fuelAdded' } } }
    ]);
    const byVessel = await FuelRecord.aggregate([
      { $group: { _id: '$vessel', totalConsumed: { $sum: '$fuelConsumed' }, totalAdded: { $sum: '$fuelAdded' }, avgEfficiency: { $avg: '$efficiency' } } },
      { $lookup: { from: 'vessels', localField: '_id', foreignField: '_id', as: 'vessel' } },
      { $unwind: '$vessel' },
      { $project: { name: '$vessel.name', vesselId: '$vessel.vesselId', totalConsumed: 1, totalAdded: 1, avgEfficiency: 1 } }
    ]);
    const daily = await FuelRecord.aggregate([
      { $match: { date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, consumed: { $sum: '$fuelConsumed' }, added: { $sum: '$fuelAdded' } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, stats: { total: totalConsumed[0] || { total: 0, totalAdded: 0 }, byVessel, daily } });
  } catch (err) {
    next(err);
  }
};

exports.deleteFuelRecord = async (req, res, next) => {
  try {
    const record = await FuelRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Fuel record not found' });
    }
    res.json({ success: true, message: 'Fuel record deleted' });
  } catch (err) {
    next(err);
  }
};
