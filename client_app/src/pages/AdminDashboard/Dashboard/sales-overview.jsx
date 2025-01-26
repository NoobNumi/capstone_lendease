import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LoanInterestIncomeOverview = ({ dateRange }) => {
  const [loanInterestData, setLoanInterestData] = useState([]);  // State to hold loan interest data
  const [loading, setLoading] = useState(true);     // State to handle loading state
  const [error, setError] = useState(null);         // State to handle error state

  // Function to format the API data to match the structure of generateSalesData
  const formatLoanInterestData = (data) => {
    return data.map((item) => ({
      date: format(new Date(item.date), 'yyyy-MM-dd'),  // Format date to 'yyyy-MM-dd'
      "Total Interest Income": item.totalInterestIncome, // Assuming the API provides this field
    }));
  };

  // Fetch loan interest income data from the API
  useEffect(() => {
    const fetchLoanInterestIncome = async () => {
      try {
        const response = await axios.get('/admin_stats/statistics/loan_interest_income', {
          params: {
            startDate: dateRange.start,
            endDate: dateRange.end,
          },
        });

        // Assuming the response contains data in this structure
        const formattedData = formatLoanInterestData(response.data.data);  // Format the API response

        console.log({ formattedData })
        setLoanInterestData(formattedData);  // Store formatted data in state
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchLoanInterestIncome();  // Call the function when the component mounts
  }, [dateRange.start, dateRange.end]);  // Dependency array ensures effect is triggered on startDate or endDate change


  console.log({ loanInterestData })
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="pb-4">
        <h2 className="text-xl font-semibold text-gray-800">Loan Interest Income Overview</h2>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div className="w-full">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={loanInterestData}>
            <defs>
              <linearGradient id="interestIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
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
            <Area
              type="monotone"
              dataKey="Total Interest Income"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#interestIncomeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LoanInterestIncomeOverview;
