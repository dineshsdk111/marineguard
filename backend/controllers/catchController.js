const CatchRecord = require('../models/CatchRecord');
const Vessel = require('../models/Vessel');

exports.createCatch = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.fisherman && req.user) {
      data.fisherman = req.user._id || req.user.id;
    }
    const catchRecord = await CatchRecord.create(data);
    res.status(201).json({ success: true, catch: catchRecord });
  } catch (err) {
    next(err);
  }
};

exports.getCatches = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.vessel) query.vessel = req.query.vessel;
    if (req.query.species) query.species = req.query.species;
    if (req.query.date) {
      const date = new Date(req.query.date);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      query.date = { $gte: date, $lt: nextDate };
    }
    if (req.query.from || req.query.to) {
      query.date = {};
      if (req.query.from) query.date.$gte = new Date(req.query.from);
      if (req.query.to) query.date.$lte = new Date(req.query.to);
    }
    const catches = await CatchRecord.find(query).populate('vessel', 'name vesselId').populate('fisherman', 'name').sort({ date: -1 });
    res.json({ success: true, count: catches.length, catches });
  } catch (err) {
    next(err);
  }
};

exports.getCatchStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCatches = await CatchRecord.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalWeight: { $sum: '$weight' }, count: { $sum: 1 } } }
    ]);
    const speciesDistribution = await CatchRecord.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: '$species', totalQuantity: { $sum: '$quantity' }, totalWeight: { $sum: '$weight' } } },
      { $sort: { totalWeight: -1 } }
    ]);
    const weeklyCatches = await CatchRecord.aggregate([
      { $match: { date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, totalWeight: { $sum: '$weight' }, totalQuantity: { $sum: '$quantity' } } },
      { $sort: { _id: 1 } }
    ]);
    const byVessel = await CatchRecord.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: '$vessel', totalWeight: { $sum: '$weight' }, totalQuantity: { $sum: '$quantity' } } },
      { $lookup: { from: 'vessels', localField: '_id', foreignField: '_id', as: 'vessel' } },
      { $unwind: '$vessel' },
      { $project: { name: '$vessel.name', vesselId: '$vessel.vesselId', totalWeight: 1, totalQuantity: 1 } }
    ]);
    res.json({
      success: true,
      stats: {
        today: todayCatches[0] || { totalQuantity: 0, totalWeight: 0, count: 0 },
        speciesDistribution,
        weeklyCatches,
        byVessel
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCatch = async (req, res, next) => {
  try {
    const catchRecord = await CatchRecord.findByIdAndDelete(req.params.id);
    if (!catchRecord) {
      return res.status(404).json({ success: false, message: 'Catch record not found' });
    }
    res.json({ success: true, message: 'Catch record deleted' });
  } catch (err) {
    next(err);
  }
};
