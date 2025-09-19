import { useEffect, useMemo, useRef, useState } from "react";
import { Shield, Radar, Camera, AlertTriangle, Eye, Lock, Send, CheckCircle, Clock, Zap} from "lucide-react";


const ThreatAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const wsRef = useRef(null);

  const API_BASE = useMemo(() => {
    return import.meta.env.VITE_API_BASE || "http://localhost:8000";
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE}/alerts?per_page=50`);
      if (!res.ok) throw new Error("Failed to load alerts");
      const data = await res.json();
      // Normalize fields from backend to frontend structure
      const normalized = (data.alerts || []).map(a => ({
        id: a.id,
        type: a.alert_type,
        title: a.title,
        description: a.description,
        location: a.location || a.grid_reference || "",
        confidence: a.confidence,
        timestamp: a.created_at,
        acknowledged: a.status === 'ACKNOWLEDGED' || a.status === 'RESOLVED'
      }));
      setAlerts(normalized);
    } catch (err) {
      // Keep silent UI; could add toast/log
      console.error(err);
    }
  };

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  const webSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  useEffect(() => {
    if (!webSpeechSupported) return;
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const v = synth.getVoices();
      setVoices(v);
      if (!selectedVoice && v.length > 0) {
        const preferred = v.find(x => /en-US|en_GB/i.test(x.lang)) || v[0];
        setSelectedVoice(preferred?.voiceURI || "");
      }
    };
    loadVoices();
    synth.onvoiceschanged = loadVoices;
    return () => { try { synth.onvoiceschanged = null; } catch {} };
  }, [webSpeechSupported]);

  const speakWithWebSpeech = (text) => {
    if (!webSpeechSupported) return false;
    try {
      const utter = new window.SpeechSynthesisUtterance(text);
      const voice = voices.find(v => v.voiceURI === selectedVoice);
      if (voice) utter.voice = voice;
      utter.rate = rate;
      utter.pitch = pitch;
      utter.volume = volume;
      window.speechSynthesis.speak(utter);
      return true;
    } catch (e) {
      console.warn('WebSpeech failed', e);
      return false;
    }
  };

  const stopSpeaking = () => {
    if (webSpeechSupported) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
  };

  const voiceAnnounce = async (alert) => {
    try {
      if (voiceEnabled && (alert.type === 'CRITICAL' || alert.type === 'HIGH')) {
        const text = `${alert.type} alert. ${alert.title}. Location ${alert.location}. Confidence ${Math.round(alert.confidence)} percent.`;
        const spoke = speakWithWebSpeech(text);
        if (!spoke) {
          await fetch(`${API_BASE}/voice/speak`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          });
        }
      }
    } catch (e) {
      // Non-fatal if voice server unavailable
      console.warn("Voice announcement failed", e);
    }
  };

  const acknowledgeAlert = (id) => {
    const doAck = async () => {
      try {
        await fetch(`${API_BASE}/alerts/${id}/ack`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ acknowledged_by: 'operator' })
        });
      } catch (e) {
        console.error("ACK failed", e);
      } finally {
        setAlerts(prev => prev.map(alert => 
          alert.id === id ? { ...alert, acknowledged: true } : alert
        ));
      }
    };
    doAck();
  };

  const getAlertColor = (type) => {
    switch(type) {
      case 'CRITICAL': return 'bg-red-600/20 border-red-500';
      case 'HIGH': return 'bg-yellow-600/20 border-yellow-500';
      case 'MEDIUM': return 'bg-blue-600/20 border-blue-500';
      default: return 'bg-gray-600/20 border-gray-500';
    }
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'CRITICAL': return 'bg-red-600';
      case 'HIGH': return 'bg-yellow-600';
      case 'MEDIUM': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const newAlertsCount = alerts.filter(a => !a.acknowledged).length;

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    const wsUrl = (API_BASE.replace(/^http/, 'ws')) + '/ws/alerts';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // Expected shape: { type: 'new_alert'|'alert_updated', alert: {...} }
        if (msg && msg.alert) {
          const a = msg.alert;
          const incoming = {
            id: a.id,
            type: a.alert_type || a.type,
            title: a.title,
            description: a.description,
            location: a.location || a.grid_reference || "",
            confidence: a.confidence,
            timestamp: a.created_at || a.timestamp,
            acknowledged: a.status ? (a.status === 'ACKNOWLEDGED' || a.status === 'RESOLVED') : false
          };
          setAlerts(prev => {
            const existing = prev.find(x => x.id === incoming.id);
            const next = existing
              ? prev.map(x => x.id === incoming.id ? { ...x, ...incoming } : x)
              : [incoming, ...prev];
            return next;
          });
          voiceAnnounce(incoming);
        }
      } catch (e) {
        console.warn('WS parse error', e);
      }
    };
    ws.onerror = () => {};
    return () => {
      try { ws.close(); } catch {}
    };
  }, [API_BASE]);

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-sm">THREAT ALERTS</h3>
        <div className="ml-auto">
          <span className="bg-red-600 text-xs px-2 py-1 rounded text-white">{newAlertsCount} NEW</span>
        </div>
        <label className="ml-3 flex items-center gap-1 text-xs text-gray-300">
          <input type="checkbox" checked={voiceEnabled} onChange={e => setVoiceEnabled(e.target.checked)} />
          Voice
        </label>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs text-gray-300">
        <select
          className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
          value={selectedVoice}
          onChange={e => setSelectedVoice(e.target.value)}
          disabled={!webSpeechSupported}
          aria-label="Voice"
        >
          {voices.map(v => (
            <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
          ))}
          {voices.length === 0 && <option value="">Default</option>}
        </select>
        <div className="flex items-center gap-1">
          <span>Rate</span>
          <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={e => setRate(parseFloat(e.target.value))} disabled={!webSpeechSupported} />
        </div>
        <div className="flex items-center gap-1">
          <span>Pitch</span>
          <input type="range" min="0" max="2" step="0.1" value={pitch} onChange={e => setPitch(parseFloat(e.target.value))} disabled={!webSpeechSupported} />
        </div>
        <div className="flex items-center gap-1">
          <span>Vol</span>
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} disabled={!webSpeechSupported} />
        </div>
        <button
          type="button"
          className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
          onClick={() => speakWithWebSpeech('Voice check. Alerts will be announced.')} disabled={!webSpeechSupported || !voiceEnabled}
        >
          Test
        </button>
        <button
          type="button"
          className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
          onClick={stopSpeaking} disabled={!webSpeechSupported}
        >
          Stop
        </button>
      </div>
      
      <div className="text-xs text-gray-400 mb-3">Real-time AI-powered threat detection</div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div key={alert.id} className={`rounded-lg p-3 border ${getAlertColor(alert.type)} ${alert.acknowledged ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className={`px-2 py-1 text-xs rounded ${getAlertIcon(alert.type)} text-white`}>
                  {alert.type}
                </span>
                <span className="text-xs text-gray-400">{alert.timestamp}</span>
              </div>
              {!alert.acknowledged && (
                <button 
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-gray-300 transition-colors"
                >
                  ACK
                </button>
              )}
            </div>
            
            <div className="text-sm text-gray-200 font-medium mb-2">{alert.title}</div>
            <div className="text-xs text-gray-400 mb-2">{alert.description}</div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="text-gray-400">
                <span className="text-red-400">📍</span> {alert.location}
              </div>
              <div className="flex items-center gap-4">
                <div>
                  AI Confidence: <span className="text-green-400 font-mono">{alert.confidence}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
 export default ThreatAlerts;