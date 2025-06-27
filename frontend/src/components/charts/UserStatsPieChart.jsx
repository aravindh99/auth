import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const UserStatsPieChart = ({ verifiedUsers, unverifiedUsers, title = "User Verification Status" }) => {
  const data = [
    { name: 'Verified Users', value: verifiedUsers, color: '#032677' },
    { name: 'Unverified Users', value: unverifiedUsers, color: '#55617d' }
  ];

  const totalUsers = verifiedUsers + unverifiedUsers;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalUsers > 0 ? ((data.value / totalUsers) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {data.value} users
          </p>
          <p className="text-xs text-gray-500">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <div className="flex justify-center space-x-4 mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-700">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center">
        <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
        <p className="text-sm text-gray-500">Total Users</p>
      </div>
    </div>
  );
};

export default UserStatsPieChart; 