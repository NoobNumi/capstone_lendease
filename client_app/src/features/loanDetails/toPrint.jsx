import React, { useRef, useState, useEffect } from "react";
import { PrinterIcon, Grid, List, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from 'qrcode.react';
import { StatusPill } from '../../pages/protected/DataTables/Table';
import axios from 'axios';
import format from 'date-fns/format';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
};

const LoanSchedule = ({
  isGridView,
  setIsGridView,
  selectedLoan,
  calculatorInterestRate,
  calculatorLoanAmmount,
  calculatorMonthsToPay,
  rowIndex
}) => {
  const printableRef = useRef();
  const [payments, setPayments] = useState([]);
  const [loanPaymentList, setLoanPaymentList] = useState([]);
  const [isHidden, setIsHidden] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const getQRCodeDetails = (payments, loanPaymentList) => {
    if (!payments?.length || !loanPaymentList?.length || !selectedLoan?.loan_id) return null;

    try {
      const today = new Date();
      let pastDueAmount = 0;
      let currentPaymentIndex = -1;
      let currentAmount = 0;

      // Track payment statuses
      const paymentStatuses = {};
      loanPaymentList.forEach(payment => {
        if (payment?.payment_status) {
          paymentStatuses[payment.selectedTableRowIndex] = payment.payment_status;
        }
      });

      // Find current due payment and calculate past due
      for (let i = 0; i < payments.length; i++) {
        const paymentDate = new Date(payments[i].transactionDate);
        const status = paymentStatuses[i + 1];

        if (paymentDate <= today && status !== 'Approved') {
          if (currentPaymentIndex === -1) {
            currentPaymentIndex = i;
            currentAmount = payments[i].dueAmount;
          } else {
            pastDueAmount += payments[i].dueAmount;
          }
        }
      }

      return {
        index: currentPaymentIndex,
        amount: currentAmount + pastDueAmount,
        pastDueAmount,
        hasPastDue: pastDueAmount > 0,
        url: currentPaymentIndex !== -1 ?
          `${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/app/loan_details/${selectedLoan.loan_id}/selectedTableRowIndex/${currentPaymentIndex + 1}`
          : ''
      };
    } catch (error) {
      console.error('Error in getQRCodeDetails:', error);
      return null;
    }
  };

  const fetchLoanPaymentList = async () => {
    try {
      setIsLoading(true);
      if (!selectedLoan?.loan_id) return;

      const res = await axios.get(`loan/${selectedLoan.loan_id}/paymentList`);
      if (res?.data?.data) {
        setLoanPaymentList(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching loan payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePayments = () => {
    try {
      if (!calculatorLoanAmmount || !calculatorInterestRate || !calculatorMonthsToPay) return;

      const computedTotalPayment = calculatorLoanAmmount * (1 + calculatorInterestRate / 100);
      const interest = computedTotalPayment - calculatorLoanAmmount;
      const monthlyInterestAmount = interest / calculatorMonthsToPay;
      const principal = calculatorLoanAmmount / calculatorMonthsToPay;
      let remainingBalance = computedTotalPayment;
      let paymentDetails = [];
      let remainingPrincipal = calculatorLoanAmmount;

      const startDate = selectedLoan?.approval_date ? new Date(selectedLoan.approval_date) : new Date();

      for (let i = 1; i <= calculatorMonthsToPay; i++) {
        const amountPrincipal = principal;
        const amount = principal + monthlyInterestAmount;
        remainingBalance -= amount;
        remainingPrincipal = i === 1 ? remainingPrincipal : remainingPrincipal - amountPrincipal;

        const paymentDate = new Date(startDate);
        paymentDate.setMonth(startDate.getMonth() + i - 1);

        paymentDetails.push({
          transactionDate: paymentDate.toISOString(),
          principal: remainingPrincipal,
          amount,
          interestAmount: monthlyInterestAmount,
          dueAmount: amount,
          remainingBalance,
          amountPrincipal
        });
      }

      setPayments(paymentDetails);
    } catch (error) {
      console.error('Error calculating payments:', error);
    }
  };

  useEffect(() => {
    fetchLoanPaymentList();
  }, [selectedLoan?.loan_id]);

  useEffect(() => {
    calculatePayments();
  }, [calculatorLoanAmmount, calculatorInterestRate, calculatorMonthsToPay, selectedLoan?.approval_date]);

  const handlePrint = useReactToPrint({
    content: () => printableRef.current,
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (!selectedLoan?.loan_id) {
    return <div className="text-center py-4">No loan data available</div>;
  }

  const totalAmount = payments?.reduce((sum, payment) => sum + (payment?.amount || 0), 0) || 0;
  const totalInterestAmount = payments?.reduce((sum, payment) => sum + (payment?.interestAmount || 0), 0) || 0;
  const totalDueAmount = payments?.reduce((sum, payment) => sum + (payment?.dueAmount || 0), 0) || 0;

  // Function to get combined payments matching PaymentsLogicView
  const getCombinedPayments = (payments, loanPaymentList) => {
    console.log('getCombinedPayments inputs:', { payments, loanPaymentList });

    if (!payments?.length) return [];

    // First check for pending combined payment
    const pendingPayment = loanPaymentList?.find(payment =>
      payment.payment_status === 'Pending' &&
      payment.includes_past_due === 1
    );

    // If there's a pending payment, handle it specially
    if (pendingPayment) {
      // Extract month numbers from remarks (e.g., "Combined payment - Past due: 1, 2, 3")
      const monthsMatch = pendingPayment.remarks.match(/Past due: ([\d, ]+)/);
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
        includesCurrentPayment: pendingPayment.remarks.includes('& Current'),
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

    // If no pending payment, process normally
    const today = new Date();
    let pastDuePayments = [];
    let currentPayment = null;
    let futurePayments = [];

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
        status: dueDate < today ? 'past_due' : 'due',
        paymentStatus: paymentStatus?.payment_status,
        paymentMethod: paymentStatus?.payment_method,
        referenceNumber: paymentStatus?.reference_number,
        paymentDate: paymentStatus?.payment_date,
        remarks: paymentStatus?.remarks
      };

      if (dueDate < today) {
        pastDuePayments.push(formattedPayment);
      } else if (!currentPayment) {
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

  const combinedPayments = getCombinedPayments(payments, loanPaymentList);

  return (
    <div className={`max-w-4xl mx-auto mb-2 bg-white`}>
      {/* Print/View Toggle Buttons */}
      <div className="flex print:hidden justify-end gap-2 mb-4">
        <button
          onClick={() => setIsGridView(prev => !prev)}
          className="px-4 py-2 bg-gray-500 text-white rounded flex items-center gap-2"
        >
          {isGridView ? (
            <>
              <List className="w-5 h-5" />
              List View
            </>
          ) : (
            <>
              <Grid className="w-5 h-5" />
              Grid View
            </>
          )}
        </button>
        <button
          onClick={() => {
            setIsHidden(false);
            setTimeout(() => {
              handlePrint();
              setIsHidden(true);
            }, 100);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2"
        >
          <PrinterIcon className="w-5 h-5" />
          Print
        </button>
      </div>

      {/* Printable Content */}
      <div ref={printableRef} className={`bg-white ${isHidden ? "hidden" : ""}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="/LOGO.png" alt="RAZV Logo" className="w-10 h-10" />
            <h1 className="text-2xl font-bold">RAZV LENDING CORPORATION</h1>
          </div>
          <p className="text-sm">Jose Arcilla Street, Concepcion Virac, Catanduanes</p>
          <p className="text-sm">SEC Registration No: 201706817</p>
          <p className="text-sm">Mobile No.: 09984059118 || Landline Phone No.:(052)811-4017</p>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-6 border-t border-b py-2">
          LOAN REPAYMENT SCHEDULE
        </h2>

        {/* Loan Details */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div>
            <p>
              <span className="font-semibold">Name:</span> {selectedLoan.first_name}
              {selectedLoan.middle_name}   {selectedLoan.last_name}
            </p>
            <p>
              <span className="font-semibold">Member ID:</span> {selectedLoan.loan_id}
            </p>
            <p>
              <span className="font-semibold">Loan Type:</span> {
                selectedLoan.loan_type_value
              }
            </p>
            <p>
              <span className="font-semibold">Loan Amount:</span> {
                selectedLoan.loan_amount
              }
            </p>
            <p>
              <span className="font-semibold">Interest amount:</span> {totalInterestAmount}
            </p>
          </div>
          <div>
            <p>
              <span className="font-semibold">Date Release:</span> 2024/04/19
            </p>
            <p>
              <span className="font-semibold">Duration:</span> {selectedLoan.repayment_schedule_id}
            </p>
            <p>
              <span className="font-semibold">Paymode:</span> Monthly
            </p>
            <p>
              <span className="font-semibold">Interest rate:</span> {calculatorInterestRate}
            </p>
          </div>
          <div>
            <p>
              <span className="font-semibold">Prepaid Interest:</span> -
            </p>
            <p>
              <span className="font-semibold">Interest Balance:</span> -
            </p>
            <p>
              <span className="font-semibold">Total:</span> {totalDueAmount}
            </p>
          </div>
        </div>

        {/* Payment Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-t border-b bg-gray-50">
                <th className="py-3 text-left px-4">No.</th>
                <th className="py-3 text-left px-4">QR</th>
                <th className="py-3 text-left px-4">Due Date</th>
                <th className="py-3 text-right px-4">PRINCIPAL</th>
                <th className="py-3 text-right px-4">PRIN AMOUNT</th>
                <th className="py-3 text-right px-4">INT AMOUNT</th>
                <th className="py-3 text-right px-4 bg-blue-50">
                  <div>DUE AMOUNT</div>
                  <div className="text-xs text-gray-500">(Principal + Interest)</div>
                </th>
                <th className="py-3 text-right px-4 bg-green-50">
                  <div>BALANCE</div>
                  <div className="text-xs text-gray-500">(Remaining)</div>
                </th>
                <th className="py-3 text-center px-4 print:hidden">Status</th>
              </tr>
            </thead>
            <tbody>
              {combinedPayments.map((payment, index) => {
                const isPending = payment.paymentStatus === 'Pending';
                const isPastDue = payment.status === 'past_due';
                const qrDetails = getQRCodeDetails(payments, loanPaymentList);
                const isCurrentPayment = index === qrDetails?.index;

                return (
                  <tr key={index} className={`border-b hover:bg-gray-50 
                    ${isPending ? 'bg-amber-50' : isPastDue ? 'bg-rose-50' : ''}`}>
                    <td className="py-3 px-4">{
                      payment.isMultipleMonths ?
                        `Months ${payment.pastDueMonths.join(', ')}${payment.includesCurrentPayment ? ' & Current' : ''}` :
                        `Month ${payment.index}`
                    }</td>
                    <td className="py-3 px-4">
                      {payment.showQR && (
                        <QRCodeSVG
                          value={`${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/app/loan_details/${selectedLoan?.loan_id}/selectedTableRowIndex/${payment.index}`}
                          size={50}
                        />
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
                    <td className="py-3 px-4 text-center print:hidden">
                      {payment.paymentStatus ? (
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${payment.paymentStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                            payment.paymentStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                              payment.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'}
                        `}>
                          {payment.paymentStatus}
                          {payment.remarks && (
                            <div className="text-xs text-gray-500 mt-1">
                              {payment.remarks}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Upcoming</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t border-b font-semibold bg-gray-50">
                <td colSpan="3" className="py-3 px-4">Total</td>
                <td className="py-3 px-4 text-right">{formatCurrency(totalAmount - totalInterestAmount)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(totalAmount - totalInterestAmount)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(totalInterestAmount)}</td>
                <td className="py-3 px-4 text-right bg-blue-50/30 font-bold text-blue-900">
                  {formatCurrency(totalDueAmount)}
                </td>
                <td className="py-3 px-4 text-right bg-green-50/30">-</td>
                <td className="print:hidden"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoanSchedule;
