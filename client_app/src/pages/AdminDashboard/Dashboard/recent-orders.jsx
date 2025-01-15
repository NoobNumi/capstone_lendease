import React, { useState, useEffect } from 'react';
import { format, isWithinInterval } from "date-fns";



const recentOrders = [
  {
    id: "670f7b007a982b309e5a257b",
    date: "2024-10-16",
    customer: "Customer HandiHub",
    total: 370,
    status: "delivered",
  },
  {
    id: "671058792f81e20cdd8cdc82",
    date: "2024-10-17",
    customer: "Customer HandiHub",
    total: 120,
    status: "delivered",
  },
  {
    id: "671059162f81e20cdd8cdc84",
    date: "2024-10-17",
    customer: "Customer HandiHub",
    total: 620,
    status: "delivered",
  },
  {
    id: "67107aa4329bb203aea2b439",
    date: "2024-10-17",
    customer: "Customer HandiHub",
    total: 370,
    status: "delivered",
  },
  {
    id: "670f2b6e650f0e9f9bef9e87",
    date: "2024-10-16",
    customer: "Customer HandiHub",
    total: 370,
    status: "processing",
  },
];

export default function RecentOrders({ dateRange, salesData }) {
  const filteredOrders = recentOrders.filter((order) =>
    isWithinInterval(new Date(order.date), {
      start: dateRange.start,
      end: dateRange.end,
    }),
  );


  const totalQuantity = salesData.reduce((acc, order) => acc + order.totalQuantity, 0);
  const totalSales = salesData.reduce((acc, order) => acc + order.sales, 0);
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="pb-4">
        <h2 className="text-xl font-semibold text-gray-800"> Orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              {/* <th className="px-4 py-2 text-left font-semibold text-gray-600">
                Order ID
              </th> */}
              <th className="px-4 py-2 text-left font-semibold text-gray-600">
                Date
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">
                Total Quantity Sold
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">
                Total Sales
              </th>
              {/* <th className="px-4 py-2 text-left font-semibold text-gray-600">
                Status
              </th> */}
            </tr>
          </thead>
          <tbody>
            {salesData.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-2">
                  {format(new Date(order.date), "MMM dd, yyyy")}
                </td>
                <td className="px-4 py-2">{order.totalQuantity}</td>
                <td className="px-4 py-2">₱{order.sales.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="font-semibold text-gray-900 bg-gray-100">
              <td className="px-4 py-2">Total</td>
              <td className="px-4 py-2">{totalQuantity}</td>
              <td className="px-4 py-2">₱{totalSales.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
