import React, { useRef, useState, useEffect } from "react";
import { PrinterIcon, Grid, List } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from 'qrcode.react';
import { StatusPill } from '../../pages/protected/DataTables/Table';
import axios from 'axios';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
              {payments.map((payment, index) => {
                const paymentStatus = loanPaymentList.find(p => p.selectedTableRowIndex === index + 2);
                const isPaid = paymentStatus?.payment_status === 'Approved';
                const isPending = paymentStatus?.payment_status === 'Pending';
                const isOverdue = new Date(payment.transactionDate) < new Date();
                const qrDetails = getQRCodeDetails(payments, loanPaymentList);
                const isCurrentPayment = index === qrDetails?.index;


                console.log({ paymentStatus })
                return (
                  <tr key={index} className={`border-b hover:bg-gray-50 
                    ${isPending ? 'bg-amber-50' :
                      isPaid ? 'bg-emerald-50' :
                        isOverdue ? 'bg-rose-50' : ''}`}>
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">
                      {isCurrentPayment ? (
                        <QRCodeSVG
                          value={qrDetails?.url || ''}
                          size={50}
                          className="cursor-pointer hover:opacity-80"
                        />
                      ) : (
                        <QRCodeSVG
                          value={`${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/app/loan_details/${selectedLoan?.loan_id}/selectedTableRowIndex/${index + 1}`}
                          size={50}
                          className={isPaid ? 'opacity-20' : ''}
                        />
                      )}
                    </td>
                    <td className="py-3 px-4">{new Date(payment.transactionDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(payment.principal)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(payment.amountPrincipal)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(payment.interestAmount)}</td>
                    <td className="py-3 px-4 text-right bg-blue-50/30">
                      <div className="font-medium text-blue-900">
                        {formatCurrency(payment.dueAmount)}
                      </div>
                      {isCurrentPayment && qrDetails?.hasPastDue && (
                        <div className="mt-1">
                          <div className="text-xs text-red-600 font-medium">
                            + {formatCurrency(qrDetails.pastDueAmount)}
                          </div>
                          <div className="text-xs text-red-500">Past Due</div>
                        </div>
                      )}
                      {isPaid && (
                        <div className="text-xs text-green-600 mt-1">
                          Paid ✓
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
                      {paymentStatus?.payment_status ? (
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${paymentStatus.payment_status === 'Approved' ? 'bg-green-100 text-green-800' :
                            paymentStatus.payment_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              paymentStatus.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'}
                        `}>
                          {paymentStatus.payment_status}
                          {paymentStatus.remarks && (
                            <div className="text-xs text-gray-500 mt-1">
                              {paymentStatus.remarks}
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
