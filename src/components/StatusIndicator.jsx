import React from "react";

const StatusIndicator = ({ status, label }) => {
  const getStatusColor = () => {
    switch(status) {
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
    </div>
  );
};

export default StatusIndicator;