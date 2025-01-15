import React from 'react'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'



const generateTopSellingProducts = (start = new Date, end = new Date()) => {
  const products = [
    { id: '1', name: 'BAG BASKET RATTAN', category: 'Bags', totalSold: 0, revenue: 0, trend: 'stable' },
    { id: '2', name: 'FRUIT BASKET', category: 'Home', totalSold: 0, revenue: 0, trend: 'stable' },
    { id: '3', name: 'RATTAN FARMERS HAT', category: 'Accessories', totalSold: 0, revenue: 0, trend: 'stable' },
    { id: '4', name: 'BURI FARMERS HAT', category: 'Accessories', totalSold: 0, revenue: 0, trend: 'stable' },
    { id: '5', name: 'PICNIC BASKET', category: 'Home', totalSold: 0, revenue: 0, trend: 'stable' },
  ]

  const dayRange = (end.getTime() - start.getTime()) / (1000 * 3600 * 24)

  return products.map(product => ({
    ...product,
    totalSold: Math.floor(Math.random() * 100 * dayRange),
    revenue: Math.floor(Math.random() * 10000 * dayRange),
    trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)]
  })).sort((a, b) => b.totalSold - a.totalSold)
}

export default function TopSellingProducts({ dateRange, salesByItemArray }) {
  const topProducts = generateTopSellingProducts(dateRange.start, dateRange.end)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="pb-4">
        <h2 className="text-xl font-semibold text-gray-800">Top Selling Products</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="font-semibold text-gray-600 px-4 py-2 text-left">Product Name</th>
              <th className="font-semibold text-gray-600 px-4 py-2 text-right">Total Sold</th>
              <th className="font-semibold text-gray-600 px-4 py-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {salesByItemArray.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="font-medium text-gray-900 px-4 py-2">{product.name}</td>
                <td className="text-right px-4 py-2">{product.value}</td>
                <td className="text-right px-4 py-2">₱{product.revenue.toLocaleString()}</td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="font-semibold bg-gray-100">
              <td className="text-left px-4 py-2">Total</td>
              <td className="text-right px-4 py-2">
                {salesByItemArray.reduce((total, product) => total + product.value, 0)}
              </td>
              <td className="text-right px-4 py-2">
                ₱
                {salesByItemArray.reduce((total, product) => total + product.revenue, 0).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  )
}
