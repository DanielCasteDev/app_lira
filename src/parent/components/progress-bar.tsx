import React from "react";

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  color = "bg-blue-500", 
  height = "h-2" 
}) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full ${height}`}>
      <div
        className={`${color} rounded-full ${height}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;