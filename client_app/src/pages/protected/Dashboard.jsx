import { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Dashboard from '../../features/dashboard/index';
import { LineChart, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

import { FaCheckCircle } from 'react-icons/fa'; // Add any icons you want to use
import axios from 'axios';
import { format, startOfToday } from 'date-fns';
import { formatAmount } from './../../features/dashboard/helpers/currencyFormat';

import DatePicker from "react-tailwindcss-datepicker";
import { DateTime } from 'luxon';

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../pages/protected/DataTables/Table'; // new


import * as XLSX from 'xlsx';
import { useNavigate } from "react-router-dom";


import SalesAndInventoryDashboard from './../AdminDashboard/Dashboard/sales-inventory-dashboard';

function InternalPage() {
  const dispatch = useDispatch();
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  // Set today's date as default for the DatePicker
  const today = startOfToday(); // Get today's date
  const [value, setValue] = useState({
    startDate: today,
    endDate: today
  });

  const navigate = useNavigate();
  const [resultData, setResultData] = useState([]);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const handleFilterClick = () => {
    setDropdownVisible((prev) => !prev);
  };

  const handleFilterChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedFilter(selectedValue);
    // Perform any filtering action here based on selectedValue
    console.log('Selected Filter:', selectedValue);
    // Optionally close the dropdown after selection
    // setDropdownVisible(false);
  };

  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/admin/loan/dashboard-stats');
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Dashboard' }));
    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const stats = dashboardStats?.stats || {};
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Create pieData array
  const pieData = [
    { name: 'Pending', value: stats.pending_loans || 0 },
    { name: 'Approved', value: stats.approved_loans || 0 },
    { name: 'Disbursed', value: stats.disbursed_loans || 0 }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Loans"
          value={stats.total_loans || 0}
          icon="📊"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Borrowers"
          value={stats.total_borrowers || 0}
          icon="👥"
          color="bg-green-500"
        />
        <StatCard
          title="Total Disbursed"
          value={formatAmount(stats.total_disbursed_amount || 0)}
          icon="💰"
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Collected"
          value={formatAmount(stats.total_collected_amount || 0)}
          icon="💵"
          color="bg-purple-500"
        />
      </div>

      {/* Loan Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Loan Status Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Disbursements Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Monthly Disbursements</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardStats.monthlyDisbursements || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => format(new Date(value), 'MMM yy')}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatAmount(value)}
                  labelFormatter={(value) => format(new Date(value), 'MMMM yyyy')}
                />
                <Area
                  type="monotone"
                  dataKey="total_amount"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payment Collection Trends */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Payment Collection Trends</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dashboardStats.paymentStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(value) => format(new Date(value), 'MMM yy')}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => formatAmount(value)}
                labelFormatter={(value) => format(new Date(value), 'MMMM yyyy')}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_amount"
                name="Collection Amount"
                stroke="#82ca9d"
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Number of Payments"
                stroke="#8884d8"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>
      <div className={`${color} text-white p-3 rounded-full`}>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  </div>
);

export default InternalPage;
