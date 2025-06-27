import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TotalCountsBarChart = ({ data, title = "System Overview" }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props) => {
    const { x, y, width, height, index } = props;
    const dataPoint = data[index];
    
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={dataPoint.color}
        rx={4}
        ry={4}
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              shape={<CustomBar />}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div 
              className="w-3 h-3 rounded-full mx-auto mb-1"
              style={{ backgroundColor: item.color }}
            />
            <p className="text-xs text-gray-600">{item.name}</p>
            <p className="text-sm font-semibold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TotalCountsBarChart; 