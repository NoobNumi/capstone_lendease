import React, { useState, useEffect, memo } from 'react';

import InputText from '../../components/Input/InputText';
import Dropdown from '../../components/Input/Dropdown';
import { Formik, useField, useFormik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useDropzone } from "react-dropzone";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import Table, {

  StatusPill,

} from '../../pages/protected/DataTables/Table';

import { QRCodeSVG } from 'qrcode.react';
import Radio from '../../components/Input/Radio';

import { NavLink, Routes, Link, useLocation, useNavigate, useParams } from 'react-router-dom';



const PaymentSummary = ({ totalPayments, completedPayments, totalAmount, amountPaid }) => {
  const paymentProgress = (completedPayments / totalPayments) * 100 || 0;
  const amountProgress = (amountPaid / totalAmount) * 100 || 0;

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h2>

      {/* Number of Payments */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-600">
            Payments: {completedPayments} / {totalPayments}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {paymentProgress.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${paymentProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Total Amount Paid */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-600">
            Amount Paid: ${amountPaid.toLocaleString()} / ${totalAmount.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {amountProgress.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${amountProgress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
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


  //console.log({ selectedLoan })
  const navigate = useNavigate();

  const { loanId, rowIndex } = useParams();

  let loan_status = values.loan_status || selectedLoan?.loan_status;




  const [loanAmount, setLoanAmount] = useState(calculatorLoanAmmount);
  const [interestRate, setInterestRate] = useState(calculatorInterestRate); // Editable interest rate
  const [totalPayment, setTotalPayment] = useState(0); // Will be calculated automatically
  const [loanDuration, setLoanDuration] = useState(calculatorMonthsToPay);
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState(loanAmount);


  const [selectedPayment, setselectedPayment] = useState(loanAmount);


  const [selectedIndex, setselectedIndex] = useState(1);

  const [loanPaymentList, setloanPaymentList] = useState([]);

  const [isLoaded, setIsLoaded] = useState([]);



  const [isFromPayNowButton, setisFromPayNowButton] = useState(false);


  const fetchloanPaymentList = async () => {
    try {
      let res = await axios({
        method: 'get',
        url: `loan/${selectedLoan?.loan_id || loanId}/paymentList`,
        data: {}
      });
      let list = res.data.data;
      setloanPaymentList(list);

      // Force recalculation of QR details after payment list update
      const qrDetails = getQRCodeDetails(payments, list);
      if (qrDetails) {
        setselectedPayment({
          ...selectedPayment,
          amount: qrDetails.amount,
          hasPastDue: qrDetails.hasPastDue,
          pastDueAmount: qrDetails.pastDueAmount,
          isOverdue: qrDetails.isOverdue
        });
      }
    } catch (error) {
      console.error('Error fetching payment list:', error);
    }
  };

  useEffect(() => {

    if (selectedLoan?.loan_id || loanId) {
      fetchloanPaymentList()




    }


  }, []);





  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

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

    if (setPaymentList) {
      setPaymentList(paymentDetails)
    }



    if (rowIndex) {



      const payment = paymentDetails[rowIndex - 1]; // take note to minus 1 becaase of array index
      handlePayNowButtonClick(payment, rowIndex); // rowIndex no minues 1 because in db it starts with 1 

    }

    setBalance(remainingBalance);
  }, [loanAmount, interestRate, loanDuration]); // Dependency array to recalculate on these state changes





  // useEffect(() => {


  //   console.log({ payments })
  // }, [rowIndex]); // Dependency array ensures this runs when rowIndex changes




  // Calculate totals for Amount and Interest Amount
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalInterestAmount = payments.reduce((sum, payment) => sum + payment.interestAmount, 0);
  const totalDueAmount = payments.reduce((sum, payment) => sum + payment.dueAmount, 0);

  const [files, setFiles] = useState({
    proofOfPayment: null

  });

  const handlePayNowButtonClick = (payment, selectedIndex, fromButton) => {
    // Get QR details to handle past due amounts
    const qrDetails = getQRCodeDetails(payments, loanPaymentList);

    // Update the payment object with past due information
    const updatedPayment = {
      ...payment,
      amount: qrDetails.amount, // Total amount including past due
      originalAmount: payment.amount, // Keep original amount
      hasPastDue: qrDetails.hasPastDue,
      pastDueAmount: qrDetails.pastDueAmount,
      isOverdue: qrDetails.isOverdue
    };

    setselectedPayment(updatedPayment);
    setselectedIndex(selectedIndex);
    setIsLoaded(true);

    if (isLoaded) {
      document.getElementById('addPayment').showModal();
    }
  };

  const dropzoneProps = (fieldName) => ({
    onDrop: (files) => onDrop(files, fieldName),
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const DropzoneArea = ({ fieldName, files, dropzoneProps, setFieldValue, errors }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      ...dropzoneProps,
      onDrop: (acceptedFiles) => {

        setFieldValue(fieldName, acceptedFiles[0]);
        if (acceptedFiles.length > 0) {
          // Update files state with the new file
          setFiles((prevFiles) => ({
            ...prevFiles,
            [fieldName]: acceptedFiles[0],
          }));
        }
      },
    });


    let hasError = errors[fieldName];
    return (
      <div
        {...getRootProps()}
        className={`flex justify-center items-center w-full h-32 p-4 border-2 
         
            ${isDragActive ? "border-blue-500" : "border-gray-300"
          } border-dashed rounded-md text-sm cursor-pointer`}
      >
        <input {...getInputProps()} />
        <div>
          {files[fieldName] ? (
            <p className="text-gray-700">
              {files[fieldName].name} <span className="text-green-500">(Selected)</span>
            </p>
          ) : (
            <p className="text-gray-500">
              Drag and drop a file here, or click to select a file.
            </p>
          )}
        </div>
      </div>
    );
  };


  //console.log({ loanPaymentList })

  const [selectedImage, setSelectedImage] = useState(null);
  const totalPayments = 10; // Example: Total expected payments
  const completedPayments = 7; // Example: Payments made so far
  const totalAmounts = 5000; // Example: Total expected amount
  const amountPaid = 3500; // Example: Amount paid so far


  let checkActivePayment = loanPaymentList.find(lp => lp.selectedTableRowIndex === parseInt(rowIndex))



  // New function to calculate QR code amount and details
  const getQRCodeDetails = (payments, loanPaymentList) => {
    if (!payments.length || !loanPaymentList) return null;

    let pastDueAmount = 0;
    let currentPaymentIndex = -1;
    const today = new Date();

    // Track paid amounts for each payment index
    const paidAmounts = {};
    loanPaymentList.forEach(payment => {
      if (payment.payment_status === 'Approved') {
        paidAmounts[payment.selectedTableRowIndex] = parseFloat(payment.payment_amount);
      }
    });

    // First, find the first unpaid payment
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      const paymentDueDate = new Date(payment.transactionDate);
      const paidAmount = paidAmounts[i + 1] || 0;
      const remainingAmount = payment.dueAmount - paidAmount;

      // If this payment is not fully paid
      if (remainingAmount > 0) {
        if (currentPaymentIndex === -1) {
          currentPaymentIndex = i;
        }

        // If the payment is past due, add to past due amount
        if (paymentDueDate < today) {
          pastDueAmount += remainingAmount;
        }
      }
    }

    // If no unpaid payments found
    if (currentPaymentIndex === -1) return null;

    const currentPayment = payments[currentPaymentIndex];
    const currentDueDate = new Date(currentPayment.transactionDate);
    const currentPaidAmount = paidAmounts[currentPaymentIndex + 1] || 0;
    const currentRemainingAmount = currentPayment.dueAmount - currentPaidAmount;

    // For any payment that is past due (including first payment)
    if (currentDueDate < today) {
      return {
        index: currentPaymentIndex,
        amount: pastDueAmount, // Return total past due amount
        dueDate: currentPayment.transactionDate,
        hasPastDue: true,
        pastDueAmount: pastDueAmount - currentRemainingAmount, // Past due minus current payment
        originalAmount: currentPayment.dueAmount,
        isOverdue: true,
        totalDue: pastDueAmount // Add total amount for reference
      };
    }

    // For current (not overdue) payments
    return {
      index: currentPaymentIndex,
      amount: currentRemainingAmount + pastDueAmount,
      dueDate: currentPayment.transactionDate,
      hasPastDue: pastDueAmount > currentRemainingAmount,
      pastDueAmount: pastDueAmount > currentRemainingAmount ? pastDueAmount - currentRemainingAmount : 0,
      originalAmount: currentPayment.dueAmount,
      isOverdue: false,
      totalDue: currentRemainingAmount + pastDueAmount
    };
  };

  // Add this function to format dates consistently
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return isLoaded && (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-md">


      {/* <PaymentSummary
        totalPayments={totalPayments}
        completedPayments={completedPayments}
        totalAmount={totalAmounts}
        amountPaid={amountPaid}
      />
 */}

      {/* <h4 className="text-2xl font-bold mb-8 text-center text-gray-800">Loan Calculator</h4> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <label htmlFor="loanAmount" className="block text-sm font-semibold text-gray-700 mb-2">Loan Amount</label>

          <InputText
            isRequired
            placeholder=""
            disabled={isReadOnly}
            name="calculatorLoanAmmount"
            type="number"
            value={values?.calculatorLoanAmmount} // Bind value to Formik state
            onBlur={handleBlur}
            onChange={(e) => {
              setLoanAmount(Number(e.target.value))
              setFieldValue('calculatorLoanAmmount', e.target.value)
            }}
            isReadOnly={isReadOnly}



          />

        </div>
        <div>
          <label htmlFor="interestRate" className="block text-sm font-semibold text-gray-700 mb-2">Interest Rate (%)</label>
          {/* <input
            id="interestRate"
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          /> */}
          <InputText
            isRequired
            placeholder=""
            disabled={true}
            name="calculatorInterestRate"
            type="number"
            value={values?.calculatorInterestRate} // Bind value to Formik state
            onBlur={handleBlur}
            onChange={(e) => {
              setInterestRate(Number(e.target.value))
              setFieldValue('calculatorInterestRate', e.target.value)
            }}
            isReadOnly={true}

          />

        </div>
        <div>
          <label htmlFor="loanDuration" className="block text-sm font-semibold text-gray-700 mb-2">Loan Duration (Months)</label>
          {/* <input
            id="loanDuration"
            type="number"
            value={loanDuration}

            onChange={(e) => setLoanDuration(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          /> */}

          <InputText
            isRequired
            disabled={isReadOnly}
            placeholder=""
            name="calculatorMonthsToPay"
            type="number"
            value={values?.calculatorMonthsToPay} // Bind value to Formik state
            onBlur={handleBlur}
            onChange={(e) => {
              setLoanDuration(Number(e.target.value))
              setFieldValue('calculatorMonthsToPay', e.target.value)
              setFieldValue('calculatorInterestRate', (e.target.value * 3).toFixed(2))
              setInterestRate(Number(e.target.value * 3).toFixed(2))


            }}
            isReadOnly={isReadOnly}
          />

        </div>
        <div>
          <label htmlFor="totalPayment" className="block text-sm font-semibold text-gray-700 mb-2">Total Payment (₱)</label>
          <input
            id="totalPayment"
            type="number"
            value={totalPayment.toFixed(2)}
            readOnly
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none"
          />
        </div>
      </div>
      <div className="overflow-auto">


        {
          console.log({ payments })
        }
        {isGridView && (
          <div className="max-w-3xl mx-auto mt-8">
            {(() => {
              const qrDetails = getQRCodeDetails(payments, loanPaymentList);

              if (!qrDetails) return (
                <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-4 text-lg font-medium text-gray-600">No pending payments</p>
                  <p className="mt-2 text-sm text-gray-500">All payments are up to date</p>
                </div>
              );

              const url = `${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/app/loan_details/${selectedLoan?.loan_id}/selectedTableRowIndex/${qrDetails.index + 1}`;

              return (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Payment QR Code</h2>
                      <p className="text-sm text-gray-500 mt-1">Scan to process payment</p>
                    </div>

                    {/* Status Indicators */}
                    <div className="space-y-4 mb-6">
                      {qrDetails.isOverdue && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Payment Overdue!</h3>
                              <p className="text-sm text-red-700 mt-1">
                                Total accumulated amount: {formatCurrency(qrDetails.totalDue)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {qrDetails.hasPastDue && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-800">Past Due Notice</h3>
                              <div className="mt-2 text-sm text-yellow-700">
                                <p>Past due amount: {formatCurrency(qrDetails.pastDueAmount)}</p>
                                <p>Current payment: {formatCurrency(qrDetails.originalAmount)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Details */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Due Date</p>
                          <p className="text-lg font-medium text-gray-900">{qrDetails.dueDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Amount Due</p>
                          <p className="text-lg font-medium text-gray-900">{formatCurrency(qrDetails.amount)}</p>
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    {loan_status === "Approved" && selectedLoan?.proof_of_disbursement && (
                      <div className="flex flex-col items-center">
                        <div
                          onClick={async () => {
                            setisFromPayNowButton(true);
                            await handlePayNowButtonClick(payments[qrDetails.index], qrDetails.index + 1, true);
                          }}
                          className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        >
                          <QRCodeSVG
                            value={url}
                            size={240}
                            level="H"
                            className="mx-auto"
                            includeMargin={true}
                          />
                        </div>
                        <p className="mt-4 text-sm text-gray-500">Click or scan QR code to make payment</p>
                      </div>
                    )}
                  </div>

                  {/* Footer with Payment Instructions */}
                  <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900">Payment Instructions:</h4>
                    <ol className="mt-2 text-sm text-gray-600 list-decimal list-inside space-y-1">
                      <li>Scan the QR code using your payment app</li>
                      <li>Verify the payment amount and details</li>
                      <li>Complete the payment and keep the reference number</li>
                      <li>Upload proof of payment when prompted</li>
                    </ol>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {!isGridView && (
          <table className="w-full mt-8 table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Due Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Amount</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Payment Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Reference No.</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => {
                const paymentStatus = loanPaymentList.find(
                  (lp) => lp.selectedTableRowIndex === index + 1
                );

                return (
                  <tr key={index} className={`border-b ${paymentStatus?.payment_status === 'Pending' ? 'bg-yellow-50' :
                    paymentStatus?.payment_status === 'Approved' ? 'bg-green-50' :
                      new Date(payment.transactionDate) < new Date() ? 'bg-red-50' : ''
                    }`}>
                    <td className="px-4 py-3 text-sm">{payment.transactionDate}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(payment.dueAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${paymentStatus?.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        paymentStatus?.payment_status === 'Approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {paymentStatus?.payment_status || 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {paymentStatus?.payment_date ? new Date(paymentStatus.payment_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {paymentStatus?.reference_number || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {paymentStatus ? (
                        <button
                          onClick={() => handleViewPayment(payment, index + 1)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePayNowButtonClick(payment, index + 1)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

      </div>

      <dialog id="addPayment" className="modal">
        <div className="modal-box w-11/12 max-w-4xl bg-white rounded-lg shadow-xl">
          <div className="modal-header bg-gradient-to-r from-blue-900 to-blue-950 p-4 text-white rounded-t-lg">
            <h1 className="text-xl font-bold">Payment Review</h1>
          </div>

          <div className="p-6">
            {/* Payment Status Banner */}
            <div className={`mb-6 p-4 rounded-lg ${selectedPayment.isOverdue ? 'bg-red-50 border-l-4 border-red-500' : 'bg-yellow-50 border-l-4 border-yellow-500'
              }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {selectedPayment.isOverdue ? (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${selectedPayment.isOverdue ? 'text-red-800' : 'text-yellow-800'}`}>
                    {selectedPayment.isOverdue ? 'Payment Overdue' : 'Payment Pending Review'}
                  </h3>
                  <p className={`text-sm ${selectedPayment.isOverdue ? 'text-red-700' : 'text-yellow-700'}`}>
                    Due Date: {formatDate(selectedPayment.datePaid)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Details Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Regular Payment</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(selectedPayment.originalAmount)}</p>
                <div className="mt-2 space-y-1 text-sm text-gray-500">
                  <p>Principal: {formatCurrency(selectedPayment.amountPrincipal)}</p>
                  <p>Interest: {formatCurrency(selectedPayment.interestAmount)}</p>
                </div>
              </div>

              {selectedPayment.hasPastDue && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-red-800">Past Due Amount</h3>
                  <p className="mt-1 text-2xl font-semibold text-red-900">{formatCurrency(selectedPayment.pastDueAmount)}</p>
                  <p className="mt-2 text-sm text-red-600">Remaining Balance: {formatCurrency(selectedPayment.remainingBalance)}</p>
                </div>
              )}
            </div>

            {/* Total Amount Section */}
            <div className="bg-gray-900 text-white p-6 rounded-lg mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Total Amount Due</h3>
                  <p className="text-sm opacity-75">Including all past due amounts</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{formatCurrency(selectedPayment.amount)}</p>
                </div>
              </div>
            </div>

            {/* Approval Actions */}
            <Formik
              initialValues={{
                action: '',
                remarks: ''
              }}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  await axios.post(
                    `/loan/${selectedLoan.loan_id}/updatePaymentStatus`,
                    {
                      action: values.action,
                      remarks: values.remarks,
                      selectedTableRowIndex: selectedIndex
                    }
                  );

                  document.getElementById('addPayment').close();
                  toast.success(`Payment ${values.action.toLowerCase()} successfully`);
                  await fetchloanPaymentList();
                } catch (error) {
                  toast.error('Failed to update payment status');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ values, handleSubmit, isSubmitting }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                    <Field
                      as="textarea"
                      name="remarks"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter any additional notes or remarks..."
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      onClick={() => document.getElementById('addPayment').close()}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={() => {
                        values.action = 'Approved';
                        handleSubmit();
                      }}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      Approve Payment
                    </button>
                    <button
                      type="submit"
                      onClick={() => {
                        values.action = 'Rejected';
                        handleSubmit();
                      }}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Reject Payment
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </dialog>

      <dialog id="viewPayment" className="modal rounded-lg shadow-lg">
        <div className="modal-box w-11/12 max-w-4xl">
          <div className="modal-header bg-gradient-to-r from-blue-900 to-blue-950 p-4 text-white rounded-t-lg">
            <h1 className="text-xl font-bold">Payment Details</h1>
          </div>

          <Formik
            initialValues={{
              action: '',
              remarks: ''
            }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const formattedData = {
                  action: values.action,
                  remarks: values.remarks,
                  loan_id: selectedLoan?.loan_id,
                  selectedTableRowIndex: selectedPayment.selectedTableRowIndex
                };

                await axios.post(
                  `admin/loan/${selectedLoan.loan_id}/updatePaymentStatus`,
                  formattedData
                );

                document.getElementById('viewPayment').close();
                toast.success(`Payment ${values.action} successfully`);
                await fetchloanPaymentList();
              } catch (error) {
                toast.error('An error occurred while updating payment status');
              }
            }}
          >
            {({ values, handleSubmit }) => (
              <Form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                  {/* Payment Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Payment Date</p>
                      <p className="font-medium">
                        {new Date(selectedPayment?.payment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Amount Paid</p>
                      <p className="font-medium">{formatCurrency(selectedPayment?.payment_amount)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Reference Number</p>
                      <p className="font-medium">{selectedPayment?.reference_number}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium">{selectedPayment?.payment_method}</p>
                    </div>
                  </div>

                  {/* Proof of Payment */}
                  <div className="space-y-4">
                    <h2 className="font-semibold text-lg">Proof of Payment</h2>
                    <img
                      src={selectedPayment?.proof_of_payment}
                      alt="Proof of Payment"
                      className="w-full max-h-96 object-contain border rounded-lg"
                    />
                  </div>

                  {/* Approval Section */}
                  {selectedPayment?.payment_status === 'Pending' && (
                    <div className="space-y-4 border-t pt-4">
                      <h2 className="font-semibold text-lg">Payment Approval</h2>
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          onClick={() => {
                            values.action = 'Approved';
                            handleSubmit();
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve Payment
                        </button>
                        <button
                          type="submit"
                          onClick={() => {
                            values.action = 'Rejected';
                            handleSubmit();
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject Payment
                        </button>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Remarks
                        </label>
                        <Field
                          as="textarea"
                          name="remarks"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          rows="3"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </dialog>
      {/* DaisyUI Modal */}
      {
        selectedImage && (
          <dialog
            open
            className="modal modal-bottom sm:modal-middle z-[9999] "
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="modal-box p-0 bg-black bg-opacity-75 relative"
              onClick={(e) => e.stopPropagation()} // Prevent closing on image click
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 btn btn-circle bg-white text-black shadow-md"
                onClick={() => setSelectedImage(null)}
                aria-label="Close"
              >
                ✕
              </button>

              {/* Full-Screen Image */}
              <img
                src={selectedImage}
                alt="Full-Screen"
                className="w-full h-auto max-h-screen object-contain"
              />
            </div>
          </dialog>
        )
      }
      <ToastContainer />
    </div >
  );
});

export default LoanCalculator;
