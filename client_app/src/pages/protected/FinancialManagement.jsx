import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TitleCard from '../../components/Cards/TitleCard';
import { showNotification } from '../../features/common/headerSlice';
import { formatAmount } from '../../features/dashboard/helpers/currencyFormat';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import DocumentDownloadIcon from '@heroicons/react/24/outline/ArrowDownLeftIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import ExclamationCircleIcon from '@heroicons/react/24/outline/ExclamationCircleIcon';
import Table from '../../pages/protected/DataTables/Table';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const FinancialManagement = () => {
  const dispatch = useDispatch();

  // State for date filters
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));

  // State for dashboard data
  const [overview, setOverview] = useState(null);
  const [moneyIn, setMoneyIn] = useState({ payments: [], summary: null, pagination: { page: 1, limit: 10 } });
  const [moneyOut, setMoneyOut] = useState({ disbursements: [], summary: null, pagination: { page: 1, limit: 10 } });
  const [interestData, setInterestData] = useState({ overTime: [], byLoanType: [], total: 0 });
  const [outstandingLoans, setOutstandingLoans] = useState({ loans: [], summary: null, pagination: { page: 1, limit: 10 } });

  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');

  // State for loading status
  const [loading, setLoading] = useState({
    overview: false,
    moneyIn: false,
    moneyOut: false,
    interest: false,
    outstanding: false
  });

  // Function to load financial overview data
  const loadOverview = async () => {
    setLoading(prev => ({ ...prev, overview: true }));
    try {
      const response = await axios.get('/admin_reports/financial-overview', {
        params: { startDate, endDate }
      });

      if (response.data.success) {
        setOverview(response.data.data);
      } else {
        dispatch(showNotification({ message: 'Failed to load overview data', type: 'error' }));
      }
    } catch (error) {
      console.error('Error loading overview data:', error);
      dispatch(showNotification({ message: 'Error loading overview data', type: 'error' }));
    } finally {
      setLoading(prev => ({ ...prev, overview: false }));
    }
  };

  // Function to load money in (repayments) data
  const loadMoneyIn = async (page = 1) => {
    setLoading(prev => ({ ...prev, moneyIn: true }));
    try {
      const response = await axios.get('/admin_reports/money-in', {
        params: { startDate, endDate, page, limit: 10 }
      });

      if (response.data.success) {
        setMoneyIn(response.data.data);
      } else {
        dispatch(showNotification({ message: 'Failed to load repayment data', type: 'error' }));
      }
    } catch (error) {
      console.error('Error loading repayment data:', error);
      dispatch(showNotification({ message: 'Error loading repayment data', type: 'error' }));
    } finally {
      setLoading(prev => ({ ...prev, moneyIn: false }));
    }
  };

  // Function to load money out (disbursements) data
  const loadMoneyOut = async (page = 1) => {
    setLoading(prev => ({ ...prev, moneyOut: true }));
    try {
      const response = await axios.get('/admin_reports/money-out', {
        params: { startDate, endDate, page, limit: 10 }
      });

      if (response.data.success) {
        setMoneyOut(response.data.data);
      } else {
        dispatch(showNotification({ message: 'Failed to load disbursement data', type: 'error' }));
      }
    } catch (error) {
      console.error('Error loading disbursement data:', error);
      dispatch(showNotification({ message: 'Error loading disbursement data', type: 'error' }));
    } finally {
      setLoading(prev => ({ ...prev, moneyOut: false }));
    }
  };

  // Function to load interest earned data
  const loadInterestData = async () => {
    setLoading(prev => ({ ...prev, interest: true }));
    try {
      const response = await axios.get('/admin_reports/interest-earned', {
        params: { startDate, endDate, groupBy: 'month' }
      });

      if (response.data.success) {
        setInterestData(response.data.data);
      } else {
        dispatch(showNotification({ message: 'Failed to load interest data', type: 'error' }));
      }
    } catch (error) {
      console.error('Error loading interest data:', error);
      dispatch(showNotification({ message: 'Error loading interest data', type: 'error' }));
    } finally {
      setLoading(prev => ({ ...prev, interest: false }));
    }
  };

  // Function to load outstanding loans data
  const loadOutstandingLoans = async (page = 1, sortBy = 'dueDate', order = 'asc') => {
    setLoading(prev => ({ ...prev, outstanding: true }));
    try {
      const response = await axios.get('/admin_reports/outstanding-loans', {
        params: { page, limit: 10, sortBy, order }
      });

      if (response.data.success) {
        setOutstandingLoans(response.data.data);
      } else {
        dispatch(showNotification({ message: 'Failed to load outstanding loans', type: 'error' }));
      }
    } catch (error) {
      console.error('Error loading outstanding loans:', error);
      dispatch(showNotification({ message: 'Error loading outstanding loans', type: 'error' }));
    } finally {
      setLoading(prev => ({ ...prev, outstanding: false }));
    }
  };

  // Function to generate financial report
  const generateReport = async (format = 'csv') => {
    try {
      const response = await axios.get('/admin_reports/financial-report', {
        params: { startDate, endDate, format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        // Create a blob URL and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `financial_report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        dispatch(showNotification({ message: 'Report generated successfully', type: 'success' }));
      }
    } catch (error) {
      console.error('Error generating report:', error);
      dispatch(showNotification({ message: 'Error generating report', type: 'error' }));
    }
  };

  // Load all data when date range changes
  useEffect(() => {
    if (activeTab === 'overview') loadOverview();
    if (activeTab === 'moneyIn') loadMoneyIn();
    if (activeTab === 'moneyOut') loadMoneyOut();
    if (activeTab === 'interest') loadInterestData();
    if (activeTab === 'outstanding') loadOutstandingLoans();
  }, [startDate, endDate, activeTab]);

  // Load initial data on component mount
  useEffect(() => {
    loadOverview();
  }, []);

  // Define columns for the money in table
  const moneyInColumns = [
    {
      Header: 'Payment ID',
      accessor: 'payment_id',
    },
    {
      Header: 'Borrower',
      accessor: row => `${row.first_name} ${row.last_name}`,
    },
    {
      Header: 'Amount',
      accessor: 'payment_amount',
      Cell: ({ value }) => formatAmount(value)
    },
    {
      Header: 'Date',
      accessor: 'payment_date',
      Cell: ({ value }) => moment(value).format('YYYY-MM-DD')
    },
    {
      Header: 'Method',
      accessor: 'payment_method',
    },
    {
      Header: 'Reference',
      accessor: 'reference_number',
    }
  ];

  // Define columns for the money out table
  const moneyOutColumns = [
    {
      Header: 'Loan ID',
      accessor: 'loan_id',
    },
    {
      Header: 'Recipient',
      accessor: row => `${row.first_name} ${row.last_name}`,
    },
    {
      Header: 'Amount',
      accessor: 'amount',
      Cell: ({ value }) => formatAmount(value)
    },
    {
      Header: 'Date',
      accessor: 'disbursement_date',
      Cell: ({ value }) => moment(value).format('YYYY-MM-DD')
    },
    {
      Header: 'Method',
      accessor: 'payment_method',
    },
    {
      Header: 'Channel',
      accessor: 'payment_channel',
    }
  ];

  // Define columns for the outstanding loans table
  const outstandingColumns = [
    {
      Header: 'Loan ID',
      accessor: 'loan_application_id',
    },
    {
      Header: 'Borrower',
      accessor: row => `${row.first_name} ${row.last_name}`,
    },
    {
      Header: 'Remaining Balance',
      accessor: 'remainingBalance',
      Cell: ({ value }) => formatAmount(value)
    },
    {
      Header: 'Next Payment Due',
      accessor: 'nextPaymentDue',
      Cell: ({ value }) => moment(value).format('YYYY-MM-DD')
    },
    {
      Header: 'Days Overdue',
      accessor: 'daysOverdue',
      Cell: ({ value }) => {
        if (value <= 0) return <span className="text-green-500">On time</span>;
        if (value <= 7) return <span className="text-yellow-500">{value} days</span>;
        if (value <= 30) return <span className="text-orange-500">{value} days</span>;
        return <span className="text-red-500">{value} days</span>;
      }
    },
    {
      Header: 'Monthly Payment',
      accessor: 'monthlyPayment',
      Cell: ({ value }) => formatAmount(value)
    }
  ];

  return (
    <div>
      {/* Date Filter Section */}
      <TitleCard title="Financial Management" topMargin="mt-2">
        <div className="flex flex-wrap items-center pb-4">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              className="input input-bordered input-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 ml-4 mb-2 md:mb-0">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              className="input input-bordered input-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            className="btn btn-sm btn-primary ml-4"
            onClick={() => {
              if (activeTab === 'overview') loadOverview();
              if (activeTab === 'moneyIn') loadMoneyIn();
              if (activeTab === 'moneyOut') loadMoneyOut();
              if (activeTab === 'interest') loadInterestData();
              if (activeTab === 'outstanding') loadOutstandingLoans();
            }}
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" /> Refresh
          </button>
          <button
            className="btn btn-sm btn-success ml-4"
            onClick={() => generateReport('csv')}
          >
            <DocumentDownloadIcon className="h-4 w-4 mr-1" /> Export Report
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs tabs-boxed mb-4">
          <button
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'moneyIn' ? 'tab-active' : ''}`}
            onClick={() => {
              setActiveTab('moneyIn');
              loadMoneyIn();
            }}
          >
            Money In
          </button>
          <button
            className={`tab ${activeTab === 'moneyOut' ? 'tab-active' : ''}`}
            onClick={() => {
              setActiveTab('moneyOut');
              loadMoneyOut();
            }}
          >
            Money Out
          </button>
          <button
            className={`tab ${activeTab === 'interest' ? 'tab-active' : ''}`}
            onClick={() => {
              setActiveTab('interest');
              loadInterestData();
            }}
          >
            Interest Earned
          </button>
          <button
            className={`tab ${activeTab === 'outstanding' ? 'tab-active' : ''}`}
            onClick={() => {
              setActiveTab('outstanding');
              loadOutstandingLoans();
            }}
          >
            Outstanding Loans
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div>
            {loading.overview ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : overview ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Money Out Card */}
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Total Disbursed</div>
                      <div className="stat-value text-primary">{formatAmount(overview.moneyOut.totalDisbursed)}</div>
                      <div className="stat-desc">{overview.moneyOut.disbursementCount} disbursements</div>
                    </div>
                  </div>

                  {/* Money In Card */}
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Total Repaid</div>
                      <div className="stat-value text-success">{formatAmount(overview.moneyIn.totalRepaid)}</div>
                      <div className="stat-desc">{overview.moneyIn.paymentCount} payments</div>
                    </div>
                  </div>

                  {/* Interest Earned Card */}
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Interest Earned</div>
                      <div className="stat-value text-info">{formatAmount(overview.interestEarned)}</div>
                      <div className="stat-desc">From loan repayments</div>
                    </div>
                  </div>

                  {/* Outstanding Balance Card */}
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Outstanding Balance</div>
                      <div className="stat-value text-warning">{formatAmount(overview.outstandingBalance)}</div>
                      <div className="stat-desc">Remaining to be collected</div>
                    </div>
                  </div>
                </div>

                {/* Financial Snapshot Chart */}
                <div className="card bg-base-100 shadow-xl mb-6">
                  <div className="card-body">
                    <h2 className="card-title">Financial Snapshot</h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Disbursed', value: overview.moneyOut.totalDisbursed },
                            { name: 'Repaid', value: overview.moneyIn.totalRepaid },
                            { name: 'Interest', value: overview.interestEarned },
                            { name: 'Outstanding', value: overview.outstandingBalance }
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatAmount(value)} />
                          <Legend />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title">Money In/Out</h2>
                      <p>Track all financial transactions and analyze cash flow.</p>
                      <div className="card-actions justify-end">
                        <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('moneyIn')}>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title">Interest Analysis</h2>
                      <p>Analyze interest earned from loan repayments.</p>
                      <div className="card-actions justify-end">
                        <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('interest')}>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title">Outstanding Loans</h2>
                      <p>Monitor loans that still have balances to be collected.</p>
                      <div className="card-actions justify-end">
                        <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('outstanding')}>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <ExclamationCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <p>No data available for the selected period.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Money In Tab Content */}
        {activeTab === 'moneyIn' && (
          <div>
            {loading.moneyIn ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : moneyIn.payments && moneyIn.payments.length > 0 ? (
              <div>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Total Repaid</div>
                      <div className="stat-value text-success">{formatAmount(moneyIn.summary?.totalAmount || 0)}</div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Average Payment</div>
                      <div className="stat-value text-info">{formatAmount(moneyIn.summary?.averageAmount || 0)}</div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Largest Payment</div>
                      <div className="stat-value text-warning">{formatAmount(moneyIn.summary?.largestAmount || 0)}</div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Payment Count</div>
                      <div className="stat-value">{moneyIn.pagination?.total || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Payments Table */}
                <div className="overflow-x-auto">
                  <Table
                    columns={moneyInColumns}
                    data={moneyIn.payments}
                    pagination={{
                      pageCount: moneyIn.pagination?.pages || 1,
                      onPageChange: (page) => loadMoneyIn(page + 1)
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <ExclamationCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <p>No payment data available for the selected period.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Money Out Tab Content */}
        {activeTab === 'moneyOut' && (
          <div>
            {loading.moneyOut ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : moneyOut.disbursements && moneyOut.disbursements.length > 0 ? (
              <div>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Total Disbursed</div>
                      <div className="stat-value text-primary">{formatAmount(moneyOut.summary?.totalAmount || 0)}</div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Average Disbursement</div>
                      <div className="stat-value text-info">{formatAmount(moneyOut.summary?.averageAmount || 0)}</div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Largest Disbursement</div>
                      <div className="stat-value text-warning">{formatAmount(moneyOut.summary?.largestAmount || 0)}</div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Disbursement Count</div>
                      <div className="stat-value">{moneyOut.pagination?.total || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Disbursements Table */}
                <div className="overflow-x-auto">
                  <Table
                    columns={moneyOutColumns}
                    data={moneyOut.disbursements}
                    pagination={{
                      pageCount: moneyOut.pagination?.pages || 1,
                      onPageChange: (page) => loadMoneyOut(page + 1)
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <ExclamationCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <p>No disbursement data available for the selected period.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interest Earned Tab Content */}
        {activeTab === 'interest' && (
          <div>
            {loading.interest ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : interestData.overTime && interestData.overTime.length > 0 ? (
              <div>
                {/* Summary Card */}
                <div className="stats shadow mb-6 w-full">
                  <div className="stat">
                    <div className="stat-title">Total Interest Earned</div>
                    <div className="stat-value text-success">{formatAmount(interestData.total || 0)}</div>
                    <div className="stat-desc">For the selected period</div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Interest Over Time Chart */}
                  <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title">Interest Earned Over Time</h2>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={interestData.overTime}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timePeriod" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatAmount(value)} />
                            <Legend />
                            <Bar dataKey="interestEarned" fill="#8884d8" name="Interest Earned" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Interest by Loan Type Chart */}
                  <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title">Interest by Loan Type</h2>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={interestData.byLoanType}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="interestEarned"
                              nameKey="loanType"
                            >
                              {interestData.byLoanType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatAmount(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interest Breakdown Table */}
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">Interest Breakdown by Loan Type</h2>
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th>Loan Type</th>
                            <th>Interest Earned</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {interestData.byLoanType.map((item, index) => (
                            <tr key={index}>
                              <td>{item.loanType}</td>
                              <td>{formatAmount(item.interestEarned)}</td>
                              <td>{((item.interestEarned / interestData.total) * 100).toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <ExclamationCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <p>No interest data available for the selected period.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Outstanding Loans Tab Content */}
        {activeTab === 'outstanding' && (
          <div>
            {loading.outstanding ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : outstandingLoans.loans && outstandingLoans.loans.length > 0 ? (
              <div>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Total Outstanding</div>
                      <div className="stat-value text-warning">{formatAmount(outstandingLoans.summary?.totalOutstanding || 0)}</div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Total Loans</div>
                      <div className="stat-value">{outstandingLoans.pagination?.total || 0}</div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Overdue Loans</div>
                      <div className="stat-value text-error">{outstandingLoans.summary?.overdueCount || 0}</div>
                      <div className="stat-desc">Payments past due date</div>
                    </div>
                  </div>
                </div>

                {/* Outstanding Loans Table */}
                <div className="overflow-x-auto">
                  <Table
                    columns={outstandingColumns}
                    data={outstandingLoans.loans}
                    pagination={{
                      pageCount: outstandingLoans.pagination?.pages || 1,
                      onPageChange: (page) => loadOutstandingLoans(page + 1)
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <ExclamationCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <p>No outstanding loans available.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </TitleCard>
    </div>
  );
};

export default FinancialManagement; 