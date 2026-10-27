const CatchRecord = require('../models/CatchRecord');
const FuelRecord = require('../models/FuelRecord');
const Vessel = require('../models/Vessel');
const Violation = require('../models/Violation');
const WeatherAlert = require('../models/WeatherAlert');
const ComplianceRecord = require('../models/ComplianceRecord');
const FishingTrip = require('../models/FishingTrip');
const FishingZone = require('../models/FishingZone');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const roleToView = req.query.role || req.user?.role || 'marine_authority';

    // 1. Vessel Overview
    const totalVessels = await Vessel.countDocuments({ isActive: true });
    const activeVessels = await Vessel.countDocuments({ status: { $in: ['at_sea', 'fishing'] } });
    const fishingVessels = await Vessel.countDocuments({ status: 'fishing' });
    const dockedVessels = await Vessel.countDocuments({ status: 'docked' });
    const maintenanceVessels = await Vessel.countDocuments({ status: 'maintenance' });

    // 2. Today's Catch & Fuel
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCatches = await CatchRecord.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalWeight: { $sum: '$weight' } } }
    ]);

    const todayFuel = await FuelRecord.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: null, totalConsumed: { $sum: '$fuelConsumed' } } }
    ]);

    // 3. Alerts & Violations
    const activeAlerts = await WeatherAlert.countDocuments({ isActive: true });
    const activeViolations = await Violation.countDocuments({ status: { $in: ['detected', 'acknowledged'] } });
    const criticalViolations = await Violation.countDocuments({ status: { $in: ['detected', 'acknowledged'] }, severity: 'high' });

    // 4. Compliance Stats
    const complianceStats = await ComplianceRecord.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const complianceTotal = complianceStats.reduce((acc, s) => acc + s.count, 0);
    const compliantCount = complianceStats.find(s => s._id === 'compliant')?.count || 0;
    const compliancePercentage = complianceTotal > 0 ? Math.round((compliantCount / complianceTotal) * 100) : 0;

    // 5. Weekly Catch Trend
    const weeklyCatch = await CatchRecord.aggregate([
      { $match: { date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, totalWeight: { $sum: '$weight' }, totalQuantity: { $sum: '$quantity' } } },
      { $sort: { _id: 1 } }
    ]);

    // 6. Species Distribution
    const speciesDistribution = await CatchRecord.aggregate([
      { $match: { date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: '$species', totalWeight: { $sum: '$weight' }, count: { $sum: 1 } } },
      { $sort: { totalWeight: -1 } },
      { $limit: 8 }
    ]);

    // 7. Fuel Trend
    const fuelTrend = await FuelRecord.aggregate([
      { $match: { date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, consumed: { $sum: '$fuelConsumed' } } },
      { $sort: { _id: 1 } }
    ]);

    // 8. Recent Violations & Alerts
    const recentViolations = await Violation.find().populate('vessel', 'name vesselId type').sort({ detectedAt: -1 }).limit(6);
    const recentAlerts = await WeatherAlert.find({ isActive: true }).sort({ createdAt: -1 }).limit(5);

    // 9. Live Telemetry Snapshot (for mini maritime radar)
    const telemetryVessels = await Vessel.find({ isActive: true })
      .select('vesselId name type status location speed heading currentFuel fuelCapacity registrationNumber')
      .limit(10);

    // 10. User Registry / Census for "All Users" Hub
    const totalUsers = await User.countDocuments();
    const pendingApprovals = await User.countDocuments({ isApproved: false });
    const fishermenCount = await User.countDocuments({ role: 'fisherman' });
    const coopAdminsCount = await User.countDocuments({ role: 'cooperative_admin' });
    const authorityCount = await User.countDocuments({ role: 'marine_authority' });

    const recentUsers = await User.find()
      .select('-password')
      .populate('assignedVessel', 'name vesselId')
      .sort({ createdAt: -1 })
      .limit(12);

    // 11. Fisherman-Specific Persona Data
    let myVessel = null;
    if (req.user?.assignedVessel) {
      myVessel = await Vessel.findById(req.user.assignedVessel);
    }
    if (!myVessel && req.user?._id) {
      myVessel = await Vessel.findOne({ $or: [{ fisherman: req.user._id }, { owner: req.user._id }] });
    }
    if (!myVessel) {
      myVessel = await Vessel.findOne({ isActive: true });
    }

    let activeTrip = null;
    let myRecentCatches = [];
    let myRecentFuel = [];

    if (myVessel) {
      activeTrip = await FishingTrip.findOne({ vessel: myVessel._id, status: { $in: ['active', 'planned'] } }).sort({ startDate: -1 });
      myRecentCatches = await CatchRecord.find({ vessel: myVessel._id }).sort({ date: -1 }).limit(5);
      myRecentFuel = await FuelRecord.find({ vessel: myVessel._id }).sort({ date: -1 }).limit(5);
    }

    // 12. Cooperative Data
    const coopData = {
      totalMembers: fishermenCount + coopAdminsCount,
      pendingMembers: pendingApprovals,
      coopVesselsCount: totalVessels,
      monthlyQuotaKg: 25000,
      currentMonthlyCatchKg: todayCatches[0]?.totalWeight ? Math.round(todayCatches[0].totalWeight * 8) : 14200,
      fuelSubsidyAvailableLiters: 12500,
      fuelSubsidyUsedLiters: 4800,
    };

    // 13. Active Fishing Zones
    const activeZones = await FishingZone.find({ isActive: true }).select('name type maxCatchLimit color coordinates');

    res.json({
      success: true,
      dashboard: {
        totalVessels,
        activeVessels,
        fishingVessels,
        dockedVessels,
        maintenanceVessels,
        todayCatch: todayCatches[0] || { totalQuantity: 0, totalWeight: 0 },
        todayFuel: todayFuel[0]?.totalConsumed || 0,
        activeAlerts,
        activeViolations,
        criticalViolations,
        compliancePercentage,
        weeklyCatch,
        speciesDistribution,
        fuelTrend,
        recentViolations,
        recentAlerts,
        telemetryVessels,
        activeZones,
        userMetrics: {
          totalUsers,
          pendingApprovals,
          fishermenCount,
          coopAdminsCount,
          authorityCount,
          recentUsers,
        },
        fishermanData: {
          myVessel,
          activeTrip,
          myRecentCatches,
          myRecentFuel,
        },
        coopData,
        viewRole: roleToView,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.sendEmergencySOS = async (req, res, next) => {
  try {
    const { lat, lng, reason, vesselId } = req.body;
    let vessel = null;
    if (vesselId) {
      vessel = await Vessel.findById(vesselId);
    } else if (req.user?.assignedVessel) {
      vessel = await Vessel.findById(req.user.assignedVessel);
    } else if (req.user?._id) {
      vessel = await Vessel.findOne({ fisherman: req.user._id });
    }
    if (!vessel) {
      vessel = await Vessel.findOne({ isActive: true });
    }

    const coordinates = (lat !== undefined && lng !== undefined) ? [parseFloat(lng), parseFloat(lat)] : (vessel?.location?.coordinates || [72.82, 18.96]);

    const violation = await Violation.create({
      vessel: vessel?._id,
      fisherman: vessel?.fisherman || req.user?._id,
      type: 'sos_distress',
      severity: 'high',
      description: `EMERGENCY SOS TRANSMITTED by ${req.user?.name || 'Vessel Crew'} (${vessel?.name || 'Vessel Unknown'}). Reason: ${reason || 'Mayday / Marine Emergency'}. Location: [${coordinates[1].toFixed(4)}°N, ${coordinates[0].toFixed(4)}°E]`,
      location: { type: 'Point', coordinates },
      status: 'detected',
      detectedAt: new Date()
    });

    const authorities = await User.find({ role: { $in: ['marine_authority', 'cooperative_admin'] } });
    for (const authUser of authorities) {
      await Notification.create({
        user: authUser._id,
        title: '🚨 EMERGENCY MAYDAY / SOS BEACON DETECTED',
        message: `${req.user?.name || 'Fisherman'} aboard ${vessel?.name || 'Vessel'} triggered SOS distress beacon at [${coordinates[1].toFixed(4)}°N, ${coordinates[0].toFixed(4)}°E]!`,
        type: 'danger',
        link: '/violations'
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('emergency_sos', {
        vesselName: vessel?.name || 'Vessel in Distress',
        vesselId: vessel?.vesselId,
        userName: req.user?.name || 'Unknown User',
        phone: req.user?.phone || 'Emergency Line',
        coordinates,
        reason: reason || 'Mayday / Marine Emergency',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Emergency SOS distress beacon broadcasted to Indian Coast Guard & Cooperative authorities!',
      violationId: violation._id
    });
  } catch (err) {
    next(err);
  }
};

