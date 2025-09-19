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
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
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
  res.json({ message: 'Logged out' });
};


