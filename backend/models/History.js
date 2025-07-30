const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  filename: String,
  score: Number,
  reason: String,
  matchedRequired: [String],
  matchedOptional: [String],
}, { _id: false });

const historySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobDescription: { type: String, required: true },
  results: [resultSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('History', historySchema); 