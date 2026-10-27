const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'danger', 'success'], default: 'info' },
  isRead: { type: Boolean, default: false },
  link: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
