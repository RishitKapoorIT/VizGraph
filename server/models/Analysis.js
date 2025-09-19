import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Untitled Analysis'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileData',
    required: true,
  },
  settings: {
    xAxis: { type: String, required: true },
    yAxis: { type: String, required: true },
    chartType: { type: String, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Analysis = mongoose.model('Analysis', AnalysisSchema);

export default Analysis;
