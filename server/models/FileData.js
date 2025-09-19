import mongoose from 'mongoose';

const FileDataSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FileData = mongoose.model('FileData', FileDataSchema);

export default FileData;
