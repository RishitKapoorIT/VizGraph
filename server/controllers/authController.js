import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          throw err;
        }
        res.json({ token });
      }
    );
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          throw err;
        }
        res.json({ token });
      }
    );
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

export const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        // For now, we'll decode the Google JWT token manually
        // In production, you should verify the token with Google's API
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        const { email, name } = decoded;

        if (!email || !name) {
            return res.status(400).json({ msg: 'Invalid Google token' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            // If user doesn't exist, create a new one
            user = new User({
                name,
                email,
                password: '', // Google users don't have a local password
                isGoogleUser: true,
            });
            await user.save();
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) {
                    throw err;
                }
                res.json({ token });
            }
        );
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({ 
                message: 'If an account with this email exists, you will receive password reset instructions shortly.' 
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // In a real application, you would:
        // 1. Save the reset token to the database with expiration
        // 2. Send an email with the reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        // For demo purposes, the link is sent in the response. In production, you would email this link.

        res.json({ 
            message: 'If an account with this email exists, you will receive password reset instructions shortly.',
            // In production, don't send the token in response - send via email instead
            resetToken: resetToken // Only for demo purposes
        });

    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

export const updateProfile = async (req, res) => {
    const { name, email, currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // If changing password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ msg: 'Current password is required to change password' });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Current password is incorrect' });
            }

            // Validate new password
            if (newPassword.length < 6) {
                return res.status(400).json({ msg: 'New password must be at least 6 characters long' });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Update other fields
        if (name !== undefined) user.name = name;
        if (email !== undefined) {
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
            if (existingUser) {
                return res.status(400).json({ msg: 'Email is already in use' });
            }
            user.email = email;
        }

        await user.save();

        // Return updated user (without password)
        const updatedUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        res.json({ 
            msg: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};