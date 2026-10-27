const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['fisherman', 'cooperative_admin', 'marine_authority'], default: 'fisherman' },
  phone: { type: String, required: true, trim: true },
  organization: { type: String, required: true, trim: true },
  designation: { type: String, trim: true, default: '' },
  employeeId: { type: String, trim: true, default: '' },
  district: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  lastLogin: { type: Date },
  assignedVessel: { type: mongoose.Schema.Types.ObjectId, ref: 'Vessel' },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

module.exports = mongoose.model('User', UserSchema);
