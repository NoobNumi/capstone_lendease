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
  Send
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
  const [payments, setPayments] = useState([]);
  const [loanPaymentList, setLoanPaymentList] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [balance, setBalance] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [isFromPayNowButton, setisFromPayNowButton] = useState(false);

  // Define loan_status based on props or selectedLoan
  const loan_status = values.loan_status || selectedLoan?.loan_status || '';

  useEffect(() => {
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

    // Get the payment schedule start date from loan approval date
    const startDate = selectedLoan?.approval_date ? new Date(selectedLoan.approval_date) : new Date();
    const paymentDay = startDate.getDate(); // Use the same day as approval date

    for (let i = 1; i <= calculatorMonthsToPay; i++) {
      const amountPrincipal = principal;
      const amount = principal + monthlyInterestAmount;
      remainingBalance = remainingBalance - amount;
      remainingPrincipal = i === 1 ? remainingPrincipal : remainingPrincipal - amountPrincipal;

      // Calculate the payment date for each installment
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(startDate.getMonth() + i - 1);

      paymentDetails.push({
        transactionDate: paymentDate.toISOString(),
        principal: remainingPrincipal,
        amount: amount,
        interestAmount: monthlyInterestAmount,
        dueAmount: amount,
        datePaid: null,
        remainingBalance: remainingBalance,
        amountPrincipal: amountPrincipal
      });
    }

    setPayments(paymentDetails);
    if (setPaymentList) {
      setPaymentList(paymentDetails);
    }
    setBalance(remainingBalance);
  }, [calculatorLoanAmmount, calculatorInterestRate, calculatorMonthsToPay, selectedLoan?.approval_date]);

  const getQRCodeDetails = (payments, loanPaymentList) => {
    if (!payments.length || !loanPaymentList) return null;

    const today = new Date();
    let pastDueAmount = 0;
    let currentPaymentIndex = -1;
    let currentAmount = 0;

    // Track paid amounts for each payment index
    const paidAmounts = {};
    loanPaymentList.forEach(payment => {
      if (payment.payment_status === 'Approved') {
        paidAmounts[payment.selectedTableRowIndex] = true;
      }
    });

    // Find current due payment and calculate past due
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      const paymentDueDate = new Date(payment.transactionDate);
      const isPaid = paidAmounts[i];

      if (!isPaid) {
        // If this is the first unpaid payment
        if (currentPaymentIndex === -1) {
          currentPaymentIndex = i;
          currentAmount = payment.dueAmount;
        }
        // If this is a past due payment (before current date)
        else if (paymentDueDate < today) {
          pastDueAmount += payment.dueAmount;
        }
      }
    }

    // If we found a current payment
    if (currentPaymentIndex !== -1) {
      const currentPayment = payments[currentPaymentIndex];
      const hasPastDue = pastDueAmount > 0;
      const totalAmount = hasPastDue ? (currentAmount + pastDueAmount) : currentAmount;

      // Generate QR code URL with payment details
      const qrCodeData = {
        loanId: selectedLoan?.loan_id || '',
        amount: totalAmount,
        paymentIndex: currentPaymentIndex,
        hasPastDue: hasPastDue,
        timestamp: new Date().getTime()
      };

      const qrCodeUrl = `${window.location.origin}/payment?data=${encodeURIComponent(JSON.stringify(qrCodeData))}`;

      return {
        amount: totalAmount,
        dueDate: currentPayment.transactionDate,
        hasPastDue,
        pastDueAmount,
        index: currentPaymentIndex,
        isOverdue: new Date(currentPayment.transactionDate) < today,
        originalAmount: currentAmount,
        url: qrCodeUrl
      };
    }

    return null;
  };

  const handlePayNowButtonClick = async (payment, index, isQRCode = false) => {
    try {
      setSelectedPayment({
        ...payment,
        selectedTableRowIndex: index
      });
      setSelectedIndex(index);

      // If it's from QR code, handle QR-specific logic
      if (isQRCode) {
        const qrDetails = getQRCodeDetails(payments, loanPaymentList);
        if (qrDetails) {
          setSelectedPayment(prev => ({
            ...prev,
            amount: qrDetails.amount,
            hasPastDue: qrDetails.hasPastDue,
            pastDueAmount: qrDetails.pastDueAmount,
            isOverdue: qrDetails.isOverdue
          }));
        }
      }

      // Open payment dialog
      document.getElementById('addPayment')?.showModal();
    } catch (error) {
      console.error('Error handling pay now click:', error);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {isGridView && (
        <div className="flex flex-col items-center">
          {/* Payment Summary Card */}
          <div className="w-full max-w-3xl mb-8 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              Payment Schedule
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
          <div className="w-full max-w-2xl">
            {payments.map((payment, index) => {
              const paymentStatus = loanPaymentList.find(
                p => p.selectedTableRowIndex === index
              );
              const isPaid = paymentStatus?.payment_status === 'Approved';
              const isPending = paymentStatus?.payment_status === 'Pending';
              const isOverdue = new Date(payment.transactionDate) < new Date();

              // Get QR details for the entire payment schedule
              const qrDetails = getQRCodeDetails(payments, loanPaymentList);

              // Determine if this is the current payment that should show QR
              const isCurrentPayment = index === qrDetails?.index;
              const shouldShowQR = loan_status === "Approved" &&
                selectedLoan?.proof_of_disbursement &&
                !isPaid &&
                !isPending &&
                isCurrentPayment;

              // Only render the card if it should show the QR code
              if (!shouldShowQR) return null;

              return (
                <div
                  key={index}
                  className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 mb-6 ${isPending ? 'bg-amber-50 border-2 border-amber-200' :
                    isPaid ? 'bg-emerald-50 border-2 border-emerald-200' :
                      isOverdue ? 'bg-rose-50 border-2 border-rose-200' : ''
                    }`}
                >
                  {/* Payment Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        Payment {index + 1}
                        {isCurrentPayment && !isPaid && !isPending && (
                          <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Current Due
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        Due: {format(new Date(payment.transactionDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${isPending ? 'bg-amber-100 text-amber-800' :
                      isPaid ? 'bg-emerald-100 text-emerald-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                      {isPending && <Clock className="w-4 h-4" />}
                      {isPaid && <CheckCircle2 className="w-4 h-4" />}
                      {!isPaid && !isPending && <AlertCircle className="w-4 h-4" />}
                      {paymentStatus?.payment_status || 'Unpaid'}
                    </span>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Amount Due:
                      </span>
                      <span className="font-medium">{formatCurrency(payment.dueAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Principal:
                      </span>
                      <span>{formatCurrency(payment.amountPrincipal)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Interest:
                      </span>
                      <span>{formatCurrency(payment.interestAmount)}</span>
                    </div>

                    {/* Only show past due amount on the current payment card */}
                    {isCurrentPayment && qrDetails?.hasPastDue && (
                      <div className="flex justify-between text-red-600 font-medium">
                        <span>Past Due Amount:</span>
                        <span>{formatCurrency(qrDetails.pastDueAmount)}</span>
                      </div>
                    )}

                    {/* Show total amount only for current payment with past due */}
                    {isCurrentPayment && qrDetails?.hasPastDue && (
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total Amount:</span>
                        <span>{formatCurrency(qrDetails.amount)}</span>
                      </div>
                    )}

                    {paymentStatus?.payment_date && (
                      <div className="flex justify-between text-gray-600">
                        <span>Payment Date:</span>
                        <span>{format(new Date(paymentStatus.payment_date), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    {paymentStatus?.reference_number && (
                      <div className="flex justify-between text-gray-600">
                        <span>Reference No:</span>
                        <span>{paymentStatus.reference_number}</span>
                      </div>
                    )}
                  </div>

                  {/* QR Code section - Centered and enhanced */}
                  {shouldShowQR && (
                    <div className="flex flex-col items-center my-8 p-6 bg-gradient-to-b from-gray-50 to-white rounded-2xl">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setisFromPayNowButton(true);
                          handlePayNowButtonClick(payment, index, true);
                        }}
                        className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                      >
                        <QRCodeSVG
                          value={qrDetails?.url || ''}
                          size={200}
                          level="H"
                          className="mx-auto"
                          includeMargin={true}
                        />
                        <p className="mt-4 text-sm text-gray-600 flex items-center justify-center gap-2">
                          <Scan className="w-5 h-5 text-blue-600" />
                          {qrDetails?.hasPastDue ?
                            'Scan to pay current and past due amount' :
                            'Scan to pay current bill'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - Centered */}
                  <div className="flex justify-center mt-6">
                    {isPaid || isPending ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPayment(payment, index);
                        }}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors px-6 py-3 rounded-lg hover:bg-blue-50"
                      >
                        <Eye className="w-5 h-5" />
                        View Details
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayNowButtonClick(payment, index);
                        }}
                        className="flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 transition-colors px-6 py-3 rounded-lg shadow-md hover:shadow-lg"
                      >
                        <Send className="w-5 h-5" />
                        Pay Now
                      </button>
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
          <div className="modal-header bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-8 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3 mb-2">
                  <CreditCard className="w-7 h-7" />
                  Submit Payment
                </h1>
                <p className="text-blue-100 text-sm">
                  Amount Due: {formatCurrency(selectedPayment?.amount || selectedPayment?.dueAmount)}
                </p>
              </div>
              <button
                onClick={() => document.getElementById('addPayment').close()}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close modal"
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
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const formData = new FormData();
                formData.append('payment_method', values.payment_method);
                formData.append('reference_number', values.reference_number);
                formData.append('proof_of_payment', values.proof_of_payment);
                formData.append('amount', selectedPayment?.amount || selectedPayment?.dueAmount);
                formData.append('selectedTableRowIndex', selectedPayment?.selectedTableRowIndex);

                await axios.post(
                  `loan/${selectedLoan?.loan_id}/submit-payment`,
                  formData,
                  {
                    headers: {
                      'Content-Type': 'multipart/form-data'
                    }
                  }
                );

                document.getElementById('addPayment').close();
                toast.success('Payment submitted successfully');
                await fetchloanPaymentList();
              } catch (error) {

                console.log({ error })
                // toast.error('Failed to submit payment');
              } finally {
                setSubmitting(false);
              }
            }}
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
    </div>
  );
});

export default LoanCalculator;