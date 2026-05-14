const User = require('../modules/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const isProd = process.env.NODE_ENV === 'production';

const cookieOptions = {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    ...(isProd && { sameSite: 'none', secure: true })
};

const register = async (req, res) => {
    try {
        const data = req.body;
        validate(data);
        const { password } = data;
        data.password = await bcrypt.hash(password, 10);
        data.role = 'user';
        const user = await User.create(data);

        const reply = { firstName: user.firstName, emailId: user.emailId, _id: user._id, role: user.role };
        const token = jwt.sign({ _id: user._id, emailId: user.emailId, role: 'user' }, process.env.SECERATE_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, cookieOptions);
        res.status(200).json({ user: reply, message: 'User Registered Successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId });
        if (!user) throw new Error('Invalid EmailId');

        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) throw new Error('Invalid Credentials');

        const reply = { firstName: user.firstName, emailId: user.emailId, _id: user._id, role: user.role };
        const token = jwt.sign({ _id: user._id, emailId: user.emailId, role: user.role }, process.env.SECERATE_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, cookieOptions);
        res.status(200).json({ user: reply, message: 'User login successfully' });
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

const logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        const payload = jwt.decode(token);
        await redisClient.set(`token:${token}`, 'Blocked');
        await redisClient.expireAt(`token:${token}`, payload.exp);
        res.cookie('token', null, { expires: new Date(Date.now()), ...(isProd && { sameSite: 'none', secure: true }) });
        res.status(200).json({ message: 'Logout Successfully' });
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

const adminRegister = async (req, res) => {
    try {
        const data = req.body;
        validate(data);
        data.password = await bcrypt.hash(data.password, 10);
        const user = await User.create(data);
        const token = jwt.sign({ _id: user._id, emailId: user.emailId, role: user.role }, process.env.SECERATE_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, cookieOptions);
        res.status(200).json({ message: 'Admin Registered Successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User Deleted Successfully' });
    } catch (err) {
        res.status(400).json({ message: 'User not found' });
    }
};

module.exports = { register, login, logout, adminRegister, deleteProfile };
