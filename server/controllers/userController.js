const { getSupabase } = require('../db');

exports.list = async (req, res) => {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('users_app')
      .select('id, name, email, role, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) return res.status(400).json({ message: error.message });
    res.json({ users: data });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const sb = getSupabase();
    const { data, error } = await sb
      .from('users_app')
      .select('id, name, email, role, created_at, updated_at')
      .eq('id', id)
      .single();
    
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const sb = getSupabase();
    
    const { data, error } = await sb
      .from('users_app')
      .update({ 
        name, 
        email, 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, name, email, role, created_at, updated_at')
      .single();
    
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const sb = getSupabase();
    
    // Prevent deleting own account
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const { error } = await sb.from('users_app').delete().eq('id', id);
    
    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: 'User deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('users_app')
      .select('role');
    
    if (error) return res.status(400).json({ message: error.message });
    
    const stats = data.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      total: data.length,
      admins: stats.Admin || 0,
      operators: stats.Operator || 0,
      users: stats.User || 0
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

