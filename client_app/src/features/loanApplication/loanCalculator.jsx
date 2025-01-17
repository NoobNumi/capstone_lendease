import React, { useState, useEffect, memo } from 'react';

import InputText from '../../components/Input/InputText';
import Dropdown from '../../components/Input/Dropdown';
import { Formik, useField, useFormik, Form } from 'formik';
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
  setPaymentList
}) => {

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



  const fetchloanPaymentList = async () => {

    console.log({
      hey: loanId
    })
    let res = await axios({
      method: 'get',
      url: `loan/${selectedLoan?.loan_id || loanId}/paymentList`,
      data: {

      }
    });
    let list = res.data.data;

    setloanPaymentList(list)


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

    setPaymentList(paymentDetails)


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
  const handlePayNowButtonClick = (payment, selectedIndex) => {

    // console.log({ payment, selectedLoan })
    setselectedPayment(payment);
    setselectedIndex(selectedIndex)
    document.getElementById('addPayment').showModal();

  }

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


  console.log({ loanPaymentList })

  const [selectedImage, setSelectedImage] = useState(null);
  const totalPayments = 10; // Example: Total expected payments
  const completedPayments = 7; // Example: Payments made so far
  const totalAmounts = 5000; // Example: Total expected amount
  const amountPaid = 3500; // Example: Amount paid so far
  return (
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
        <table className="w-full mt-8 table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm text-gray-700">No.</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">QR Code</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Transaction Date</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Principal</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Interest Amount</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Due Amount</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Date Paid</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Balance</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Proof of Payment</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => {




              let current = loanPaymentList.find(lp => lp.selectedTableRowIndex === index + 1)

              let formattedDate;
              if (current?.payment_date) {
                const parsedDate = new Date(current.payment_date);
                if (!isNaN(parsedDate.getTime())) {
                  formattedDate = format(parsedDate, 'MMM dd, yyyy hh:mm:a');

                } else {
                  console.error('Invalid date format');
                }
              } else {
                console.error('Payment date is missing');
              }



              // Check if previous row had a payment
              const previousPayment = payments[index - 1];
              const previousPaymentStatus = previousPayment ? loanPaymentList.find(lp => lp.selectedTableRowIndex === index) : null;




              console.log({ urlLink: `${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/app/loan_details/${selectedLoan?.loan_id}/selectedTableRowIndex/${index + 1}` })


              let highlight = parseInt(rowIndex) === index + 1;

              // console.log({ highlight: parseInt(rowIndex) })
              return <tr key={index}

                className={`${highlight ? 'border border-green-500' : ''}`}>

                <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <QRCodeSVG


                    value={

                      `${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/app/loan_details/${selectedLoan?.loan_id}/selectedTableRowIndex/${index + 1}`

                    }

                    size={50} />

                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{payment.transactionDate}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(payment.principal)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(payment.amountPrincipal)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(payment.interestAmount)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(payment.dueAmount)}</td>

                <td className="px-4 py-3 text-sm text-gray-700">
                  {

                    formattedDate
                  }
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(payment.remainingBalance)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">

                  {current?.proof_of_payment && <img
                    src={current?.proof_of_payment}
                    alt="Thumbnail"
                    className="w-16 h-16 rounded-lg object-cover cursor-pointer"
                    onClick={() => setSelectedImage(current?.proof_of_payment)}
                  />
                  }



                </td>
                <td className="px-4 py-3 text-sm text-gray-700">



                  {
                    current?.payment_status ? <StatusPill value={current?.payment_status} /> :
                      loan_status === "Approved" && (
                        (index === 0 || previousPaymentStatus?.payment_status) && (
                          <div className="flex">
                            <button className="btn btn-outline btn-sm" onClick={async () => {
                              await handlePayNowButtonClick(payment, index + 1);
                            }}>
                              Pay now
                            </button>
                          </div>
                        )
                      )
                  }


                </td>
                <td className="px-4 py-3 text-sm text-gray-700">

                  {
                    current?.payment_status && <div className="flex">
                      <button className="btn btn-outline btn-sm" onClick={async () => {


                        setselectedPayment(current);
                        document.getElementById('viewPayment').showModal();
                        // await handlePayNowButtonClick(payment, index + 1);
                      }}>
                        View
                      </button>
                    </div>
                  }


                </td>
              </tr>
            })}
            {/* Total Row */}
            <tr className="bg-gray-200 font-semibold">
              <td colSpan="1" className="px-4 py-3 text-sm text-gray-700">Total</td>
              <td colSpan="1" className="px-4 py-3 text-sm text-gray-700"></td>
              <td colSpan="1" className="px-4 py-3 text-sm text-gray-700"></td>
              <td colSpan="1" className="px-4 py-3 text-sm text-gray-700"></td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(totalAmount - totalInterestAmount)}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(totalInterestAmount)}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(totalDueAmount)}</td>
              <td className="px-4 py-3 text-sm text-gray-700"></td>
              <td className="px-4 py-3 text-sm text-gray-700"></td>
              <td className="px-4 py-3 text-sm text-gray-700"></td>
              <td className="px-4 py-3 text-sm text-gray-700"></td>
              <td className="px-4 py-3 text-sm text-gray-700"></td>

            </tr>
          </tbody>
        </table>

      </div>

      <dialog id="addPayment" className="modal">
        <div className="modal-box w-11/12 max-w-5xl">

          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => {

              document.getElementById("addPayment").close()
              setselectedPayment({});
            }}


          >✕</button>

          <div className="modal-header flex items-center justify-between p-4 bg-gradient-to-r from-gray-200 to-gray-300
            z-10 text-blue-950 border bg-white text-blue-950  rounded-t-lg">
            <h1 className="text-xl font-bold">Payment Details</h1>

          </div>

          <p className="text-sm text-gray-500 mt-1 font-bold"></p>
          <div className="p-2 space-y-4 md:space-y-6 sm:p-4">

            {
              console.log({ selectedPayment })
            }

            {(selectedPayment.amount && selectedLoan.loan_application_id) &&
              <Formik
                initialValues={{
                  payment_amount: selectedPayment.payment_amount || selectedPayment.amount,
                  payment_method: selectedPayment.payment_method,
                  reference_number: selectedPayment.reference_number,
                  proof_of_payment: '',
                  paid_amount: selectedPayment.amount || selectedPayment.payment_amount
                }}
                validationSchema={Yup.object({
                  payment_amount: Yup.number()
                    .required('Payment amount is required'),
                  paid_amount: Yup.number()
                    .required('Paid amount is required')
                    .test(
                      'is-equal',
                      'Paid amount must be equal to Payment amount',
                      function (value) {
                        return value === this.parent.payment_amount;
                      }
                    ),
                  payment_method: Yup.string()
                    .required('Payment method is required'),
                  reference_number: Yup.string()
                    .required('Payment method is required'),

                })}
                validate={(values) => {
                  const errors = {};

                  if (!values.payment_amount) {
                    errors.payment_amount = 'Payment amount is required';
                  }

                  if (!values.payment_method) {
                    errors.payment_method = 'Payment method is required';
                  }

                  if (!values.reference_number) {
                    errors.reference_number = 'Reference number is required';
                  }

                  // Conditionally validate proof_of_payment based on files.proofOfPayment
                  if (!values.proof_of_payment && !files.proofOfPayment) {
                    errors.proof_of_payment = 'Proof of Payment is required';
                  }

                  return errors;
                }}
                onSubmit={async (values, { setFieldError, setSubmitting, resetForm }) => {
                  // Log the form values


                  const formattedData = {
                    loan_id: selectedLoan?.loan_id, // Assuming you have this value available
                    payment_amount: parseFloat(values.paid_amount).toFixed(2), // Ensure correct decimal format
                    payment_date: new Date().toISOString().split('T')[0], // Get the current date in 'YYYY-MM-DD' format
                    payment_status: 'Pending', // Assuming default status or you could map it based on a form field
                    payment_method: values.payment_method,// Function to map payment method to ID

                    reference_number: values.reference_number,
                    selectedTableRowIndex: selectedIndex
                  };


                  try {



                    let res = await axios({
                      method: 'post',
                      url: `loan/${selectedLoan.loan_application_id}/payment`,
                      data: formattedData
                    })


                    const formData = new FormData();
                    formData.append('loan_id', formattedData.loan_id);
                    formData.append('selectedTableRowIndex', formattedData.selectedTableRowIndex);

                    formData.append('proofOfPayment', files.proofOfPayment); // Assuming values contains File objects
                    await axios({
                      // headers: {
                      //   'content-type': 'multipart/form-data'
                      // },
                      method: 'POST',
                      url: 'loan/payment/upload-files',
                      data: formData
                    });


                    toast.success(`Payment Addedd Successfully`, {
                      position: 'top-right',
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: 'light'
                    });
                    await fetchloanPaymentList()

                    navigate(`/app/loan_details/${loanId}`);
                    resetForm()

                    document.getElementById('addPayment').close();


                  } catch (error) {

                    toast.error(`An error occured.`, {
                      position: 'top-right',
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: 'light'
                    });

                  }





                }}
              >
                {({
                  validateForm,
                  handleSubmit,
                  handleChange,
                  handleBlur, // handler for onBlur event of form elements
                  values,
                  touched,
                  errors,
                  submitForm,
                  setFieldTouched,
                  setFieldValue,
                  setFieldError,
                  setErrors,
                  isSubmitting
                }) => {

                  // console.log({ errors, files })
                  let hasError1 = errors['proof_of_payment'] && files.proofOfPayment == null;


                  return <Form onSubmit={handleSubmit}>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">

                      {/* <InputText
                      isRequired
                      placeholder=""
                      label="Status"
                      name="status"
                      type="status"

                      value={values.status}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    /> */}

                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4 ">
                      <InputText

                        disabled
                        isRequired
                        placeholder=""
                        label="Amount to Pay"
                        name="payment_amount"
                        type="text"

                        value={values.payment_amount}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />
                      <div className='mt-2'>
                        <Dropdown
                          // icons={mdiAccount}
                          label="Payment Method"
                          name="payment_method"
                          placeholder=""
                          value={values.payment_method}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={[
                            {
                              name: 'Cash',
                              displayName: 'Cash'
                            }, {
                              name: 'Gcash',
                              displayName: 'Gcash'
                            },
                            {
                              name: 'Bank Transfer',
                              displayName: 'Bank Transfer'
                            }].map(val => {
                              return {
                                value: val.name,
                                label: val.displayName
                              };
                            })}

                        /></div>

                      <InputText
                        isRequired
                        placeholder=""
                        label="Paid Amount"
                        name="paid_amount"
                        type="number"

                        value={values.paid_amount}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />
                      <InputText
                        isRequired
                        placeholder=""
                        label="Reference Number"
                        name="reference_number"
                        type="text"

                        value={values.reference_number}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />

                    </div>
                    <div className="space-y-4">
                      {/* Borrower's Valid ID */}
                      <h1 className="font-bold text-lg  mt-4">Upload Proof of Payment</h1>

                      <img
                        src={selectedPayment.proof_of_payment}
                        alt="Full-Screen"
                        className="w-full h-auto max-h-screen object-contain"
                      />

                      <div

                        className={`${hasError1 ? "space-y-4 p-4 border-2 rounded border-red-500" : ""
                          }`}>


                        <label className="block text-sm font-medium text-gray-700 mb-2">

                        </label>
                        <DropzoneArea
                          fieldName="proofOfPayment"
                          files={files}
                          dropzoneProps={dropzoneProps("proofOfPayment")}
                          setFieldValue={setFieldValue}
                          errors={errors}
                        />
                        {errors.proofOfPayment && <p className="text-red-500 text-sm mt-2">{errors.proofOfPayment}</p>}
                      </div>



                      {/* Submit */}
                      <button
                        type="submit"
                        // disabled={isSubmitting}
                        className="mt-4 px-4 py-2 bg-blue-950 text-white"

                      >
                        Submit
                      </button>
                    </div>
                  </Form>


                }}</Formik>
            }

          </div>
        </div>

      </dialog >

      <dialog id="viewPayment" className="modal">
        <div className="modal-box w-11/12 max-w-5xl">

          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => {

              document.getElementById("viewPayment").close()
              setselectedPayment({});
            }}


          >✕</button>

          <div className="modal-header flex items-center justify-between p-4 bg-gradient-to-r from-gray-200 to-gray-300
            z-10 text-blue-950 border bg-white text-blue-950  rounded-t-lg">
            <h1 className="text-xl font-bold">Payment Details</h1>

          </div>

          <p className="text-sm text-gray-500 mt-1 font-bold"></p>
          <div className="p-2 space-y-4 md:space-y-6 sm:p-4">



            {(selectedPayment.loan_id) &&
              <Formik
                initialValues={{
                  action: 'Approved',
                  payment_method: selectedPayment.payment_method,
                  reference_number: selectedPayment.reference_number,
                  proof_of_payment: '',
                  paid_amount: selectedPayment.amount || selectedPayment.payment_amount,
                  payment_date: selectedPayment.payment_date || selectedPayment.payment_date
                }}
                validationSchema={Yup.object({

                  action: Yup.string()
                    .required('Required'),

                })}
                // validate={(values) => {
                //   const errors = {};

                //   if (!values.payment_amount) {
                //     errors.payment_amount = 'Payment amount is required';
                //   }

                //   if (!values.payment_method) {
                //     errors.payment_method = 'Payment method is required';
                //   }

                //   if (!values.reference_number) {
                //     errors.reference_number = 'Reference number is required';
                //   }

                //   // Conditionally validate proof_of_payment based on files.proofOfPayment
                //   if (!values.proof_of_payment && !files.proofOfPayment) {
                //     errors.proof_of_payment = 'Proof of Payment is required';
                //   }

                //   return errors;
                // }}
                onSubmit={async (values, { setFieldError, setSubmitting, resetForm }) => {
                  // Log the form values


                  const formattedData = {
                    action: values.action,
                    loan_id: selectedLoan?.loan_id, // Assuming you have this value available
                    // payment_amount: parseFloat(values.paid_amount).toFixed(2), // Ensure correct decimal format
                    // payment_date: new Date().toISOString().split('T')[0], // Get the current date in 'YYYY-MM-DD' format
                    // payment_status: 'Pending', // Assuming default status or you could map it based on a form field
                    // payment_method: values.payment_method,// Function to map payment method to ID

                    // reference_number: values.reference_number,
                    selectedTableRowIndex: selectedPayment.selectedTableRowIndex
                  };




                  try {



                    let res = await axios({
                      method: 'post',
                      url: `admin/loan/${selectedLoan.loan_id}/updatePaymentStatus`,
                      data: formattedData
                    })



                    document.getElementById('viewPayment').close();
                    toast.success(`Updated Successfully`, {
                      position: 'top-right',
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: 'light'
                    });
                    await fetchloanPaymentList()





                  } catch (error) {

                    toast.error(`An error occured.`, {
                      position: 'top-right',
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: 'light'
                    });

                  }





                }}
              >
                {({
                  validateForm,
                  handleSubmit,
                  handleChange,
                  handleBlur, // handler for onBlur event of form elements
                  values,
                  touched,
                  errors,
                  submitForm,
                  setFieldTouched,
                  setFieldValue,
                  setFieldError,
                  setErrors,
                  isSubmitting
                }) => {

                  // console.log({ errors, files })
                  let hasError1 = errors['proof_of_payment'] && files.proofOfPayment == null;
                  {
                    console.log({ selectedPayment })
                  }
                  let formattedPaymentDate = format(selectedPayment.payment_date, 'MMM dd, yyyy hh:mm:a');
                  return <Form onSubmit={handleSubmit}>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                      <Radio
                        isRequired
                        label="Action"
                        name="action" // This should be "loan_type"
                        value={values.action}
                        setFieldValue={setFieldValue}
                        onBlur={handleBlur}
                        options={[
                          { value: 'Approved', label: 'Approve' },
                          { value: 'Rejected', label: 'Reject' }
                        ]}
                      />

                      {/* <InputText
                      isRequired
                      placeholder=""
                      label="Status"
                      name="status"
                      type="status"

                      value={values.status}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    /> */}

                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 ">

                      <InputText
                        isReadOnly={true}
                        disabled
                        isRequired
                        placeholder=""
                        label="Payment Date"
                        name="payment_date"
                        type="text"

                        value={formattedPaymentDate}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />
                      <InputText
                        isReadOnly={true}
                        disabled
                        isRequired
                        placeholder=""
                        label="Amount to Pay"
                        name="payment_amount"
                        type="text"

                        value={values.paid_amount}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />



                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 ">


                      <div className='mt-2'>
                        <Dropdown
                          isDisabled
                          // icons={mdiAccount}
                          label="Payment Method"
                          name="payment_method"
                          placeholder=""
                          value={values.payment_method}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={[
                            {
                              name: 'Cash',
                              displayName: 'Cash'
                            }, {
                              name: 'Gcash',
                              displayName: 'Gcash'
                            },
                            {
                              name: 'Bank Transfer',
                              displayName: 'Bank Transfer'
                            }].map(val => {
                              return {
                                value: val.name,
                                label: val.displayName
                              };
                            })}

                        /></div>

                      <InputText
                        isReadOnly={true}
                        disabled
                        placeholder=""
                        label="Paid Amount"
                        name="paid_amount"
                        type="number"

                        value={values.paid_amount}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />
                      <InputText
                        isReadOnly={true}
                        disabled
                        isRequired
                        placeholder=""
                        label="Reference Number"
                        name="reference_number"
                        type="text"

                        value={values.reference_number}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />

                    </div>
                    <div className="space-y-4">
                      {/* Borrower's Valid ID */}
                      <h1 className="font-bold text-lg  mt-4">Upload Proof of Payment</h1>

                      <img
                        src={selectedPayment.proof_of_payment}
                        alt="Full-Screen"
                        className="w-full h-auto max-h-screen object-contain"
                      />

                      {/* <div

                        className={`${hasError1 ? "space-y-4 p-4 border-2 rounded border-red-500" : ""
                          }`}>


                        <label className="block text-sm font-medium text-gray-700 mb-2">

                        </label>
                        <DropzoneArea
                          fieldName="proofOfPayment"
                          files={files}
                          dropzoneProps={dropzoneProps("proofOfPayment")}
                          setFieldValue={setFieldValue}
                          errors={errors}
                        />
                        {errors.proofOfPayment && <p className="text-red-500 text-sm mt-2">{errors.proofOfPayment}</p>}
                      </div> */}



                      {/* Submit */}
                      <button
                        type="submit"
                        // disabled={isSubmitting}
                        className="mt-4 px-4 py-2 bg-blue-950 text-white"

                      >
                        Submit
                      </button>
                    </div>
                  </Form>


                }}</Formik>
            }

          </div>
        </div>

      </dialog >
      {/* DaisyUI Modal */}
      {selectedImage && (
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
      )}
      <ToastContainer />
    </div>
  );
});

export default LoanCalculator;
