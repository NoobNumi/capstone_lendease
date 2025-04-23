import React, { useRef, useState, useEffect } from "react";
import { PrinterIcon, Grid, List, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from 'qrcode.react';
import { StatusPill } from '../../pages/protected/DataTables/Table';
import axios from 'axios';
import format from 'date-fns/format';
import LoanReleaseStatement from "./LoanReleaseStatement";

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

    const today = new Date();
    let pastDuePayments = [];
    let currentPayment = null;
    let futurePayments = [];

    // Check if loan is approved and disbursed
    const isLoanActive = selectedLoan?.loan_status === 'Approved' || selectedLoan?.loan_status === 'Disbursed';

    // First check for pending payment
    const pendingPayment = loanPaymentList?.find(payment =>
      payment.payment_status === 'Pending'
    );

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

  const combinedPayments = getCombinedPayments(payments, loanPaymentList);

  return (
    <div className="mb-8">
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={handlePrint}
          className="btn btn-primary flex items-center gap-2"
        >
          <PrinterIcon className="w-5 h-5" />
          Print Statement
        </button>
      </div>

      <LoanReleaseStatement
        selectedLoan={selectedLoan}
        calculatorInterestRate={calculatorInterestRate}
        calculatorLoanAmmount={calculatorLoanAmmount}
        calculatorMonthsToPay={calculatorMonthsToPay}
        printableRef={printableRef}
      />
    </div>
  );
};

export default LoanSchedule;
