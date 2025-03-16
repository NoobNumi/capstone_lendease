import React, { useState, useEffect, memo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useDropzone } from 'react-dropzone';
import format from 'date-fns/format';
import axios from 'axios';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Upload,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Scan,
  Eye,
  Send,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
};

const LoanCalculator = memo(({
  setFieldValue,
  handleBlur,
  values,
  calculatorLoanAmmount = 5000,
  calculatorInterestRate = 7,
  calculatorMonthsToPay = 6,
  calculatorTotalAmountToPay = 0,
  isReadOnly = false,
  selectedLoan,
  setPaymentList,
  isGridView
}) => {

  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  let userRole = loggedInUser?.role;

  console.log({ loggedInUser })
  const [payments, setPayments] = useState([]);
  const [loanPaymentList, setLoanPaymentList] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [balance, setBalance] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [isFromPayNowButton, setisFromPayNowButton] = useState(false);
  const [today, setToday] = useState(new Date());

  // Define loan_status based on props or selectedLoan
  const loan_status = values.loan_status || selectedLoan?.loan_status || '';

  const fetchLoanPaymentList = async () => {
    try {
      if (!selectedLoan?.loan_id) return;

      const response = await axios.get(`/loan/${selectedLoan.loan_id}/payments`);
      console.log({ response });

      if (response.data) {
        setLoanPaymentList(response.data);

        // First ensure we have payments generated
        if (!payments.length) {
          // Generate initial payment schedule
          const monthlyPayment = (calculatorLoanAmmount * (1 + calculatorInterestRate / 100)) / calculatorMonthsToPay;
          const startDate = selectedLoan?.approval_date ? new Date(selectedLoan.approval_date) : new Date();

          const initialPayments = Array.from({ length: calculatorMonthsToPay }, (_, i) => {
            const paymentDate = new Date(startDate);
            paymentDate.setMonth(startDate.getMonth() + i + 1); // Start from next month after approval

            return {
              transactionDate: paymentDate.toISOString(),
              dueAmount: monthlyPayment,
              amount: monthlyPayment,
              index: i + 1,
              status: 'due',
              showQR: i === 0,
              url: `${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/app/loan_details/${selectedLoan?.loan_id}/selectedTableRowIndex/${i + 1}`
            };
          });

          setPayments(initialPayments);
          // Now call getCombinedPayments with the initial payments
          const updatedPayments = getCombinedPayments(initialPayments, response.data);
          setPayments(updatedPayments);
        } else {
          // If we already have payments, just update with payment status
          const updatedPayments = getCombinedPayments(payments, response.data);
          setPayments(updatedPayments);
        }
      }
    } catch (error) {
      console.error('Error fetching loan payment list:', error);
      toast.error('Failed to fetch payment list');
    }
  };

  useEffect(() => {
    if (selectedLoan?.loan_id) {
      fetchLoanPaymentList();
    }
  }, [selectedLoan?.loan_id]);

  useEffect(() => {
    try {
      if (!calculatorLoanAmmount || !calculatorInterestRate || !calculatorMonthsToPay) return;

      // Calculate total payment based on loan amount and interest rate
      const computedTotalPayment = calculatorLoanAmmount * (1 + calculatorInterestRate / 100);
      setTotalPayment(computedTotalPayment);

      // Calculate monthly amounts
      const interest = computedTotalPayment - calculatorLoanAmmount;
      const monthlyInterestAmount = interest / calculatorMonthsToPay;
      const monthlyPrincipal = calculatorLoanAmmount / calculatorMonthsToPay;
      const monthlyPayment = monthlyPrincipal + monthlyInterestAmount;

      // Get start date from loan approval
      const startDate = selectedLoan?.approval_date ? new Date(selectedLoan.approval_date) : new Date();
      let remainingBalance = computedTotalPayment;
      let remainingPrincipal = calculatorLoanAmmount;
      let paymentDetails = [];

      // Generate payment schedule
      for (let i = 0; i < calculatorMonthsToPay; i++) {
        const paymentDate = new Date(startDate);
        paymentDate.setMonth(startDate.getMonth() + i);

        const payment = {
          transactionDate: paymentDate.toISOString(),
          principal: remainingPrincipal,
          amount: monthlyPayment,
          interestAmount: monthlyInterestAmount,
          dueAmount: monthlyPayment,
          datePaid: null,
          remainingBalance: remainingBalance - monthlyPayment,
          amountPrincipal: monthlyPrincipal
        };

        remainingBalance -= monthlyPayment;
        remainingPrincipal -= monthlyPrincipal;
        paymentDetails.push(payment);
      }

      setPayments(paymentDetails);
      if (setPaymentList) {
        setPaymentList(paymentDetails);
      }
      setBalance(remainingBalance);

    } catch (error) {
      console.error('Error calculating payments:', error);
      toast.error('Error calculating payment schedule');
    }
  }, [calculatorLoanAmmount, calculatorInterestRate, calculatorMonthsToPay, selectedLoan?.approval_date]);

  const getQRCodeDetails = (payments, loanPaymentList) => {
    if (!payments?.length || !loanPaymentList?.length) return null;

    const today = new Date();
    let pastDueAmount = 0;
    let currentPaymentIndex = -1;
    let currentAmount = 0;
    let pastDueMonths = [];
    let firstUnpaidIndex = -1;

    // Map payment statuses considering is_paid flag
    const paymentHistory = payments.map((_, index) => {
      const payment = loanPaymentList.find(p => p.selectedTableRowIndex === index + 1);
      const dueDate = new Date(payments[index].transactionDate);

      if (payment?.payment_status === 'Approved' || payment?.is_paid === 1) {
        return 'paid';
      } else if (dueDate < today) {
        if (firstUnpaidIndex === -1) firstUnpaidIndex = index;
        return 'past_due';
      }
      return 'due';
    });

    // Find all past due payments and next due payment
    let foundCurrentPayment = false;
    for (let i = 0; i < paymentHistory.length; i++) {
      const status = paymentHistory[i];
      const payment = payments[i];

      if (status === 'paid') continue;

      // Collect all past due payments
      if (status === 'past_due') {
        pastDueAmount += payment.dueAmount;
        pastDueMonths.push(i + 1);

        // Set the first past due payment as current payment index
        if (currentPaymentIndex === -1) {
          currentPaymentIndex = i;
        }
        continue;
      }

      // Find the next due payment after past dues
      if (status === 'due' && !foundCurrentPayment) {
        if (pastDueAmount > 0) {
          currentAmount = payment.dueAmount;
          foundCurrentPayment = true;
        } else {
          currentPaymentIndex = i;
          currentAmount = payment.dueAmount;
          break;
        }
      }
    }

    // If we have past due payments, use the first unpaid payment as current
    if (pastDueAmount > 0 && currentPaymentIndex === -1) {
      currentPaymentIndex = firstUnpaidIndex;
    }

    const totalAmount = pastDueAmount + (foundCurrentPayment ? currentAmount : 0);

    return {
      amount: totalAmount,
      dueDate: payments[currentPaymentIndex]?.transactionDate,
      hasPastDue: pastDueAmount > 0,
      pastDueAmount,
      currentAmount: foundCurrentPayment ? currentAmount : 0,
      index: currentPaymentIndex,
      pastDueMonths,
      isOverdue: true,
      url: `${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/app/loan_details/${selectedLoan?.loan_id}/selectedTableRowIndex/${currentPaymentIndex + 1}`,
      status: loanPaymentList.find(p => p.selectedTableRowIndex === currentPaymentIndex + 1)?.payment_status,
      paymentHistory
    };
  };

  const handlePayNowButtonClick = async (payment, index, isQRCode = false) => {
    try {
      // Get QR code details to ensure correct amount calculation
      const qrDetails = getQRCodeDetails(payments, loanPaymentList);

      let paymentAmount = payment.dueAmount;
      let hasPastDue = false;
      let pastDueAmount = 0;

      // If this is a past due payment or has past due amounts
      if (payment.status === 'past_due' || qrDetails?.hasPastDue) {
        hasPastDue = true;
        pastDueAmount = qrDetails?.pastDueAmount || 0;
        paymentAmount = qrDetails?.amount || payment.dueAmount; // Use combined amount for past due
      }

      setSelectedPayment({
        ...payment,
        selectedTableRowIndex: index + 1,
        amount: paymentAmount,
        hasPastDue,
        pastDueAmount,
        isOverdue: payment.status === 'past_due',
        currentAmount: payment.dueAmount
      });

      setSelectedIndex(index);
      document.getElementById('addPayment')?.showModal();
    } catch (error) {
      console.error('Error handling pay now click:', error);
      toast.error('Error processing payment amount');
    }
  };

  const handleViewPayment = async (payment, index) => {
    try {
      setSelectedPayment({
        ...payment,
        selectedTableRowIndex: index
      });
      setSelectedIndex(index);

      // Open view payment dialog
      document.getElementById('viewPayment')?.showModal();
    } catch (error) {
      console.error('Error handling view payment:', error);
    }
  };

  const getPaymentStatus = (payment, paymentStatus, today) => {
    if (paymentStatus?.payment_status === 'Approved' || paymentStatus?.is_paid === 1) {
      return 'paid';
    }
    if (paymentStatus?.payment_status === 'Pending') {
      return 'pending';
    }
    if (new Date(payment.transactionDate) < today) {
      return 'past_due';
    }
    return 'due';
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-success/20 text-success';
      case 'pending':
        return 'bg-warning/20 text-warning';
      case 'past_due':
        return 'bg-error/20 text-error';
      case 'due':
        return 'bg-info/20 text-info';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // First, calculate combined payments at the top level
  const getCombinedPayments = (payments, loanPaymentList) => {
    console.log('getCombinedPayments inputs:', { payments, loanPaymentList });

    if (!payments?.length) return [];

    // First check for any pending payment (including regular payments)
    const pendingPayment = loanPaymentList?.find(payment =>
      payment.payment_status === 'Pending'
    );

    // If there's a pending payment, handle it
    if (pendingPayment) {
      // Get the payment that corresponds to the pending payment
      const pendingPaymentEntry = {
        ...payments[pendingPayment.selectedTableRowIndex - 1],
        payment_id: pendingPayment.payment_id,
        dueAmount: parseFloat(pendingPayment.payment_amount),
        status: 'pending',
        showQR: false,
        paymentStatus: 'Pending',
        pendingAmount: parseFloat(pendingPayment.payment_amount),
        referenceNumber: pendingPayment.reference_number,
        paymentMethod: pendingPayment.payment_method,
        paymentDate: pendingPayment.payment_date,
        isRegularPayment: !pendingPayment.includes_past_due
      };

      // Return pending payment and future payments
      const futurePayments = payments
        .filter((_, index) => index + 1 > pendingPayment.selectedTableRowIndex)
        .map(payment => ({
          ...payment,
          status: 'future',
          showQR: false
        }));

      return [pendingPaymentEntry, ...futurePayments];
    }

    const today = new Date();
    let pastDuePayments = [];
    let currentPayment = null;
    let futurePayments = [];

    // Check if all previous payments are approved
    const hasUnapprovedPastPayments = payments.some((payment, index) => {
      const dueDate = new Date(payment.transactionDate);
      const paymentStatus = loanPaymentList?.find(p => p.selectedTableRowIndex === index + 1);
      return dueDate < today && paymentStatus?.payment_status !== 'Approved';
    });

    // Process existing payments
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
        status: 'due',
        showQR: false,
        url: `${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/app/loan_details/${selectedLoan?.loan_id}/selectedTableRowIndex/${index + 1}`
      };

      // Compare dates properly
      const isPastDue = dueDate < today;
      const isDueToday = dueDate.getDate() === today.getDate() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getFullYear() === today.getFullYear();

      if (isPastDue) {
        pastDuePayments.push({
          ...formattedPayment,
          status: 'past_due'
        });
      } else if (isDueToday || (!hasUnapprovedPastPayments && !currentPayment)) {
        // Show QR for current payment if:
        // 1. It's due today, OR
        // 2. All past payments are approved and this is the next payment
        currentPayment = {
          ...formattedPayment,
          status: 'due',
          showQR: true
        };
      } else {
        futurePayments.push({
          ...formattedPayment,
          status: 'future'
        });
      }
    });

    let paymentList = [];

    // Handle past due + current month
    if (pastDuePayments.length > 0) {
      // If there are past due payments, combine them
      const totalPastDue = pastDuePayments.reduce((sum, p) => sum + p.dueAmount, 0);
      const combinedPayment = {
        ...pastDuePayments[0],
        dueAmount: totalPastDue + (currentPayment?.dueAmount || 0),
        pastDueMonths: pastDuePayments.map(p => p.index),
        status: 'past_due',
        isMultipleMonths: true,
        showQR: true,
        includesCurrentPayment: !!currentPayment
      };
      paymentList.push(combinedPayment);
    } else if (currentPayment) {
      // If no past due, show current payment with QR
      paymentList.push(currentPayment);
    }

    // Add future payments
    paymentList = [...paymentList, ...futurePayments];

    return paymentList;
  };

  // Add this function to handle payment submission
  const handlePaymentSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (!selectedPayment || !selectedLoan?.loan_id) {
        toast.error('Invalid payment details');
        return;
      }

      const formData = new FormData();

      // Basic payment details
      formData.append('loan_id', selectedLoan.loan_id);
      formData.append('payment_amount', selectedPayment.amount);
      formData.append('payment_method', values.payment_method);
      formData.append('reference_number', values.reference_number);
      formData.append('selectedTableRowIndex', selectedPayment.selectedTableRowIndex);
      formData.append('proof_of_payment', values.proof_of_payment);

      // Handle past due scenarios
      if (selectedPayment.hasPastDue) {
        formData.append('includes_past_due', '1');
        formData.append('past_due_amount', selectedPayment.pastDueAmount);
        formData.append('original_amount', selectedPayment.currentAmount || selectedPayment.dueAmount);
      } else {
        formData.append('includes_past_due', '0');
        formData.append('past_due_amount', '0');
        formData.append('original_amount', selectedPayment.amount);
      }

      // Add remarks based on payment scenario
      let remarks = '';
      if (selectedPayment.hasPastDue) {
        remarks = `Combined payment - Past due: ${selectedPayment.pastDueMonths?.join(', ')}`;
        if (selectedPayment.includesCurrentPayment) {
          remarks += ` & Current month`;
        }
      } else {
        remarks = `Regular payment - Month ${selectedPayment.index}`;
      }
      formData.append('remarks', remarks);

      // Submit payment
      const response = await axios.post(
        `/loan/${selectedLoan.loan_id}/submit-payment`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success('Payment submitted successfully');
        document.getElementById('addPayment').close();
        resetForm();

        // Immediately fetch updated payment list
        await fetchLoanPaymentList();

        // Clear selected payment
        setSelectedPayment(null);
      } else {
        throw new Error(response.data.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error(error.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  // Add new function to handle payment approval/rejection
  const handlePaymentAction = async (paymentId, action) => {
    try {

      console.log({ paymentId })
      const response = await axios.post(`/loan/payments/${paymentId}/status`, {
        status: action === 'approve' ? 'Approved' : 'Rejected',
        loanId: selectedLoan?.loan_id,
        status: action === 'approve' ? 'Approved' : 'Rejected',
      });

      toast.success(`Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      // Refresh payment list to update UI
      fetchLoanPaymentList();

    } catch (error) {
      console.error(`Error ${action}ing payment:`, error);
      toast.error(`Failed to ${action} payment`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {isGridView && (
        <div className="flex flex-col items-center">
          {/* Payment Summary Card */}
          <div className="w-full max-w-3xl mb-8 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              Payment Schedules
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(totalPayment)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Monthly Payment</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrency(totalPayment / calculatorMonthsToPay)}
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-xl font-bold text-amber-600">{calculatorMonthsToPay} months</p>
              </div>
            </div>
          </div>

          {/* Current Payment Card */}
          <div className="w-full max-w-2xl space-y-6">
            {getCombinedPayments(payments, loanPaymentList).map((payment, index) => {
              const isMultipleMonths = payment.isMultipleMonths;
              const isPastDue = payment.status === 'past_due';
              const showQR = payment.showQR;

              const isFuturePayment =

                (payment.status === 'future' ||
                  payment.status === 'due') && !showQR;


              console.log({ payment, isFuturePayment })
              return (
                <div key={index} className={`bg-white rounded-xl shadow-md p-6 mb-4 ${isFuturePayment ? 'opacity-0' : ''}`}>
                  {/* Payment Header */}
                  <div className={`w-full h-2 ${payment.status === 'pending' ? 'bg-yellow-500' :
                    isPastDue ? 'bg-red-500' : 'bg-blue-500'
                    }`} />

                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      {/* Left side content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                          {isPastDue ? (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <Calendar className="w-5 h-5 text-blue-500" />
                          )}
                          {isMultipleMonths ? (
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
                            {payment?.transactionDate && format(new Date(payment?.transactionDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>

                      {/* Right side content */}
                      <div className="flex flex-col items-end gap-3">
                        {/* Status badge */}
                        <span className={`
                          px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2
                          ${isPastDue ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}
                        `}>
                          {isPastDue ? (
                            <>
                              <AlertCircle className="w-4 h-4" />
                              Past Due
                            </>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4" />
                              Due
                            </>
                          )}
                        </span>

                        {/* Amount display */}
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Amount Due:</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(payment.dueAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Show pending payment info */}
                    {payment.status === 'pending' && (
                      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-yellow-600">Payment Pending Approval</p>
                            <div className="mt-3 space-y-2">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Reference Number:</p>
                                  <p className="font-medium">{payment.referenceNumber}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Payment Method:</p>
                                  <p className="font-medium">{payment.paymentMethod}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Payment Date:</p>
                                  <p className="font-medium">
                                    {format(new Date(payment.paymentDate), 'MMM dd, yyyy HH:mm')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Amount:</p>
                                  <p className="font-medium">{formatCurrency(payment.pendingAmount)}</p>
                                </div>
                              </div>

                              {/* Only show breakdown for combined payments */}
                              {!payment.isRegularPayment && (
                                <div className="mt-4 bg-white/50 rounded-lg p-4">
                                  <h4 className="font-medium mb-2">Payment Breakdown:</h4>
                                  <div className="space-y-2">
                                    {payment.pastDueMonths?.map((month) => (
                                      <div key={month} className="flex justify-between text-sm">
                                        <span>Month {month} Payment:</span>
                                        <span>{formatCurrency(3933.33)}</span>
                                      </div>
                                    ))}
                                    <div className="border-t pt-2 font-medium">
                                      <div className="flex justify-between">
                                        <span>Total Amount:</span>
                                        <span>{formatCurrency(payment.pendingAmount)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Approval Actions */}
                              {(userRole === 'loan_officer' || userRole === 'Loan Officer') && (
                                <div className="mt-4 flex gap-2">
                                  <button
                                    onClick={() => handlePaymentAction(payment.payment_id, 'approve')}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                    Approve Payment
                                  </button>
                                  <button
                                    onClick={() => handlePaymentAction(payment.payment_id, 'reject')}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                                  >
                                    <ThumbsDown className="w-4 h-4" />
                                    Reject Payment
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom section with QR and actions */}
                    {!isFuturePayment && (
                      <div className="mt-6 flex justify-between items-end">
                        {/* QR Code section */}
                        {showQR && (
                          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                            <QRCodeSVG
                              value={payment.url || ''}
                              size={100}
                              level="H"
                              includeMargin={true}
                            />
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">Scan to Pay</p>
                              <p className="text-gray-500">Use your banking app to scan</p>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          {payment.status !== 'pending' && (
                            <button
                              onClick={() => handlePayNowButtonClick(payment, payment.index - 1)}
                              className={`
                                px-6 py-2 rounded-lg font-medium flex items-center gap-2
                                ${isPastDue ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                              `}
                            >
                              <Send className="w-4 h-4" />
                              Pay Now
                            </button>
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
      )}

      {/* Add Payment Modal - Updated styling */}
      <dialog id="addPayment" className="modal">
        <div className="modal-box w-11/12 max-w-4xl bg-white rounded-2xl shadow-2xl">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3 mb-2">
                  <CreditCard className="w-7 h-7" />
                  Submit Payment
                </h1>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                  <span className="text-white/80">Amount Due:</span>
                  <span className="text-xl font-bold">
                    {selectedPayment?.hasPastDue ? (
                      <>
                        {formatCurrency(selectedPayment.amount)}
                        <span className="text-sm ml-2">
                          (Includes {selectedPayment.pastDueAmount > 0 ? 'Past Due' : 'Current'} Amount)
                        </span>
                      </>
                    ) : (
                      formatCurrency(selectedPayment?.amount || 0)
                    )}
                  </span>
                </div>
              </div>
              <button
                onClick={() => document.getElementById('addPayment').close()}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <Formik
            initialValues={{
              payment_method: '',
              reference_number: '',
              proof_of_payment: null
            }}
            validationSchema={Yup.object({
              payment_method: Yup.string().required('Payment method is required'),
              reference_number: Yup.string().required('Reference number is required'),
              proof_of_payment: Yup.mixed().required('Proof of payment is required')
            })}
            onSubmit={handlePaymentSubmit}
          >
            {({ isSubmitting, setFieldValue, values, errors, touched }) => (
              <Form className="p-8">
                <div className="space-y-6">
                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <div className="relative">
                      <Field
                        as="select"
                        name="payment_method"
                        className={`
                          w-full px-4 py-3 rounded-xl border bg-gray-50 
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          transition-all duration-200
                          ${errors.payment_method && touched.payment_method
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                          }
                        `}
                      >
                        <option value="">Select Payment Method</option>
                        <option value="GCash">GCash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                      </Field>
                      {errors.payment_method && touched.payment_method && (
                        <p className="mt-1 text-red-500 text-sm flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.payment_method}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reference Number */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Number
                    </label>
                    <Field
                      type="text"
                      name="reference_number"
                      placeholder="Enter reference number"
                      className={`
                        w-full px-4 py-3 rounded-xl border bg-gray-50 
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                        transition-all duration-200
                        ${errors.reference_number && touched.reference_number
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                        }
                      `}
                    />
                    {errors.reference_number && touched.reference_number && (
                      <p className="mt-1 text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.reference_number}
                      </p>
                    )}
                  </div>

                  {/* Proof of Payment Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proof of Payment
                    </label>
                    <div className="relative">
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="space-y-2 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="proof_of_payment"
                              className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="proof_of_payment"
                                name="proof_of_payment"
                                type="file"
                                className="sr-only"
                                onChange={(event) => {
                                  setFieldValue('proof_of_payment', event.currentTarget.files[0]);
                                }}
                                accept="image/*"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                      {errors.proof_of_payment && touched.proof_of_payment && (
                        <p className="mt-2 text-red-500 text-sm flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.proof_of_payment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => document.getElementById('addPayment').close()}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                      flex items-center gap-2 shadow-lg shadow-blue-500/30"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Payment
                      </>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </dialog>

      {/* View Payment Modal - Updated styling */}
      <dialog id="viewPayment" className="modal">
        <div className="modal-box w-11/12 max-w-4xl bg-white rounded-xl shadow-2xl">
          <div className="modal-header bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Payment Details
              </h1>
              <button
                onClick={() => document.getElementById('viewPayment').close()}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {/* Payment details content */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span>{formatCurrency(selectedPayment?.amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span>{selectedPayment?.status || 'N/A'}</span>
              </div>
              {/* Add more payment details as needed */}
            </div>
          </div>
        </div>
      </dialog>

      {/* QR Code Display Section */}
      {isGridView && selectedPayment && (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <QRCodeSVG
                value={selectedPayment.url || ''}
                size={120}
                level="H"
                includeMargin={true}
              />
              {selectedPayment.hasPastDue && (
                <div className="absolute -top-2 -right-2 bg-error text-white text-xs px-2 py-1 rounded-full">
                  {selectedPayment.pastDueMonths?.length} Past Due
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-1">Scan to Pay</h3>
              <div className="space-y-1">
                <div className="bg-error/10 text-error text-sm p-2 rounded-lg mb-2">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Payment overdue! Please pay immediately.
                </div>
                <div className="space-y-2">
                  <div className="bg-error/5 p-2 rounded-lg">
                    <p className="text-sm text-error font-medium">
                      Past Due Payments (Months {selectedPayment.pastDueMonths?.join(', ')}):
                    </p>
                    <p className="text-lg font-bold text-error">
                      {formatCurrency(selectedPayment.pastDueAmount)}
                    </p>
                  </div>
                  {selectedPayment.currentAmount > 0 && (
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium">
                        Current Payment (Month {selectedPayment.index + 1}):
                      </p>
                      <p className="text-lg font-bold text-blue-700">
                        {formatCurrency(selectedPayment.currentAmount)}
                      </p>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <p className="text-base font-bold">
                      Total Due: {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default LoanCalculator;