import React, { useState, useEffect } from "react";
import apiService from "../services/api";

const StatusIndicator = ({ status, label, showBackendStatus = false }) => {
  const [backendStatus, setBackendStatus] = useState('OFFLINE');
  
  useEffect(() => {
    if (showBackendStatus) {
      const checkBackend = async () => {
        try {
          await apiService.getSystemStatus();
          setBackendStatus('ONLINE');
        } catch (error) {
          setBackendStatus('OFFLINE');
        }
      };
      
      checkBackend();
      const interval = setInterval(checkBackend, 5000);
      return () => clearInterval(interval);
    }
  }, [showBackendStatus]);

  const getStatusColor = (statusToCheck = status) => {
    switch(statusToCheck) {
      case 'ONLINE': return 'bg-green-500';
      case 'OFFLINE': return 'bg-red-500';
      case 'MAINTENANCE': return 'bg-yellow-500';
      case 'ACTIVE': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-xs text-cyan-300">{label}</span>
      {showBackendStatus && (
        <>
          <div className="w-1 h-1 rounded-full bg-slate-600"></div>
          <div className={`w-2 h-2 rounded-full ${getStatusColor(backendStatus)}`}></div>
          <span className="text-xs text-cyan-300">Backend</span>
        </>
      )}
    </div>
  );
};

export default StatusIndicator;