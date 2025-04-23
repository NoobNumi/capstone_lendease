import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import axios from 'axios';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Clock,
  Calendar,
  CreditCard,
  FileText,
  Printer,
  Grid,
  List,
  DollarSign,
  Send,
  ExternalLink,
  CheckCircle,
  Store
} from "lucide-react";
import { toast } from 'react-toastify';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
};

const LoanReleaseStatement = ({
  selectedLoan,
  calculatorInterestRate,
  calculatorLoanAmmount,
  calculatorMonthsToPay,
  printableRef
}) => {
  const [payments, setPayments] = useState([]);
  const [loanPaymentList, setLoanPaymentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [balance, setBalance] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofOfPayment, setProofOfPayment] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [xenditCheckout, setXenditCheckout] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');

  const paymentMethods = [
    { value: 'GCash', label: 'GCash' },
    { value: 'Maya', label: 'Maya' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Cash', label: 'Cash' }
  ];

  // Fetch loan payment list - this matches PaymentsLogicView implementation
  const fetchLoanPaymentList = async () => {
    if (!selectedLoan?.loan_id) return;

    try {
      setIsLoading(true);
      const response = await axios.get(`/loan/${selectedLoan.loan_id}/payments`);
      if (response.data) {
        setLoanPaymentList(response.data);
      }
    } catch (error) {
      console.error('Error fetching loan payment list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate payments using the same logic as in PaymentsLogicView
  const calculatePayments = () => {
    try {
      if (!calculatorLoanAmmount || !calculatorInterestRate || !calculatorMonthsToPay) return [];

      // Calculate total payment based on loan amount and interest rate
      const computedTotalPayment = calculatorLoanAmmount * (1 + calculatorInterestRate / 100);
      setTotalPayment(computedTotalPayment);

      // Calculate the interest (Total Payment - Loan Amount)
      const interest = computedTotalPayment - calculatorLoanAmmount;

      // Calculate the monthly interest and principal payment
      const monthlyInterestAmount = interest / calculatorMonthsToPay;
      const principal = calculatorLoanAmmount / calculatorMonthsToPay;
      let remainingBalance = computedTotalPayment;
      let paymentDetails = [];
      let remainingPrincipal = calculatorLoanAmmount;

      // Use approval date from selectedLoan or fallback to current date
      const startDate = selectedLoan?.approval_date ? new Date(selectedLoan.approval_date) : new Date();

      for (let i = 1; i <= calculatorMonthsToPay; i++) {
        const amountPrincipal = principal;
        const amount = principal + monthlyInterestAmount;
        remainingBalance -= amount;

        // First month shows full loan amount, others show the remaining
        remainingPrincipal = i === 1 ? remainingPrincipal : remainingPrincipal - amountPrincipal;

        // Calculate payment date based on start date
        const paymentDate = new Date(startDate);
        paymentDate.setMonth(startDate.getMonth() + i);

        paymentDetails.push({
          transactionDate: paymentDate.toISOString(),
          principal: remainingPrincipal,
          amount,
          interestAmount: monthlyInterestAmount,
          dueAmount: amount,
          remainingBalance,
          amountPrincipal,
          index: i
        });
      }

      setPayments(paymentDetails);
      setBalance(remainingBalance);
      return paymentDetails;
    } catch (error) {
      console.error('Error calculating payments:', error);
      return [];
    }
  };

  // Updated function to match PaymentsLogicView logic exactly
  const getCombinedPayments = (payments, loanPaymentList) => {
    if (!payments?.length) return [];

    const today = new Date();
    const isLoanActive = selectedLoan?.loan_status === 'Approved' || selectedLoan?.loan_status === 'Disbursed';

    // Check for pending payments
    const pendingPayment = loanPaymentList?.find(p => p.payment_status === 'Pending');
    if (pendingPayment) {
      // Extract which months this pending payment covers
      const monthsRegex = /Months (\d+(,\s*\d+)*)/;
      const monthsMatch = pendingPayment.remarks?.match(monthsRegex);
      const pendingMonths = monthsMatch ?
        monthsMatch[1].split(',').map(num => parseInt(num.trim())) : [];

      // Create a single payment entry for the pending payment
      const pendingPaymentEntry = {
        ...payments[pendingPayment.selectedTableRowIndex - 1],
        payment_id: pendingPayment.payment_id,
        dueAmount: parseFloat(pendingPayment.payment_amount),
        status: 'pending',
        isMultipleMonths: true,
        showQR: false,
        pastDueMonths: pendingMonths,
        includesCurrentPayment: pendingPayment.remarks?.includes('& Current'),
        paymentStatus: 'Pending',
        pendingAmount: parseFloat(pendingPayment.payment_amount),
        referenceNumber: pendingPayment.reference_number,
        paymentMethod: pendingPayment.payment_method,
        paymentDate: pendingPayment.payment_date
      };

      // Return only the pending payment and future payments
      const futurePayments = payments
        .filter((_, index) => !pendingMonths.includes(index + 1))
        .map(payment => ({
          ...payment,
          status: 'due',
          showQR: false
        }));

      return [pendingPaymentEntry, ...futurePayments];
    }

    // If no pending payment, process all payments
    let pastDuePayments = [];
    let currentPayment = null;
    let futurePayments = [];

    // Process payments
    payments.forEach((payment, index) => {
      const dueDate = new Date(payment.transactionDate);
      const paymentStatus = loanPaymentList?.find(p => p.selectedTableRowIndex === index + 1);

      // Skip if payment is approved
      if (paymentStatus?.payment_status === 'Approved') {
        return;
      }

      const formattedPayment = {
        ...payment,
        index: index + 1,
        // Only mark as past_due if loan is active and payment date has passed
        status: isLoanActive && dueDate < today ? 'past_due' : 'due',
        paymentStatus: paymentStatus?.payment_status,
        paymentMethod: paymentStatus?.payment_method,
        referenceNumber: paymentStatus?.reference_number,
        paymentDate: paymentStatus?.payment_date,
        remarks: paymentStatus?.remarks
      };

      // Only consider past due if loan is active
      if (isLoanActive && dueDate < today) {
        pastDuePayments.push(formattedPayment);
      } else if (!currentPayment) {
        currentPayment = {
          ...formattedPayment,
          status: 'due',
          showQR: isLoanActive // Only show QR if loan is active
        };
      } else {
        futurePayments.push({
          ...formattedPayment,
          status: 'future'
        });
      }
    });

    let paymentList = [];

    // Handle past due + current month combination only if loan is active
    if (isLoanActive && pastDuePayments.length > 0) {
      const totalPastDue = pastDuePayments.reduce((sum, p) => sum + p.dueAmount, 0);
      const combinedPayment = {
        ...pastDuePayments[0],
        dueAmount: totalPastDue + (currentPayment?.dueAmount || 0),
        pastDueMonths: pastDuePayments.map(p => p.index),
        status: 'past_due',
        isMultipleMonths: true,
        showQR: true,
        includesCurrentPayment: !!currentPayment,
        currentAmount: currentPayment?.dueAmount || 0,
        pastDueAmount: totalPastDue
      };
      paymentList.push(combinedPayment);
    } else if (currentPayment) {
      paymentList.push(currentPayment);
    }

    // Add future payments
    paymentList = [...paymentList, ...futurePayments];

    return paymentList;
  };

  // Load data on mount
  useEffect(() => {
    fetchLoanPaymentList();
  }, [selectedLoan?.loan_id]);

  // Calculate payments when loan details or payment list changes
  useEffect(() => {
    calculatePayments();
  }, [calculatorLoanAmmount, calculatorInterestRate, calculatorMonthsToPay, selectedLoan?.approval_date]);

  const combinedPayments = getCombinedPayments(payments, loanPaymentList);

  // Calculate totals for the table footer
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalInterestAmount = payments.reduce((sum, payment) => sum + payment.interestAmount, 0);
  const totalDueAmount = payments.reduce((sum, payment) => sum + payment.dueAmount, 0);

  // Handle "Pay Now" button click
  const handlePayNowClick = (payment) => {
    setSelectedPayment(payment);
    setPaymentFormOpen(true);
    document.getElementById('paymentModal').showModal();
  };

  // Handle payment form submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPayment) return;
    if (!referenceNumber || !paymentMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!proofOfPayment && paymentMethod !== 'Cash') {
      toast.error('Please upload proof of payment');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('loan_id', selectedLoan.loan_id);
      formData.append('selectedTableRowIndex', selectedPayment.index);
      formData.append('payment_amount', selectedPayment.dueAmount);
      formData.append('payment_method', paymentMethod);
      formData.append('reference_number', referenceNumber);

      if (proofOfPayment) {
        formData.append('proof_of_payment', proofOfPayment);
      }

      const response = await axios.post('/loan/payment/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.success) {
        toast.success('Payment submitted successfully!');
        document.getElementById('paymentModal').close();
        setPaymentFormOpen(false);

        // Reload payment data after submission
        fetchLoanPaymentList();

        // Reset form
        setReferenceNumber('');
        setPaymentMethod('');
        setProofOfPayment(null);
      } else {
        toast.error(response.data?.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Error submitting payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file upload for proof of payment
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProofOfPayment(e.target.files[0]);
    }
  };

  // Add this function to initiate Xendit payment
  const initiateXenditPayment = async (payment) => {
    try {
      setPaymentLoading(true);

      const response = await axios.post('/loan/create-payment', {
        loanId: selectedLoan.loan_id,
        paymentAmount: payment.dueAmount,
        paymentIndex: payment.index,
        description: `Loan Payment for ${selectedLoan.loan_application_id || selectedLoan.loan_id} - Month ${payment.index}`
      });

      if (response.data && response.data.success) {
        setXenditCheckout(response.data);
        setPaymentReference(response.data.reference);

        // You can either:
        // 1. Open the modal and show payment options (our current approach)
        document.getElementById('xenditModal').showModal();

        // 2. Or redirect directly to Xendit's hosted checkout page
        // window.open(response.data.invoice.invoice_url, '_blank');
      } else {
        toast.error('Failed to create payment. Please try again.');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Error initiating payment. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Function to check payment status
  const checkPaymentStatus = async () => {
    try {
      if (!paymentReference) return;

      const response = await axios.get(`/loan/payment-status/${paymentReference}`);

      if (response.data.success) {
        if (response.data.status === 'completed') {
          toast.success('Payment completed successfully!');
          document.getElementById('xenditModal').close();
          fetchLoanPaymentList(); // Refresh payment data
        } else if (response.data.status === 'failed') {
          toast.error(`Payment failed: ${response.data.error || 'Unknown error'}`);
        } else {
          toast.info('Payment is still processing. Please check again later.');
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div ref={printableRef} className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="/LOGO.png" alt="RAZV Logo" className="w-12 h-12" />
          <h1 className="text-2xl font-bold text-blue-900">RAZV LENDING CORPORATION</h1>
        </div>
        <p className="text-sm text-gray-600">Jose Arcilla Street, Concepcion Virac, Catanduanes</p>
        <p className="text-sm text-gray-600">SEC Registration No: 201706817</p>
        <p className="text-sm text-gray-600">Mobile No.: 09984059118 || Landline Phone No.:(052)811-4017</p>
      </div>

      {/* Title */}
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-xl font-bold text-center text-blue-900">
          LOAN REPAYMENT SCHEDULE
        </h2>
      </div>

      {/* Loan Details Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white">
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-gray-600">
            <span className="font-semibold">Name:</span>
            <span>{selectedLoan?.first_name} {selectedLoan?.middle_name} {selectedLoan?.last_name}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <span className="font-semibold">Member ID:</span>
            <span>{selectedLoan?.loan_id}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <span className="font-semibold">Loan Type:</span>
            <span>{selectedLoan?.loan_type_value}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <span className="font-semibold">Loan Amount:</span>
            <span>{formatCurrency(selectedLoan?.loan_amount || 0)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1 text-gray-600">
            <span className="font-semibold">Date Release:</span>
            <span>{selectedLoan?.approval_date ? format(new Date(selectedLoan.approval_date), 'MMM dd, yyyy') : 'Pending'}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <span className="font-semibold">Duration:</span>
            <span>{calculatorMonthsToPay} months</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <span className="font-semibold">Paymode:</span>
            <span>Monthly</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <span className="font-semibold">Interest rate:</span>
            <span>{calculatorInterestRate}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1 text-gray-600">
            <span className="font-semibold">Total Interest:</span>
            <span>{formatCurrency(totalInterestAmount)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <span className="font-semibold">Total Amount to Pay:</span>
            <span className="font-bold text-blue-800">{formatCurrency(totalDueAmount)}</span>
          </div>
        </div>
      </div>

      {/* View Toggle Buttons - Only visible when printing */}
      <div className="p-4 bg-gray-50 border-t border-b print:hidden">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded flex items-center gap-1 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            <Grid className="w-4 h-4" />
            Card View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 rounded flex items-center gap-1 text-sm ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            <List className="w-4 h-4" />
            Table View
          </button>
        </div>
      </div>

      {/* Payment Schedule Content */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Payment Schedule
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {combinedPayments.map((payment, index) => {
              const isPending = payment.paymentStatus === 'Pending';
              const isPastDue = payment.status === 'past_due';
              const isApproved = payment.paymentStatus === 'Approved';
              const isRejected = payment.paymentStatus === 'Rejected';

              return (
                <div
                  key={index}
                  className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${isApproved ? 'border-green-500' :
                    isRejected ? 'border-red-500' :
                      isPending ? 'border-yellow-500' :
                        isPastDue ? 'border-red-500' :
                          'border-blue-500'
                    }`}
                >
                  {/* Payment Header */}
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start">
                      {/* Left side content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                          {isPastDue ? (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          ) : isApproved ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Calendar className="w-5 h-5 text-blue-500" />
                          )}
                          {payment.isMultipleMonths ? (
                            <span className="text-red-600">
                              Past Due + Current Payment
                              <span className="block text-sm font-normal text-gray-600">
                                Months {payment.pastDueMonths.join(', ')} {payment.includesCurrentPayment && '& Current'}
                              </span>
                            </span>
                          ) : (
                            <span>Payment {payment.index}</span>
                          )}
                        </h3>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(payment.transactionDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>

                      {/* Right side content - Payment status */}
                      <div className="text-right">
                        <div className={`
                          px-3 py-1 rounded-full text-sm font-medium
                          ${payment.paymentStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                            payment.paymentStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                              payment.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                isPastDue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}
                        `}>
                          {payment.paymentStatus || (isPastDue ? 'Past Due' : 'Upcoming')}
                        </div>
                        <p className="text-2xl font-bold mt-2 text-gray-800">
                          {formatCurrency(payment.dueAmount)}
                        </p>
                        {payment.isMultipleMonths && (
                          <div className="mt-1 text-xs">
                            <div className="text-red-600">
                              Past Due: {formatCurrency(payment.pastDueAmount)}
                            </div>
                            {payment.includesCurrentPayment && (
                              <div className="text-blue-600">
                                Current: {formatCurrency(payment.currentAmount)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Principal</p>
                        <p className="font-medium">{formatCurrency(payment.principal)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Principal Payment</p>
                        <p className="font-medium">{formatCurrency(payment.amountPrincipal)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Interest</p>
                        <p className="font-medium">{formatCurrency(payment.interestAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Balance After Payment</p>
                        <p className="font-medium">{formatCurrency(payment.remainingBalance)}</p>
                      </div>
                    </div>

                    {/* QR Code and Pay Now Button (if applicable) */}
                    {payment.showQR && (
                      <div className="mt-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="bg-white p-4 rounded-lg shadow-md">
                            <QRCodeSVG
                              value={`${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/app/loan_details/${selectedLoan?.loan_id}/selectedTableRowIndex/${payment.index}`}
                              size={120}
                              level="H"
                              includeMargin={true}
                            />
                            <p className="mt-2 text-center text-sm text-gray-600">Scan to make payment</p>
                          </div>

                          <div className="flex flex-col items-center w-full md:w-auto">
                            <div className="dropdown dropdown-top dropdown-end w-full md:w-auto">
                              <label tabIndex={0} className={`btn btn-primary w-full gap-2 ${payment.paymentStatus === 'Approved' ? 'btn-disabled' : ''
                                }`}>
                                <Send className="w-4 h-4" />
                                Pay Now
                              </label>
                              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                <li>
                                  <a onClick={() => initiateXenditPayment(payment)}>
                                    <CreditCard className="w-4 h-4" />
                                    Pay Online
                                  </a>
                                </li>
                                <li>
                                  <a onClick={() => handlePayNowClick(payment)}>
                                    <DollarSign className="w-4 h-4" />
                                    Manual Payment
                                  </a>
                                </li>
                              </ul>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {isPastDue ? 'Pay immediately to avoid additional charges' : 'Make your payment early'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Evidence (if applicable) */}
                    {(isPending || isApproved || isRejected) && (
                      <div className="mt-4 p-3 bg-white rounded-lg border">
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <CreditCard className="w-4 h-4 text-blue-500" />
                          Payment Details
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Reference:</p>
                            <p className="font-medium">{payment.referenceNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Method:</p>
                            <p className="font-medium">{payment.paymentMethod || 'N/A'}</p>
                          </div>
                          {payment.paymentDate && (
                            <div className="col-span-2">
                              <p className="text-gray-500">Date Submitted:</p>
                              <p className="font-medium">
                                {format(new Date(payment.paymentDate), 'MMM dd, yyyy h:mm a')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Amortization Schedule
          </h2>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-t border-b bg-gray-50">
                <th className="py-3 text-left px-4">No.</th>
                <th className="py-3 text-left px-4">Due Date</th>
                <th className="py-3 text-right px-4">Principal</th>
                <th className="py-3 text-right px-4">Principal Payment</th>
                <th className="py-3 text-right px-4">Interest Amount</th>
                <th className="py-3 text-right px-4 bg-blue-50">
                  <div>Payment Amount</div>
                  <div className="text-xs text-gray-500">(Principal + Interest)</div>
                </th>
                <th className="py-3 text-right px-4 bg-green-50">
                  <div>Balance</div>
                  <div className="text-xs text-gray-500">(Remaining)</div>
                </th>
                <th className="py-3 text-center px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {combinedPayments.map((payment, index) => {
                const isPending = payment.paymentStatus === 'Pending';
                const isPastDue = payment.status === 'past_due';

                return (
                  <tr key={index} className={`border-b hover:bg-gray-50 
                    ${isPending ? 'bg-amber-50' :
                      payment.paymentStatus === 'Approved' ? 'bg-green-50' :
                        payment.paymentStatus === 'Rejected' ? 'bg-red-50' :
                          selectedLoan?.loan_status === 'Pending' ? 'bg-gray-50' :
                            isPastDue ? 'bg-rose-50' : ''}`}>
                    <td className="py-3 px-4">
                      {payment.isMultipleMonths ? (
                        `Months ${payment.pastDueMonths.join(', ')}${payment.includesCurrentPayment ? ' & Current' : ''}`
                      ) : (
                        `Month ${payment.index}`
                      )}
                    </td>
                    <td className="py-3 px-4">{format(new Date(payment.transactionDate), 'MMM dd, yyyy')}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(payment.principal)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(payment.amountPrincipal)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(payment.interestAmount)}</td>
                    <td className="py-3 px-4 text-right bg-blue-50/30">
                      <div className="font-medium text-blue-900">
                        {formatCurrency(payment.dueAmount)}
                      </div>
                      {payment.isMultipleMonths && (
                        <div className="mt-1">
                          <div className="text-xs text-red-600">
                            Past Due: {formatCurrency(payment.pastDueAmount)}
                          </div>
                          {payment.includesCurrentPayment && (
                            <div className="text-xs text-blue-600">
                              Current: {formatCurrency(payment.currentAmount)}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right bg-green-50/30">
                      <div className="font-medium text-green-900">
                        {formatCurrency(payment.remainingBalance)}
                      </div>
                      {payment.remainingBalance === 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          Fully Paid
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {selectedLoan?.loan_status === 'Pending' ? (
                        <div className="text-gray-500">Awaiting Loan Approval</div>
                      ) : payment.paymentStatus ? (
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${payment.paymentStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                            payment.paymentStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                              payment.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'}
                        `}>
                          {payment.paymentStatus}
                        </div>
                      ) : (
                        <span className={`text-sm ${isPastDue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                          {isPastDue ? 'Past Due' : 'Upcoming'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t border-b font-semibold bg-gray-50">
                <td colSpan="3" className="py-3 px-4">Total</td>
                <td className="py-3 px-4 text-right">{formatCurrency(totalAmount - totalInterestAmount)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(totalInterestAmount)}</td>
                <td className="py-3 px-4 text-right bg-blue-50/30 font-bold text-blue-900">
                  {formatCurrency(totalDueAmount)}
                </td>
                <td className="py-3 px-4 text-right bg-green-50/30">-</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 border-t bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Terms & Conditions</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
              <li>Payments are due on the same date each month as the loan disbursement date</li>
              <li>Late payments may incur additional fees and affect credit score</li>
              <li>Early repayment is permitted without penalty</li>
              <li>Please contact our office if you face difficulties in making payments</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Contact Information</h3>
            <p className="text-sm text-gray-600">
              For any queries regarding your loan or payment schedule, please contact:<br />
              <strong>Phone:</strong> +63 998 405 9118<br />
              <strong>Email:</strong> info@razvlending.com<br />
              <strong>Address:</strong> Jose Arcilla Street, Concepcion Virac, Catanduanes
            </p>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This is an official loan statement issued on {format(new Date(), 'MMMM dd, yyyy')}</p>
        </div>
      </div>

      {/* Payment Modal */}
      <dialog id="paymentModal" className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Submit Payment</h3>
          <form onSubmit={handlePaymentSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Payment Amount</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={selectedPayment ? formatCurrency(selectedPayment.dueAmount) : ''}
                  disabled
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Payment Method</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="" disabled>Select payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Reference Number</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter transaction reference"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Proof of Payment</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  onChange={handleFileChange}
                  disabled={paymentMethod === 'Cash'}
                  required={paymentMethod !== 'Cash'}
                />
                {proofOfPayment && (
                  <p className="text-xs text-gray-500 mt-1">
                    File selected: {proofOfPayment.name}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-blue-800 flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5" />
                Payment Instructions
              </h4>
              <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                <li>For GCash/Maya payments, send to: 09984059XXX</li>
                <li>For Bank Transfer, use account: Razv Lending Corp. - BDO 123456789012</li>
                <li>Always include your reference number in the payment details</li>
                <li>Upload a screenshot of your payment confirmation</li>
              </ul>
            </div>

            <div className="modal-action flex justify-between">
              <button
                type="button"
                className="btn"
                onClick={() => document.getElementById('paymentModal').close()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Processing...
                  </>
                ) : 'Submit Payment'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Xendit Payment Modal */}
      <dialog id="xenditModal" className="modal">
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg mb-4">Complete Your Payment</h3>

          {paymentLoading ? (
            <div className="flex justify-center items-center py-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : xenditCheckout ? (
            <div className="py-4">
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Payment Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium">{formatCurrency(xenditCheckout.invoice.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reference</p>
                    <p className="font-medium">{paymentReference}</p>
                  </div>
                </div>
              </div>

              <div className="alert alert-info mb-6">
                <AlertCircle className="h-5 w-5" />
                <span className="ml-2">
                  You will be redirected to Xendit's secure payment page to complete your payment.
                </span>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-4">Choose Payment Method</h4>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Option 1: Direct to Xendit checkout */}
                  <button
                    onClick={() => window.open(xenditCheckout.invoice.invoice_url, '_blank')}
                    className="btn btn-outline flex flex-col h-auto py-4"
                  >
                    <CreditCard className="h-6 w-6 mb-2" />
                    <span>All Payment Methods</span>
                    <span className="text-xs mt-1 text-gray-500">Secure Checkout</span>
                  </button>

                  {/* Option 2: Direct payment methods */}
                  <button
                    onClick={() => window.open(xenditCheckout.invoice.invoice_url, '_blank')}
                    className="btn btn-outline flex flex-col h-auto py-4"
                  >
                    <img src="/assets/gcash-logo.png" alt="GCash" className="h-6 mb-2" />
                    <span>GCash</span>
                    <span className="text-xs mt-1 text-gray-500">Mobile Wallet</span>
                  </button>

                  <button
                    onClick={() => window.open(xenditCheckout.invoice.invoice_url, '_blank')}
                    className="btn btn-outline flex flex-col h-auto py-4"
                  >
                    <img src="/assets/maya-logo.png" alt="Maya" className="h-6 mb-2" />
                    <span>Maya</span>
                    <span className="text-xs mt-1 text-gray-500">Mobile Wallet</span>
                  </button>

                  <button
                    onClick={() => window.open(xenditCheckout.invoice.invoice_url, '_blank')}
                    className="btn btn-outline flex flex-col h-auto py-4"
                  >
                    <img src="/assets/credit-card-logo.png" alt="Credit Card" className="h-6 mb-2" />
                    <span>Credit Card</span>
                    <span className="text-xs mt-1 text-gray-500">Visa/Mastercard/JCB</span>
                  </button>

                  <button
                    onClick={() => window.open(xenditCheckout.invoice.invoice_url, '_blank')}
                    className="btn btn-outline flex flex-col h-auto py-4"
                  >
                    <Store className="h-6 w-6 mb-2" />
                    <span>Over-the-Counter</span>
                    <span className="text-xs mt-1 text-gray-500">7-Eleven, Cebuana</span>
                  </button>

                  <button
                    onClick={() => window.open(xenditCheckout.invoice.invoice_url, '_blank')}
                    className="btn btn-outline flex flex-col h-auto py-4"
                  >
                    <ExternalLink className="h-6 w-6 mb-2" />
                    <span>Other Methods</span>
                    <span className="text-xs mt-1 text-gray-500">Bank Transfer & More</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    document.getElementById('xenditModal').close();
                    setXenditCheckout(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={checkPaymentStatus}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check Payment Status
                </button>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <p>There was an error creating your payment. Please try again.</p>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default LoanReleaseStatement; 