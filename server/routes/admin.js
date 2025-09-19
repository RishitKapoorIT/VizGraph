import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import adminAuth from '../middleware/adminAuth.js';
import User from '../models/User.js';
import Analysis from '../models/Analysis.js';
import FileData from '../models/FileData.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// @route   POST api/admin/setup
// @desc    Create initial admin user (ONE-TIME SETUP)
// @access  Public (but creates admin only if none exists)
router.post('/setup', async (req, res) => {
  try {
    // Check if any admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      return res.status(400).json({ 
        msg: 'Admin user already exists. This route is for initial setup only.' 
      });
    }

    // Check if the specific admin user already exists
    const existingUser = await User.findOne({ email: 'admin@admin.com' });
    
    if (existingUser) {
      // Update existing user to admin
      existingUser.role = 'admin';
      existingUser.name = 'admin';
      await existingUser.save();
      
      return res.json({ 
        msg: 'Existing user updated to admin successfully',
        user: {
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role
        }
      });
    }

    // Create new admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt); // Default password

    const adminUser = new User({
      name: 'admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();

    res.json({ 
      msg: 'Admin user created successfully',
      user: {
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      },
      credentials: {
        email: 'admin@admin.com',
        password: 'admin123'
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/users', [verifyToken, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Find all users, exclude passwords
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/user-stats
// @desc    Get user statistics with analysis counts (Admin only)
// @access  Private (Admin)
router.get('/user-stats', [verifyToken, adminAuth], async (req, res) => {
  try {
    // Get all users with their analysis counts
    const userStats = await User.aggregate([
      {
        $lookup: {
          from: 'analyses', // Collection name for Analysis model
          localField: '_id',
          foreignField: 'user',
          as: 'analyses'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          analysisCount: { $size: '$analyses' },
          lastAnalysis: { 
            $max: '$analyses.createdAt' 
          },
          chartTypes: {
            $setUnion: ['$analyses.settings.chartType']
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    // Get overall platform statistics
    const totalUsers = await User.countDocuments();
    const totalAnalyses = await Analysis.countDocuments();
    const activeUsers = await Analysis.distinct('user').then(users => users.length);

    res.json({
      userStats,
      platformStats: {
        totalUsers,
        totalAnalyses,
        activeUsers
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user (Admin only)
// @access  Private (Admin)
router.delete('/users/:id', [verifyToken, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/users/:id
// @desc    Update user details
// @access  Admin only
router.put('/users/:id', verifyToken, adminAuth, async (req, res) => {
    const { name, email, role } = req.body;

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if email is already taken by another user
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
            if (existingUser) {
                return res.status(400).json({ msg: 'Email is already in use' });
            }
        }

        // Update fields
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (role !== undefined) user.role = role;

        await user.save();

        // Return updated user (without password)
        const updatedUser = await User.findById(user._id, '-password');
        res.json({ 
            msg: 'User updated successfully',
            user: updatedUser
        });

    } catch (err) {
        console.error('Error updating user:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   GET api/admin/files
// @desc    Get all files with user info (Admin only)
// @access  Private (Admin)
router.get('/files', [verifyToken, adminAuth], async (req, res) => {
  try {
    const files = await FileData.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/files/:id
// @desc    Delete a file (Admin only)
// @access  Private (Admin)
router.delete('/files/:id', [verifyToken, adminAuth], async (req, res) => {
  try {
    const file = await FileData.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }

    // Also delete all analyses that use this file
    await Analysis.deleteMany({ fileData: req.params.id });
    
    await FileData.findByIdAndDelete(req.params.id);

    res.json({ msg: 'File and related analyses removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'File not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/analyses
// @desc    Get all analyses with user and file info (Admin only)
// @access  Private (Admin)
router.get('/analyses', [verifyToken, adminAuth], async (req, res) => {
  try {
    const analyses = await Analysis.find()
      .populate('user', 'name email')
      .populate('fileData', 'filename')
      .sort({ createdAt: -1 });
    res.json(analyses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/analyses/:id
// @desc    Delete an analysis (Admin only)
// @access  Private (Admin)
router.delete('/analyses/:id', [verifyToken, adminAuth], async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ msg: 'Analysis not found' });
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

// @route   GET api/admin/dashboard-stats
// @desc    Get comprehensive dashboard statistics (Admin only)
// @access  Private (Admin)
router.get('/dashboard-stats', [verifyToken, adminAuth], async (req, res) => {
  try {
    // Get basic counts
    const totalUsers = await User.countDocuments();
    const totalFiles = 0; //await FileData.countDocuments();
    const totalAnalyses = 0; //await Analysis.countDocuments();
    const activeUsers = 0; //await Analysis.distinct('user').then(users => users.length);
    
    // Get chart type distribution
    const chartTypeStats = []; //await Analysis.aggregate([ ... ]);
    
    // Get user activity over time (last 30 days)
    const recentActivity = []; //await Analysis.aggregate([ ... ]);
    
    // Get top users by analysis count
    const topUsers = []; //await Analysis.aggregate([ ... ]);
    
    res.json({
      overview: {
        totalUsers,
        totalFiles,
        totalAnalyses,
        activeUsers
      },
      chartTypeStats,
      recentActivity,
      topUsers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;