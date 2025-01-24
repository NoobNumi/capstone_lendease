import React, { useState, useEffect } from "react";
import SalesOverview from "./sales-overview";
import DateRangeFilter from "./date-range-filter";
import { BsHourglassSplit, BsCheckCircle, BsXCircle, BsBarChart, BsPeople } from "react-icons/bs"; // Adjust icons as needed
import axios from "axios";
import { format } from "date-fns";

export default function SalesInventoryDashboard() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 365)),
    end: new Date(),
  });

  const handleDateRangeChange = (start, end) => {
    setDateRange({ start, end });
  };

  const [statsData, setStatsData] = useState({
    loanStats: [],
    totalBorrowers: 0,
    disbursementStats: { totalDisbursed: 0 },
  });


  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/admin_stats/statistics", {
          params: {
            startDate: format(dateRange.start, "yyyy-MM-dd"),
            endDate: format(dateRange.end, "yyyy-MM-dd"),
          },
        });
        setStatsData(response.data.data);
        setIsLoaded(true)
      } catch (err) {
        console.error("Error fetching stats:", err.message);
      }
    };

    fetchStats();
  }, [dateRange.end, dateRange.start]);

  // Map loan status to icons and background colors
  const loanStatusConfig = {
    Pending: {
      icon: <BsHourglassSplit className="text-yellow-500 text-4xl" />,
      bgColor: "bg-yellow-100",
    },
    Approved: {
      icon: <BsCheckCircle className="text-green-500 text-4xl" />,
      bgColor: "bg-green-100",
    },
    Rejected: {
      icon: <BsXCircle className="text-red-500 text-4xl" />,
      bgColor: "bg-red-100",
    },
    Default: {
      icon: <BsBarChart className="text-gray-500 text-4xl" />,
      bgColor: "bg-gray-100",
    },
  };

  return isLoaded && (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Loan Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">

          <div
            key={`011`}
            className={`flex items-center p-4 rounded-lg shadow-md bg-blue-100`}
          >
            <div className="mr-4"><BsPeople className="text-blue-500 text-4xl" /></div>
            <div>

              <p className="text-gray-500 font-bold">{statsData.totalBorrowers} Borrower</p>

            </div>
          </div>

          {statsData.loanStats.map((stat, index) => {
            const config = loanStatusConfig[stat.loan_status] || loanStatusConfig.Default;
            return (
              <div
                key={index}
                className={`flex items-center p-4 rounded-lg shadow-md ${config.bgColor}`}
              >
                <div className="mr-4">{config.icon}</div>
                <div>

                  <p className="text-gray-500 font-bold">{stat.count || 0} {stat.loan_status}</p>
                  <p className="text-gray-900 text-sm font-bold">
                    ₱{stat.totalAmount ? stat.totalAmount.toLocaleString() : "0.00"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Date Range Filter */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <DateRangeFilter setDateRange={setDateRange} onFilterChange={handleDateRangeChange} />
        </div>

        {/* Other Sections */}
        <div className="space-y-8">
          <SalesOverview dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>
    </div>
  );
}
