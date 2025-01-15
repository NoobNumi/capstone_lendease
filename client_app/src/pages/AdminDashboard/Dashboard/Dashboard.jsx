
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { AiOutlineStock } from "react-icons/ai";
import { IoCubeSharp } from "react-icons/io5";
import { MdPoll } from "react-icons/md";
import { TfiReceipt } from "react-icons/tfi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { bardata, pieColors, pieData } from "../../../../assets/data/chartData";
import { formatPrice } from "../../../../utils/formatPrice";

import axios from "axios";

import Datepicker from "react-tailwindcss-datepicker";
import moment from 'moment-timezone'; // Import moment-timezone



import SalesAndInventoryDashboard from './sales-inventory-dashboard'; // Import moment-timezone

const SalesLineChart = ({ data }) => {
  // Detect if sales are increasing or decreasing
  const isIncreasing = data.length > 1 && data[data.length - 1].totalSales > data[data.length - 2].totalSales;

  return (
    <div>
      {/* <h2>Total Sales Over Time</h2>
      <h3 style={{ color: isIncreasing ? 'green' : 'red' }}>
        Sales are {isIncreasing ? 'Increasing' : 'Decreasing'}
      </h3> */}
      <h2>Total Sales Over Time</h2>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" /> {/* Using the date field */}
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
          <defs>
            <linearGradient id="colorTotal" x1="0" y0="0" x1="0" y1="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
const Dashboard = () => {
  const [selectedDate, setValue] = useState({
    startDate: new Date(), // Set your default date here
    endDate: new Date(),
  });

  const [reportData, setReportData] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [salesData, setSalesData] = useState([]);

  const fetchReport = async () => {
    let res = await axios({
      method: 'POST',
      url: 'admin/orders/report',
      data: {
        selectedDate: selectedDate
      }
    });
    let data = res.data.data;

    setReportData(data)
    setIsLoaded(true)
    const transformedData = [
      {
        date: new Date(selectedDate.startDate).toLocaleDateString(), // Format date for x-axis
        totalOrders: data.totalOrders,
        totalSales: data.totalSales,
      },
    ];
    setSalesData(transformedData);
  };
  useEffect(() => {
    fetchReport();
  }, [selectedDate]);



  return isLoaded && <section className="h-full w-full bg-[#f3f4fa] px-[4%] pt-7 md:px-5">
    {/* Change page title */}
    <Helmet>
      <title>Dashboard - HandiHub Shop</title>
    </Helmet>
    {/* cards container */}

    <div className="grid grid-cols-6 gap-4 mb-5">
      <div>

        <Datepicker
          showShortcuts={true}

          placeholder="Select Date" value={selectedDate}
          onChange={newValue => {
            setValue(newValue)

            console.log(moment.tz(new Date(selectedDate.startDate), 'Asia/Manila').toDate())
          }} />

      </div>
    </div>

    <div className="grid grid-cols-12 gap-6">


      <div className="col-span-12 flex justify-between gap-2 bg-white p-8 shadow-sm lg:col-span-4">

        <div>
          <IoCubeSharp size={40} color="#ff5630" />
          {/* <p className="mt-6 text-sm text-gray-400">Since Last Month</p> */}
        </div>
        <div>
          <p className="mb-2 text-sm text-gray-400">Total Orders</p>


          <h3 className="text-[27px] font-medium">{reportData.totalOrders}</h3>
        </div>
      </div>

      <div className="col-span-12 flex justify-between gap-2 bg-white p-8 shadow-sm lg:col-span-4">
        <div>
          <MdPoll size={40} color="#36b37e" />
          {/* <p className="mt-6 text-sm text-gray-400">Since Last Month</p> */}
        </div>
        <div>
          <p className="mb-2 text-sm text-gray-400">Total Sales (excluding shipping fee)</p>
          <h3 className="text-[27px] font-medium">{formatPrice(reportData.totalSales)}</h3>
        </div>
      </div>
    </div>

    {/* Charts container */}
    <div className="max-h-[calc(100vh-5 00px)] grid h-full w-full grid-cols-12 gap-6 lg:max-h-[calc(100vh-300px)]">
      {/* Bar Chart */}
      <div className="col-span-12 mt-6 h-full max-h-[calc(100vh-500px)] w-full bg-white p-4 lg:col-span-8 lg:max-h-[calc(100vh-300px)]">
        {/* <p className="mb-2 text-sm">Total Growth</p>
      <h4 className="mb-8 flex items-center gap-1 text-xl font-semibold">
        <AiOutlineStock size={22} className="text-green-400" />
        2,324
      </h4> */}
        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height="100%">
          <SalesLineChart data={reportData.totalArraySales} />
          {/* <BarChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Bar dataKey="totalSales" fill="#82ca9d" name="Total Sales" />
        </BarChart> */}
          {/* <BarChart
            width={500}
            height={300}
            data={bardata}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeWidth="0.5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar dataKey="Sales" stackId="a" fill="#36b37e" />

          </BarChart> */}
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      {/* <div className="col-span-12 mt-6 h-full max-h-[calc(100vh-400px)] w-full bg-white p-4 lg:col-span-4 lg:max-h-[calc(100vh-300px)]">
        <p className="mb-8 text-sm">Top Sales:</p>
        <div className="flex h-full w-full items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={500} height={300}>
              <Pie
                data={pieData}
                cx={120}
                cy={200}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div> */}
    </div>
  </section >



};
const DashboardFinal = () => {
  return <SalesAndInventoryDashboard />
}
export default DashboardFinal;
