const User = require('../models/User');

exports.register = async (req, res, next) => {
  console.log('--- REGISTRATION CONTROLLER CALLED ---', req.body);
  try {
    const { name, email, password, role, phone, organization, designation, employeeId, district, state } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }
    const user = await User.create({
      name, email, password, role, phone, organization,
      designation: designation || '', employeeId: employeeId || '',
      district, state,
      isActive: true,
      isApproved: true,
      approvedAt: new Date(),
    });
    const token = user.getSignedJwtToken();
    const message = 'Registration successful! You can now log in.';
    res.status(201).json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: true },
      message,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isApproved) {
      return res.status(403).json({ success: false, message: 'Your account is pending approval. Please contact your administrator.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact your administrator.' });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = user.getSignedJwtToken();
    res.json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, organization: user.organization },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('assignedVessel');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const userObj = user.toObject();
    userObj.id = user._id.toString();
    res.json({ success: true, user: userObj });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.pending === 'true') query.isApproved = false;
    if (req.query.role) query.role = req.query.role;
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      isApproved: true, isActive: true, approvedBy: req.user.id, approvedAt: new Date(),
    }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user, message: `User ${user.name} has been approved` });
  } catch (err) {
    next(err);
  }
};

exports.rejectUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Registration rejected and user removed' });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};
