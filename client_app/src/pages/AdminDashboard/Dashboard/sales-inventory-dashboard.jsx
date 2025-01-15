import React, { useState, useEffect } from "react";
import SalesOverview from "./sales-overview";
import InventoryOverview from "./inventory-overview";
import RecentOrders from "./recent-orders";
import DateRangeFilter from "./date-range-filter";
import TopSellingProducts from "./top-selling-products";

import { BsPeople, BsCartCheck, BsHourglassSplit, BsBarChart } from "react-icons/bs";

import axios from 'axios';

import { format, eachDayOfInterval } from 'date-fns';

export default function SalesInventoryDashboard() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date(),
  });

  const handleDateRangeChange = (start, end) => {
    setDateRange({ start, end });
  };

  const [activeTab, setActiveTab] = useState("sales");


  const [statsData, setStatsData] = useState({}); // State to store stats


  // Fetch stats data from the API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/orders/stats/main-overview', {
          params: {
            startDate: dateRange.start,
            endDate: dateRange.end,
          },
        });
        setStatsData(response.data.data);
      } catch (err) {
        //setError(err.message);
      } finally {
        //setLoading(false);
      }
    };

    fetchStats();
  }, [dateRange.end, dateRange.start]);



  // Map the data to the card configuration
  //dex
  const stats = [
    {
      id: 1,
      label: "Active Borrowers",
      value: statsData.totalCustomers || 0, // Replace with actual field name
      icon: <BsPeople className="text-blue-500 text-4xl" />,
      bgColor: "bg-blue-100",
    },
    {
      id: 2,
      label: "Completed Loans",
      value: statsData.completedOrders || 0, // Replace with actual field name
      icon: <BsCartCheck className="text-green-500 text-4xl" />,
      bgColor: "bg-green-100",
    },
    {
      id: 3,
      label: "Pending Application",
      value: statsData.pendingOrders || 0, // Replace with actual field name
      icon: <BsHourglassSplit className="text-yellow-500 text-4xl" />,
      bgColor: "bg-yellow-100",
    },
    {
      id: 4,
      label: "Total Loans",
      value: statsData.totalOversales ? `₱${statsData.totalOversales.toLocaleString()}` : "₱0",
      icon: <BsBarChart className="text-purple-500 text-4xl" />,
      bgColor: "bg-purple-100",
    },
  ];





  const [salesData, setSalesData] = useState([]);
  const [salesByItemArray, setSalesByItemArray] = useState([]);

  const formatSalesData = (data) => {
    return data.map((item) => ({
      ...item,
      date: format(new Date(item.date), 'yyyy-MM-dd'),  // Format date to 'yyyy-MM-dd'
      sales: item.totalSales, // Use the quantity as the sales number
    }));
  };

  useEffect(() => {
    const fetchSalesData = async () => {

      const response = await axios.get('/orders/stats/sales-overview', {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      });
      const formattedData = formatSalesData(response.data.salesData);  // Format the API response

      // console.log({ formattedData })
      setSalesData(formattedData);  // Store formatted data in state
      setSalesByItemArray(response.data.salesByItemArray)
    };

    fetchSalesData();  // Call the function when the component mounts
  }, [dateRange.start, dateRange.end]);  // Dependency array ensures effect is triggered on startDate or endDate change



  console.log({ salesData })


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* <h1 className="mb-8 text-4xl font-bold text-gray-800">
          Sales and Inventory Report
        </h1> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className={`flex items-center p-4 rounded-lg shadow-md ${stat.bgColor}`}
            >
              <div className="mr-4">{stat.icon}</div>
              <div>
                <p className="text-gray-700 font-bold text-lg">{stat.value}</p>
                <p className="text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <DateRangeFilter
            setDateRange={setDateRange}

            onFilterChange={handleDateRangeChange} />
        </div>

        <div className="space-y-8">
          <div className="flex rounded-lg bg-white p-1 shadow-sm">
            <button
              className={`px-6 py-3 text-sm font-medium ${activeTab === "sales"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
                } rounded-lg focus:outline-none`}
              onClick={() => setActiveTab("sales")}
            >
              Profit
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${activeTab === "inventory"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
                } rounded-lg focus:outline-none`}
              onClick={() => setActiveTab("inventory")}
            >
              Disbursement
            </button>
          </div>

          {activeTab === "sales" && (
            <div className="space-y-8">
              <SalesOverview dateRange={dateRange}

                setDateRange={setDateRange}
              />
              {/* <RecentOrders


                dateRange={dateRange} salesData={salesData} /> */}
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-8">
              <InventoryOverview
                setDateRange={setDateRange}
                dateRange={dateRange}

                salesByItemArray={salesByItemArray

                }
              />
              <TopSellingProducts dateRange={dateRange}
                salesByItemArray={salesByItemArray} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
