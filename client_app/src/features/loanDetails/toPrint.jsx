import React, { useRef, useState, useEffect } from "react";
import { PrinterIcon } from "lucide-react";
import { useReactToPrint } from "react-to-print";

import { QRCodeSVG } from 'qrcode.react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
const LoanSchedule = ({ selectedLoan, calculatorInterestRate, calculatorLoanAmmount, calculatorMonthsToPay }) => {
  const printableRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printableRef.current,
  });


  //console.log({ calculatorMonthsToPay })




  const [loanAmount, setLoanAmount] = useState(calculatorLoanAmmount);
  const [interestRate, setInterestRate] = useState(calculatorInterestRate); // Editable interest rate
  const [totalPayment, setTotalPayment] = useState(0); // Will be calculated automatically
  const [loanDuration, setLoanDuration] = useState(calculatorMonthsToPay);
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState(loanAmount);

  const [selectedIndex, setselectedIndex] = useState(1);
  const [loanPaymentList, setloanPaymentList] = useState([]);


  useEffect(() => {
    // Calculate total payment based on loan amount and interest rate
    const computedTotalPayment = loanAmount * (1 + interestRate / 100);

    // Set the total payment directly without rounding
    setTotalPayment(computedTotalPayment);

    // Calculate the interest (Total Payment - Loan Amount)
    const interest = computedTotalPayment - loanAmount;

    // Calculate the monthly interest and principal payment
    const monthlyInterestAmount = interest / loanDuration; // No rounding
    const principal = loanAmount / loanDuration;  // No rounding
    let remainingBalance = computedTotalPayment;
    let paymentDetails = [];
    let remainingPrincipal = loanAmount;

    for (let i = 1; i <= loanDuration; i++) {
      const amountPrincipal = principal; // No rounding

      const amount = principal + monthlyInterestAmount; // No rounding
      remainingBalance = remainingBalance - amount;  // Subtract the principal from the remaining balance

      remainingPrincipal = i === 1 ? remainingPrincipal : remainingPrincipal - amountPrincipal;  // Subtract the principal from the remaining balance

      paymentDetails.push({
        transactionDate: new Date(2024, i - 1, 15).toLocaleDateString(),
        principal: remainingPrincipal,  // First row shows full loan amount, others show the regular principal
        amount: amount,  // Total monthly payment without rounding
        interestAmount: monthlyInterestAmount, // Interest without rounding
        dueAmount: amount, // Due amount without rounding
        datePaid: new Date(2024, i - 1, 15).toLocaleDateString(),
        remainingBalance: remainingBalance,
        amountPrincipal: amountPrincipal
      });
    }

    setPayments(paymentDetails);
    setBalance(remainingBalance);
  }, [loanAmount, interestRate, loanDuration]); // Dependency array to recalculate on these state changes


  // Calculate totals for Amount and Interest Amount
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalInterestAmount = payments.reduce((sum, payment) => sum + payment.interestAmount, 0);
  const totalDueAmount = payments.reduce((sum, payment) => sum + payment.dueAmount, 0);


  // console.log({ payments })
  const [isHidden, setIsHidden] = useState(true);

  return (
    <div className={`max-w-4xl mx-auto p-1 mb-2 bg-white`}>
      {/* Print Button - Hidden when printing */}
      <div className="print:hidden ">
        <button
          onClick={() => {



            setIsHidden(false); // Hide the element
            setTimeout(() => {
              handlePrint()
              setIsHidden(true); // Show the element again after printing
            }, 1000); // Small delay to allow the print dialog to open


          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <PrinterIcon className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Printable Content */}
      <div id="printable-content" ref={printableRef}

        className={`className="bg-white ${isHidden ? "hidden" : ""}`}

      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img
              src={'/LOGO.png'}
              alt="RAZV Logo"
              className="w-10 h-10"
            />
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
              <tr className="border-t border-b">
                <th className="py-2 text-left">No.</th>
                <th className="py-2 text-left">QR</th>
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-right">PRINCIPAL</th>
                <th className="py-2 text-right">PRIN AMOUNT</th>
                <th className="py-2 text-right">INT AMOUNT</th>
                <th className="py-2 text-right">DUE AMOUNT</th>
                <th className="py-2 text-right">BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">

                    <QRCodeSVG


                      value={

                        `${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/app/loan_details/${selectedLoan?.loan_id}/selectedTableRowIndex/${index + 1}`

                      }

                      size={50} />


                  </td>
                  <td className="py-2">{payment.transactionDate}</td>
                  <td className="py-2 text-right">{payment.principal.toFixed(2)}</td>
                  <td className="py-2 text-right">{payment.amountPrincipal?.toFixed(2)}</td>
                  <td className="py-2 text-right">{payment.interestAmount.toFixed(2)}</td>
                  <td className="py-2 text-right">{payment.dueAmount.toFixed(2)}</td>
                  <td className="py-2 text-right">{payment.remainingBalance?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoanSchedule;
