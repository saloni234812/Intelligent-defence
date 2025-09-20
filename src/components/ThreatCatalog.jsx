import React, { useEffect, useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import threatTypesService from '../services/threatTypes';

const ThreatCatalog = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await threatTypesService.getThreatTypesWithRoles();
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setError('Failed to load threat catalog');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const byCategory = items.reduce((acc, t) => {
    const cat = t.category || 'UNKNOWN';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-cyan-400 font-mono text-sm">THREAT CATALOG</h3>
        </div>
        <div className="text-gray-400 text-sm">Loading threat catalog…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className="text-red-400 font-mono text-sm">THREAT CATALOG</h3>
        </div>
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-sm">THREAT CATALOG</h3>
      </div>

      <div className="space-y-4">
        {Object.entries(byCategory).map(([category, list]) => (
          <div key={category} className="bg-slate-900/40 rounded-lg p-3">
            <div className="text-xs font-mono text-cyan-300 mb-2">{threatTypesService.formatCategory(category)} • {list.length} types</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {list.map(t => (
                <div key={t.id} className="border border-slate-700 rounded p-3 bg-slate-900/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-gray-200 text-sm font-mono">{t.name}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: 'rgb(56,189,248)' }}>{t.severity}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{t.description}</div>

                  {t.role_info ? (
                    <div className="text-xs text-gray-300">
                      <div className="mb-1"><span className="text-gray-400">Role: </span><span className="text-cyan-300">{t.role_info.role}</span></div>
                      <div className="mb-1"><span className="text-gray-400">Purpose: </span>{t.role_info.purpose}</div>
                      <div className="mb-1 text-gray-400">Recommended Actions:</div>
                      <ul className="list-disc list-inside space-y-0.5 text-gray-300">
                        {(t.role_info.recommended_actions || []).map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">No role info</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreatCatalog;
