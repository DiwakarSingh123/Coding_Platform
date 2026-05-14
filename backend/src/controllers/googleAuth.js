const User = require('../modules/user');
const jwt = require('jsonwebtoken');

// We verify the Firebase ID token using Google's tokeninfo endpoint (no extra package needed)
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    // Verify the Firebase ID token by calling Google's tokeninfo endpoint
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );
    const payload = await verifyRes.json();

    if (payload.error) {
      return res.status(401).json({ message: 'Invalid Google token: ' + payload.error });
    }

    const { email, name, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Could not get email from Google token' });
    }

    // Find existing user or create a new one
    let user = await User.findOne({ emailId: email });

    if (!user) {
      // Auto-create account for Google users
      const firstName = name ? name.split(' ')[0] : email.split('@')[0];
      const lastName = name && name.split(' ').length > 1 ? name.split(' ').slice(1).join(' ') : null;

      // Build user object — only include lastName if it meets minlength:3 requirement
      const newUserData = {
        firstName,
        emailId: email,
        password: `google_oauth_${googleId}`,
        role: 'user',
      };
      if (lastName && lastName.length >= 3) {
        newUserData.lastName = lastName;
      }

      user = await User.create(newUserData);
    }

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    // Issue JWT cookie exactly like normal login
    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.SECERATE_KEY,
      { expiresIn: 60 * 60 }
    );
    res.cookie('token', token, { maxAge: 60 * 60 * 1000 });

    res.status(200).json({ user: reply, message: 'Google login successful' });
  } catch (err) {
    console.error('googleLogin error:', err);
    res.status(500).json({ message: 'Internal server error: ' + err.message });
  }
};

module.exports = { googleLogin };
