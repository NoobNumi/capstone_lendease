import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, eachDayOfInterval } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BsPeople, BsCartCheck, BsHourglassSplit, BsBarChart } from "react-icons/bs";
const SalesOverview = ({ dateRange }) => {
  const [salesData, setSalesData] = useState([]);  // State to hold sales data
  const [loading, setLoading] = useState(true);     // State to handle loading state
  const [error, setError] = useState(null);         // State to handle error state

  // Function to format the API data to match the structure of generateSalesData
  const formatSalesData = (data) => {
    return data.map((item) => ({
      date: format(new Date(item.date), 'yyyy-MM-dd'),  // Format date to 'yyyy-MM-dd'
      sales: item.totalSales, // Use the quantity as the sales number
    }));
  };

  // Fetch sales data from the API
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get('/orders/stats/sales-overview', {
          params: {
            startDate: dateRange.start,
            endDate: dateRange.end,
          },
        });
        const formattedData = formatSalesData(response.data.salesData);  // Format the API response

        // console.log({ formattedData })
        setSalesData(formattedData);  // Store formatted data in state
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();  // Call the function when the component mounts
  }, [dateRange.start, dateRange.end]);  // Dependency array ensures effect is triggered on startDate or endDate change








  return (
    <div className="bg-white rounded-lg shadow-sm p-6">

      <div className="pb-4">
        <h2 className="text-xl font-semibold text-gray-800">Sales Overview</h2>
      </div>
      <div className="w-full">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              stroke="#94a3b8"
            />
            <YAxis stroke="#94a3b8" />
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
              labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
            />
            <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#salesGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesOverview;
