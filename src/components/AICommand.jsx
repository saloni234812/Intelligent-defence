import { useState } from "react";
import { Shield, Radar, Camera, AlertTriangle, Eye, Lock, Send, CheckCircle, Clock, Zap} from "lucide-react";
import apiService from "../services/api";

const AICommand = () => {
  const [command, setCommand] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'AEGIS Defense System online. Ready for commands. Type "help" for available operations.', type: 'system', time: '14:20:15' },
    { id: 2, text: 'status report on sector 7', type: 'user', time: '14:21:30' },
    { id: 3, text: 'Sector 7 Status: 1 critical threat detected at Grid 34.2N, 118.1W. Unauthorized vehicle identified. UAV-ALPHA dispatched for reconnaissance. Recommend patrol unit intercept.', type: 'system', time: '14:21:32' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: command,
      type: 'user',
      time: new Date().toLocaleTimeString('en-US', { hour12: false })
    };

    setMessages(prev => [...prev, newMessage]);
    setLoading(true);

    try {
      // Send command to AI API
      const response = await apiService.sendAICommand(command);
      
      const systemResponse = {
        id: messages.length + 2,
        text: response.message || 'Command acknowledged. Processing tactical analysis...',
        type: 'system',
        time: new Date().toLocaleTimeString('en-US', { hour12: false })
      };
      setMessages(prev => [...prev, systemResponse]);
    } catch (error) {
      console.error('AI command failed:', error);
      const errorResponse = {
        id: messages.length + 2,
        text: 'Command processing failed. Please try again.',
        type: 'system',
        time: new Date().toLocaleTimeString('en-US', { hour12: false })
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
      setCommand('');
    }
  };

  const suggestions = ['"deploy patrol to sector 7"', '"lockdown zone"', '"threat assessment"'];

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-sm">AI COMMAND</h3>
        <div className="ml-auto">
          <span className="bg-green-600 text-xs px-2 py-1 rounded text-white">AEGIS</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mb-3">Natural language tactical operations</div>
      
      <div className="bg-slate-900 border border-slate-600 rounded p-3 h-48 overflow-y-auto mb-3">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>{msg.type === 'system' ? '🤖 SYSTEM' : '👤 OPERATOR_01'}</span>
              <span>{msg.time}</span>
            </div>
            <div className={`text-sm ${msg.type === 'system' ? 'text-cyan-300' : 'text-gray-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter tactical command..."
          className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      
      <div className="mt-2 text-xs text-gray-400">
        Try: {suggestions.map((suggestion, index) => (
          <span key={index}>
            <button 
              onClick={() => setCommand(suggestion.slice(1, -1))}
              className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              {suggestion}
            </button>
            {index < suggestions.length - 1 && ', '}
          </span>
        ))}
      </div>
    </div>
  );
};
export default AICommand;