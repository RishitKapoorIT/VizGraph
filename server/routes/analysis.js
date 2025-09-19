import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import Analysis from '../models/Analysis.js';
import { generateSummary, getAnalysisStats } from '../controllers/analysisController.js';

const router = express.Router();

// @route   POST api/analysis
// @desc    Save a new analysis
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  const { name, fileDataId, settings } = req.body;

  try {
    const newAnalysis = new Analysis({
      name,
      user: req.user.id,
      fileData: fileDataId,
      settings,
    });

    const analysis = await newAnalysis.save();
    res.json(analysis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analysis
// @desc    Get all analyses for a user
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(analyses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analysis/:id
// @desc    Get a single analysis by ID
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ msg: 'Analysis not found' });
    }

    // Make sure user owns the analysis
    if (analysis.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(analysis);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Analysis not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/analysis/:id
// @desc    Update an analysis
// @access  Private
router.put('/:id', verifyToken, async (req, res) => {
  const { name, fileDataId, settings } = req.body;

  try {
    let analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ msg: 'Analysis not found' });
    }

    // Make sure user owns the analysis
    if (analysis.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update analysis
    analysis = await Analysis.findByIdAndUpdate(
      req.params.id,
      {
        name,
        fileData: fileDataId,
        settings,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(analysis);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Analysis not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/analysis/:id
// @desc    Delete an analysis
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ msg: 'Analysis not found' });
    }

    // Make sure user owns the analysis
    if (analysis.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Analysis.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Analysis removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Analysis not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/analysis/summarize
// @desc    Generate AI summary for data
// @access  Private
router.post('/summarize', verifyToken, generateSummary);

// @route   GET /api/analysis/stats
// @desc    Get analysis statistics
// @access  Private
router.get('/stats', verifyToken, getAnalysisStats);

export default router;
