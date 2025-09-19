const { getSupabase } = require('../db');

exports.list = async (req, res) => {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('playbooks')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('playbooks')
      .insert([{ ...req.body, created_by: req.user.id }])
      .select('*')
      .single();
    
    if (error) return res.status(400).json({ message: error.message });
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const sb = getSupabase();
    const { data, error } = await sb
      .from('playbooks')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
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
    const { error } = await sb.from('playbooks').delete().eq('id', id);
    
    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: 'Playbook deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.execute = async (req, res) => {
  try {
    const { id } = req.params;
    const sb = getSupabase();
    
    // Update status to IN_PROGRESS
    const { data: playbook, error: updateError } = await sb
      .from('playbooks')
      .update({ 
        status: 'IN_PROGRESS', 
        executed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();
    
    if (updateError) return res.status(400).json({ message: updateError.message });
    
    // Simulate execution based on ETA
    setTimeout(async () => {
      try {
        await sb
          .from('playbooks')
          .update({ 
            status: 'COMPLETED', 
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (e) {
        console.error('Playbook completion error:', e);
      }
    }, (playbook.eta_seconds || 0) * 1000);
    
    res.json({ message: 'Playbook execution started', playbook });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('playbooks')
      .select('status');
    
    if (error) return res.status(400).json({ message: error.message });
    
    const stats = data.reduce((acc, playbook) => {
      acc[playbook.status] = (acc[playbook.status] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      ready: stats.AVAILABLE || 0,
      active: stats.IN_PROGRESS || 0,
      complete: stats.COMPLETED || 0,
      failed: stats.FAILED || 0
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

