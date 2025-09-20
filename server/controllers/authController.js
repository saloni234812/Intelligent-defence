const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getSupabase } = require('../db');

exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  const sb = getSupabase();
  const { data: exists, error: e1 } = await sb.from('users_app').select('id').eq('email', email).maybeSingle();
  if (e1) return res.status(400).json({ message: e1.message });
  if (exists) return res.status(400).json({ message: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 10);
  const { error } = await sb.from('users_app').insert([{ name, email, password_hash: passwordHash, role: role || 'User' }]);
  if (error) return res.status(400).json({ message: error.message });
  return res.status(201).json({ message: 'Account created' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const sb = getSupabase();
  const { data: user, error } = await sb.from('users_app').select('*').eq('email', email).maybeSingle();
  if (error || !user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'default-secret-key', { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id: user.id, email: user.email, role: user.role, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'default-secret-key', { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax' });
  return res.json({ message: 'Logged in', token });
};

exports.me = async (req, res) => {
  const sb = getSupabase();
  const { data: user, error } = await sb.from('users_app').select('id,name,email,role').eq('id', req.user.id).maybeSingle();
  if (error) return res.status(400).json({ message: error.message });
  return res.json({ user });
};

exports.logout = async (_req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};

// Change password (auth required)
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Invalid password payload' });
  }
  const sb = getSupabase();
  const { data: user, error } = await sb.from('users_app').select('*').eq('id', req.user.id).maybeSingle();
  if (error || !user) return res.status(400).json({ message: 'User not found' });
  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) return res.status(400).json({ message: 'Current password incorrect' });
  const newHash = await bcrypt.hash(newPassword, 10);
  const { data: updated, error: e2 } = await sb.from('users_app').update({ password_hash: newHash }).eq('id', req.user.id).select('*').maybeSingle();
  if (e2) return res.status(400).json({ message: e2.message });
  return res.json({ message: 'Password updated' });
};

// Update profile (auth required) — allow name update
exports.updateProfile = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
  const sb = getSupabase();
  const { data, error } = await sb.from('users_app').update({ name }).eq('id', req.user.id).select('id,name,email,role').maybeSingle();
  if (error) return res.status(400).json({ message: error.message });
  return res.json({ message: 'Profile updated', user: data });
};

// Refresh access token using refreshToken cookie
exports.refresh = async (req, res) => {
  try {
    const r = (req.cookies && req.cookies.refreshToken) || '';
    if (!r) return res.status(401).json({ message: 'No refresh token' });
    const payload = jwt.verify(r, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'default-secret-key');
    if (payload.type !== 'refresh') return res.status(401).json({ message: 'Invalid refresh token' });
    const token = jwt.sign({ id: payload.id, email: payload.email, role: payload.role }, process.env.JWT_SECRET || 'default-secret-key', { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    return res.json({ message: 'Token refreshed', token });
  } catch (e) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};


