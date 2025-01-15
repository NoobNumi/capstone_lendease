import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const initialInventoryData = [
  { name: 'BAG BASKET RATTAN', value: 10 },
  { name: 'FRUIT BASKET', value: 5 },
  { name: 'RATTAN FARMERS HAT', value: 15 },
  { name: 'BURI FARMERS HAT', value: 8 },
  { name: 'PICNIC BASKET', value: 12 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE'];



export default function InventoryOverview({ dateRange, salesByItemArray }) {
  const [inventoryData, setInventoryData] = useState([]);

  useEffect(() => {
    // Simulate inventory data changes based on date range
    // const updatedData = initialInventoryData.map(item => ({
    //   ...item,
    //   value: Math.floor(Math.random() * 20) + 5, // Random inventory between 5 and 25
    // }));
    setInventoryData(salesByItemArray);
  }, [dateRange, salesByItemArray]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="pb-4">
        <h2 className="text-xl font-semibold text-gray-800">Inventory Overview</h2>
      </div>
      <div>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={inventoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {inventoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
