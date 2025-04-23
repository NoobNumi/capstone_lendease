import moment from 'moment';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../common/headerSlice';
import TitleCard from '../../components/Cards/TitleCard';
// import { RECENT_LoanApplication } from '../../utils/dummyData';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import SearchBar from '../../components/Input/SearchBar';
import { NavLink, Routes, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import 'react-tooltip/dist/react-tooltip.css'

import React from "react";
import { PrinterIcon } from "lucide-react";
import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../pages/protected/DataTables/Table'; // new

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import InputText from '../../components/Input/InputText';
import TextAreaInput from '../../components/Input/TextAreaInput';
import Dropdown from '../../components/Input/Dropdown';
import Radio from '../../components/Input/Radio';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';

import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';

import { useDropzone } from "react-dropzone";
import {
  regions,
  provinces,
  cities,
  barangays,
  provincesByCode,
  regionByCode
} from 'select-philippines-address';

import { FaCheckCircle } from "react-icons/fa"; // Font Awesome icon


import LoanCalculator from "./../loanApplication/loanCalculator";
import PaymentsLogicView from "./../loanApplication/PaymentsLogicView";
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

import { formatAmount } from '../dashboard/helpers/currencyFormat';




// import LoanCalculator from "./../loanApplication/loanCalculator";
// import Image from 'next/image';
import {
  CheckCircle, XCircle, Info, AlertTriangle, Briefcase, Home, MapPin, School,
  Banknote, User, FileText, BanknoteIcon
} from 'lucide-react';



import ToPrint from "./toPrint";
import PaymentRedirectHandler from './PaymentRedirectHandler';

const LoanDetailsHeader = ({ selectedLoan, paymentList }) => {
  const [progress, setProgress] = useState(75); // Example progress value

  const [loanPaymentList, setloanPaymentList] = useState([]);




  const fetchloanPaymentList = async () => {

    let res = await axios({
      method: 'get',
      url: `loan/${selectedLoan?.loan_id}/paymentList`,
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




  function getProgressPercentage(paymentList, loanPaymentList) {
    // Calculate total due amount (sum of amounts in paymentList)
    const totalDueAmount = paymentList.reduce((total, payment) => total + payment.dueAmount, 0);

    // Calculate total paid amount (sum of approved payments in loanPaymentList)
    const totalPaidAmount = loanPaymentList.reduce((total, payment) => {
      if (payment.payment_status === 'Approved') {
        return total + parseFloat(payment.payment_amount);
      }
      return total;
    }, 0);

    // Calculate percentage of progress
    const progress = (totalPaidAmount / totalDueAmount) * 100;
    const percentage = Math.min(progress, 100); // Ensure that the percentage doesn't exceed 100%

    return {
      percentage: percentage.toFixed(2), // Return percentage as a string with 2 decimals
      totalPaidAmount: totalPaidAmount.toFixed(2)// Return total paid amount with 2 decimals
    };
  }

  // Example usage



  // Get progress percentage and total paid amount
  const { percentage, totalPaidAmount } = getProgressPercentage(paymentList, loanPaymentList);

  //console.log({ percentage, totalPaidAmount }); // Output the progress percentage and total paid amount

  const getStrokeColor = (progress) => {
    if (progress <= 30) return "#EF4444"; // Red for low progress
    if (progress <= 70) return "#F59E0B"; // Yellow for medium progress
    return "#10B981"; // Green for high progress
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        {/* Left: Title */}
        {/* <h3 className="text-2xl font-bold text-gray-700 flex items-center w-3/4">
          Loan Detailss
        </h3> */}


        {/* Right: Circular Progress Bar */}
        <div className="w-1/4 bg-gray-200 rounded-full h-4 mb-2 relative">
          {/* Progress Bar */}
          <div
            className="h-4 rounded-full"
            style={{
              width: `${percentage || 0}%`, // Dynamic width based on progress percentage
              backgroundColor: getStrokeColor(percentage), // Dynamic color based on progress
              transition: 'width 0.5s ease', // Smooth animation for width change
            }}
          />
          {/* Percentage Text inside the Progress Bar */}
          <span
            className="absolute p-2 inset-0 flex justify-center items-center text-white font-bold"
          >
            {percentage || 0}% (₱{totalPaidAmount}) Paid
          </span>
        </div>
      </div>
      <hr className="border-gray-300 mb-4" />

      {/* Display total amount paid */}

    </div>
  );


};


const Alert = ({ type = "info", title, description, onClose }) => {
  const typeStyles = {
    success: {
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    },
    error: {
      color: "bg-red-100 text-red-800",
      icon: <XCircle className="w-6 h-6 text-red-500" />,
    },
    info: {
      color: "bg-blue-100 text-blue-800",
      icon: <Info className="w-6 h-6 text-blue-500" />,
    },
    warning: {
      color: "bg-yellow-100 text-yellow-800",
      icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    },
  };

  const { color, icon } = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`flex items-center p-4 rounded-md shadow-md ${color} border-l-4`}
    >
      {/* Icon */}
      <div className="mr-4">{icon}</div>

      {/* Content */}
      <div className="flex-1">
        {title && <h3 className="font-bold">{title}</h3>}
        {description && <p className="text-sm mt-4">{description}</p>}
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={onClose}
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};




const LoanEvaluationResult = ({ result, loanDetails }) => {
  const [loanApprovalSettings, setLoanApprovalSettings] = useState({}); // Changed variable name here


  const [isLoaded, setisLoaded] = useState(false);

  const fetchloanApprovalSettings = async () => {
    try {


      let res = await axios({
        method: 'post',
        url: `loan/checkLoanApplicationApprovalRate`,
        data: {
          loan_application_id: loanDetails.loan_id
        }
      });

      setLoanApprovalSettings(res.data.data.result)
      setisLoaded(true)

    } catch (err) {

    } finally {

    }
  };

  useEffect(() => {
    fetchloanApprovalSettings(); // Changed function call here
  }, []);

  const { approved, message, breakdown, overallApprovalPercentage } = loanApprovalSettings;

  // Function to assign colors to progress bars based on percentage
  const progressBarClass = (percentage) => {
    if (percentage >= 80) return 'bg-green-500'; // Green for good approval
    if (percentage >= 50) return 'bg-yellow-500'; // Yellow for moderate
    return 'bg-red-500'; // Red for poor approval
  };




  return isLoaded && (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-xl">
      {/* Overall Score Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Loan Evaluation Score
        </h2>
        <div className="relative w-40 h-40 mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl font-bold text-gray-800">
              {Number(overallApprovalPercentage).toFixed(2)}%
            </div>
          </div>
          <svg className="transform -rotate-90 w-40 h-40">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="70"
              cx="80"
              cy="80"
            />
            <circle
              className={`${approved ? 'text-green-500' : 'text-orange-500'}`}
              strokeWidth="8"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * overallApprovalPercentage) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="70"
              cx="80"
              cy="80"
            />
          </svg>
        </div>
      </div>

      {/* Approval Status */}
      <Alert
        type={approved ? 'success' : 'warning'}
        title={approved ? 'APPROVED' : 'NEEDS REVIEW'}
        description={message}
      />

      {/* Detailed Breakdown */}
      <div className="mt-8 space-y-6">
        {Object.entries(breakdown).map(([key, item]) => (
          <div key={key} className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </h3>
              <span className="text-sm text-gray-500">
                Weight: {item.weight}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Score: {Number(item.percentage).toFixed(2)}%
                </span>
                <span className="text-sm font-medium text-blue-600">
                  Weighted: {Number(item.weightedScore).toFixed(2)}%
                </span>
              </div>
              <div className="overflow-hidden h-2 bg-gray-200 rounded">
                <div
                  className={`h-full rounded ${item.percentage >= 80 ? 'bg-green-500' :
                    item.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>

            {/* Calculation Details */}
            <div className="mt-4 bg-white rounded p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Actual Value:</p>
                  <p className="font-medium">
                    {typeof item.actual === 'number'
                      ? item.actual.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                      : item.actual}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Required Value:</p>
                  <p className="font-medium">
                    {typeof item.required === 'number'
                      ? item.required.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                      : item.required}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-gray-600 text-sm">Formula:</p>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded mt-1">
                  {item.formula}
                </p>
                <p className="text-gray-600 text-sm mt-2">Calculation:</p>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded mt-1 whitespace-pre-line">
                  {item.explanation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">How is the score calculated?</h4>
        <p className="text-sm text-blue-600">
          The overall score is a weighted average of four key factors:
          Credit Score (30%), Monthly Income (25%), Loan-to-Income Ratio (25%), and Employment History (20%).
          A minimum score of 70% is required for automatic approval.
        </p>
      </div>
    </div>
  );
};


function LoanManagementTabs({ loanDetails, formikProps, rowIndex }) {



  const [paymentList, setPaymentList] = useState([]); // Example progress value


  const [activeTab, setActiveTab] = useState("user-details");
  const [selectedImage, setSelectedImage] = useState('');

  const userDetails = loanDetails;

  console.log({ loanDetails })
  const documents = [
    { src: loanDetails.borrowers_valid_id, label: 'Borrowers Valid ID' },
    {
      src: loanDetails.co_makers_valid_id, label: 'Co-Maker Valid ID'
    },
    { src: loanDetails.bank_statement, label: 'Bank Statement' },
  ];



  useEffect(() => {
    if (rowIndex) {
      setActiveTab('loan-details'); // Switch to "loan-details" if rowIndex has a value
    }
  }, [rowIndex]); // Dependency array ensures this runs when rowIndex changes



  const [addressRegion, setAddressRegion] = useState('');
  const [addressProvince, setAddressProvince] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressBaragay, setAddressBarangay] = useState('');



  let region = loanDetails.address_region;
  let province = loanDetails.address_province;
  let address_city = loanDetails.address_city;
  let address_barangay = loanDetails.address_barangay;




  useEffect(() => {

    async function fetchRegion() {
      let availableRegions = await regions()

      let data = availableRegions.find(p => p.region_code === region);
      setAddressRegion(data ? data.region_name : '');
    }


    async function fetchProvinceName() {
      let provinces = await provincesByCode(region);
      let data = provinces.find(p => p.province_code === province);
      setAddressProvince(data ? data.province_name : '');
    }

    async function fetchCities() {
      let citiesAvailable = await cities(province);
      let data = citiesAvailable.find(p => p.city_code === address_city);
      setAddressCity(data ? data.city_name : '');
    }


    async function fetchBrgy() {
      let brgyAvailable = await barangays(address_city);


      let data = brgyAvailable.find(p => p.brgy_code === address_barangay);
      setAddressBarangay(data ? data.brgy_name : '');
    }

    fetchRegion()
    fetchProvinceName();
    fetchCities()
    fetchBrgy();
  }, [region, province, address_city]); // Dependencies for useEffect





  const [isGridView, setIsGridView] = useState(true);
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">


        {
          console.log({ loanDetails: loanDetails.loan_status })
        }

        {
          loanDetails.proof_of_disbursement && <div className="mt-4 col-span-2 mb-2">
            <div className="bg-green-100 border border-green-500 text-green-700 p-4 rounded">
              <p className="font-semibold">Info:</p>
              <p>Congratulations! This loan has been approved and successfully disbursed.You can now check the payment schedule and make an advance loan payment.</p>
            </div>
          </div>
        }


        <div className="grid w-full grid-cols-3 bg-gray-100">
          {[
            { key: "user-details", label: "User Details", icon: <User className="w-4 h-4 mr-2" /> },
            { key: "uploaded-documents", label: "Uploaded Documents", icon: <FileText className="w-4 h-4 mr-2" /> },
            { key: "loan-details", label: "Loan Details", icon: <BanknoteIcon className="w-4 h-4 mr-2" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center justify-center py-2 text-center ${activeTab === tab.key ? "bg-customBlue text-white font-bold" : "bg-gray-100"
                }`}
            >
              {tab.icon}
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "user-details" && (
            <div className="space-y-6">
              {/* Personal Information */}
              <Section title="Personal Information">
                <InfoGrid>
                  <InfoItem label="Full Name" value={`${userDetails.first_name} ${userDetails.middle_name} ${userDetails.last_name}`} />
                  <InfoItem label="Age" value={userDetails.age} />
                  <InfoItem label="Gender" value={userDetails.gender} />
                  <InfoItem label="Date of Birth" value={new Date(userDetails.date_of_birth).toLocaleDateString()} />
                  <InfoItem label="Contact Number" value={userDetails.contact_number} />
                  <InfoItem label="Email" value={userDetails.email} />
                  <InfoItem label="Nationality" value={userDetails.nationality} />
                  <InfoItem label="Religion" value={userDetails.religion} />
                </InfoGrid>
              </Section>

              {/* Address Information */}
              <Section title="Address Information" icon={<MapPin className="w-5 h-5 mr-2" />}>
                <InfoGrid>
                  <InfoItem label="Street" value={addressRegion} />
                  <InfoItem label="Province" value={addressProvince} />
                  <InfoItem label="Municipality" value={addressProvince} />
                  <InfoItem label="Barangay" value={addressBaragay} />
                  <InfoItem label="Zip Code" value={userDetails.zip_code} />
                </InfoGrid>
              </Section>

              {/* Employment Information */}
              <Section title="Employment Information" icon={<Briefcase className="w-5 h-5 mr-2" />}>
                <InfoGrid>
                  <InfoItem label="Employment Status" value={userDetails.employment_status} />
                  <InfoItem label="Monthly Income" value={`₱${parseFloat(userDetails.monthly_income).toLocaleString()}`} />
                  <InfoItem label="Credit Score" value={userDetails.credit_score} />
                </InfoGrid>
              </Section>

              {/* Loan Information */}
              {/* <Section title="Loan Information" icon={<Banknote className="w-5 h-5 mr-2" />}>
                <InfoGrid>
                  <InfoItem label="Loan Application ID" value={userDetails.loan_application_id} />
                  <InfoItem label="Loan Type" value={userDetails.loan_type_value} />
                  <InfoItem label="Loan Amount" value={`₱${parseFloat(userDetails.loan_amount).toLocaleString()}`} />
                  <InfoItem label="Interest Rate" value={`${userDetails.interest_rate}%`} />
                  <InfoItem label="Loan Status" value={userDetails.loan_status} />
                  <InfoItem label="Application Date" value={new Date(userDetails.application_date).toLocaleDateString()} />
                  {userDetails.approval_date && (
                    <InfoItem label="Approval Date" value={new Date(userDetails.approval_date).toLocaleDateString()} />
                  )}
                  <InfoItem label="Purpose" value={userDetails.purpose} />
                </InfoGrid>
              </Section> */}


            </div>
          )}

          {activeTab === "uploaded-documents" && (
            <Section title="Uploaded Documents">

              {
                console.log({ documents })
              }
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documents.map((doc, index) => {
                  // Extract the file extension from the URL by splitting at the last dot
                  const fileExtension = doc.src.split('.').pop()?.split('?')[0];

                  const isPdf = fileExtension === 'pdf';
                  const isImage = ['jpeg', 'jpg', 'gif', 'png', 'bmp', 'svg'].includes(fileExtension);


                  console.log({ doc: doc.src, isImage })
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="relative aspect-square w-full rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                        onClick={() => {


                          if (isPdf) {
                            window.open(doc.src, "_blank");
                          } else {
                            setSelectedImage(doc.src)
                          }

                        }
                        }
                      >
                        {isPdf ? (
                          <div className="flex justify-center items-center w-full h-full bg-gray-200 text-gray-600 text-3xl">
                            📄
                          </div>
                        ) : isImage ? (
                          <img
                            src={doc.src}
                            alt={doc.label}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex justify-center items-center w-full h-full bg-gray-200 text-gray-600 text-3xl">
                            Unsupported
                          </div>
                        )}
                      </div>
                      <span className="mt-2 text-sm text-gray-600">{doc.label}</span>
                    </div>
                  );
                })}
              </div>
            </Section>


          )}
          {activeTab === "loan-details" && (
            <div>
              <LoanDetailsHeader
                selectedLoan={loanDetails}
                paymentList={paymentList}
              />

              {loanDetails.loan_id && <ToPrint

                calculatorInterestRate={formikProps.values.calculatorInterestRate}
                selectedLoan={loanDetails}
                calculatorLoanAmmount={formikProps.values.calculatorLoanAmmount}

                calculatorMonthsToPay={formikProps.values.calculatorMonthsToPay}

                setPaymentList={setPaymentList}
                setIsGridView={setIsGridView}
                isGridView={isGridView}
              />}

              {loanDetails.loan_id &&


                <PaymentsLogicView
                  isGridView={true}
                  {...formikProps}
                  isReadOnly={true}
                  calculatorLoanAmmount={formikProps.values.calculatorLoanAmmount}
                  calculatorInterestRate={formikProps.values.calculatorInterestRate}
                  calculatorMonthsToPay={formikProps.values.calculatorMonthsToPay}
                  selectedLoan={loanDetails}
                  setPaymentList={setPaymentList}

                />

              }
            </div>
          )}
        </div>
      </div>
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageSrc={selectedImage}
        />
      )}
    </div>
  );
}

function Section({ title, children, icon }) {
  return (
    <section>
      <h3 className="text-2xl font-bold mb-4 flex items-center text-gray-700">
        {icon}
        {title}
      </h3>
      <hr className="border-gray-300 mb-4" />
      {children}
    </section>
  );
}

function InfoGrid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="flex items-center">
      {icon}
      <span className="font-medium mr-2">{label}:</span>
      <span>{value || 'N/A'}</span>
    </div>
  );
}

function ImageModal({ isOpen, onClose, imageSrc }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white-600 hover:text-white-900 text-blue-700"
        >
          ✖
        </button>
        <img src={imageSrc} alt="Document" className="max-w-full max-h-[80vh] mt-4" />
      </div>
    </div>
  );
}


const TopSideButtons = ({ removeFilter, applyFilter, applySearch,
  faqList, formikProps, loanDetails }) => {
  const [filterParam, setFilterParam] = useState('');
  const [searchText, setSearchText] = useState('');

  const locationFilters = [''];

  //console.log({ loanDetails })

  const showFiltersAndApply = params => {
    applyFilter(params);
    setFilterParam(params);
  };

  const removeAppliedFilter = () => {
    removeFilter();
    setFilterParam('');
    setSearchText('');
  };

  useEffect(() => {
    if (searchText === '') {
      removeAppliedFilter();
    } else {
      applySearch(searchText);
    }
  }, [searchText]);
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleButtonClick = (action) => {

    if (action === "approve") {
      formikProps.setFieldValue('status', 'Approved')
    } else {
      formikProps.setFieldValue('status', 'Rejected')
    }
    setModalMessage(
      action === "approve"
        ? "Are you sure you want to approve this loan?"
        : "Are you sure you want to decline this loan?"
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
  };


  //console.log({ loggedInUser })

  let canApprove = loggedInUser.role === 'Loan Officer' || loggedInUser.role === 'Admin'
  return (
    <div className="inline-block float-right">

      {

        canApprove && loanDetails.loan_status !== 'Approved' && <div className="flex space-x-4">
          {/* Approve Button */}
          <button
            className="btn flex items-center font-bold text-white bg-customBlue rounded-md 
"
            onClick={() => {
              // handleButtonClick("approve")
              formikProps.setFieldValue('status', 'Approved')
              document.getElementById('confirmationModal').showModal()
            }}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Approve
          </button>

          {/* Decline Button */}
          <button
            className="btn items-center px-4 py-2 font-bold text-white bg-red-500 rounded-md 
  "
            onClick={() => {
              // handleButtonClick("decline") 
              formikProps.setFieldValue('status', 'Rejected')
              document.getElementById('confirmationModal').showModal()
            }}
          >
            <XCircle className="w-5 h-5 mr-2" />
            Reject
          </button>

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
              <div className="p-3 bg-white rounded-md shadow-md">

                <div className="modal-header flex items-center justify-between p-4 
      bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg">
                  <h1 className="text-xl font-semibold">{modalMessage}</h1>

                </div>
                <TextAreaInput
                  isRequired
                  label="Remarks"
                  name="remarks"
                  type="text"
                  // hasTextareaHeight={true}
                  placeholder=""
                  value={formikProps.values.remarks}

                />
                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    className="btn rounded-md hover:bg-gray-600 
          focus:outline-none"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className="btn text-white bg-customBlue rounded-md "
                    onClick={() => {
                      formikProps.handleSubmit()
                      // alert("Action Confirmed!");
                      // closeModal();
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      }


      {/* 
      <button
        className="btn ml-2 font-bold bg-yellow-500 text-white"
        onClick={() => document.getElementById('my_modal_1').showModal()}>
        Import from file
        <PlusCircleIcon className="h-6 w-6 text-white-500" />
      </button> */}

      {/* <div className="dropdown dropdown-bottom dropdown-end">
        <label tabIndex={0} className="btn btn-sm btn-outline">
          <FunnelIcon className="w-5 mr-2" />
          Filter
        </label>
        <ul
          tabIndex={0}
          className="z-40 dropdown-content menu p-2 text-sm shadow bg-base-100 rounded-box w-52">
          {locationFilters.map((l, k) => {
            return (
              <li key={k}>
                <a onClick={() => showFiltersAndApply(l)}>{l}</a>
              </li>
            );
          })}
          <div className="divider mt-0 mb-0"></div>
          <li>
            <a onClick={() => removeAppliedFilter()}>Remove Filter</a>
          </li>
        </ul>
      </div> */}
    </div >
  );
};

function LoanApplication() {


  // Define file handling logic
  const [files, setFiles] = useState({
    borrowerValidID: null,
    bankStatement: null,
    coMakersValidID: null,
  });

  const onDrop = (acceptedFiles, fieldName) => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fieldName]: acceptedFiles[0],
    }));
  };

  const dropzoneProps = (fieldName) => ({
    onDrop: (files) => onDrop(files, fieldName),
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });
  const { loanId, rowIndex } = useParams();



  const [file, setFile] = useState(null);
  const [faqList, setList] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeChildID, setactiveChildID] = useState('');
  const [selectedLoan, setselectedLoan] = useState({});
  const [isEditModalOpen, setisEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();



  const [addressRegions, setRegions] = useState([]);
  const [addressProvince, setProvince] = useState([]);
  const [addressCity, setCity] = useState([]);
  const [addressBarangay, setBarangay] = useState([]);

  const [loanDetails, setLoanDetails] = useState([]);

  const prepareAddress = async () => {
    await regions().then(region => {

      //console.log({ region })
      setRegions(
        region.map(r => {
          return {
            value: r.region_code,
            label: r.region_name
          };
        })
      );
    });
    // await regionByCode('01').then(region => console.log(region.region_name));
    await provinces().then(province => console.log(province));
    // await provincesByCode('01').then(province => console.log(province));
    // await provinceByName('Rizal').then(province =>
    //   console.log(province.province_code)
    // );
    await cities().then(city => console.log(city));
    await barangays().then(barangays => console.log(barangays));
  };

  const getLoanDetails = async () => {

    let res = await axios({
      method: 'get',
      url: `/loan/${loanId}/details`,
      data: {

      }
    });
    let details = res.data.data;

    setLoanDetails(details)


  };

  useEffect(() => {


    prepareAddress();
    getLoanDetails()
    setIsLoaded(true);
  }, []);



  const appSettings = useSelector(state => state.appSettings);
  let { codeTypeList, packageList } = appSettings;

  const removeFilter = async () => {
    // let res = await axios({
    //   method: 'POST',
    //   url: 'user/getChildrenList',
    //   data: {
    //     sponsorIdNumber: ''
    //   }
    // });
    // let list = res.data.data;

    // console.log({ list });
    // setList(list);
  };

  const applyFilter = params => {
    let filteredfaqList = faqList.filter(t => {
      return t.address === params;
    });
    setList(filteredfaqList);
  };

  // Search according to name
  const applySearch = value => {
    let filteredUsers = users.filter(t => {
      return (
        t.email.toLowerCase().includes(value.toLowerCase()) ||
        t.firstName.toLowerCase().includes(value.toLowerCase()) ||
        t.lastName.toLowerCase().includes(value.toLowerCase())
      );
    });
    setList(filteredUsers);
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  // console.log(users);
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));




  const [currentStep, setCurrentStep] = useState(0);


  const [loanSettings, setLoanSettings] = useState({}); // Changed variable name here

  const fetchloanSettings = async () => {
    try {
      setIsLoaded(false);
      const res = await axios.get(`settings/read/1`); // Using shorthand for axios.get
      const settings = res.data.data; // Changed variable name here
      setLoanSettings(settings); // Changed function call here
    } catch (err) {

    } finally {

    }
  };

  useEffect(() => {
    fetchloanSettings(); // Changed function call here
    setIsLoaded(true);
  }, []);

  const formikConfig = (interest_rate) => {


    console.log({ loanDetails })

    return {
      initialValues: {

        calculatorLoanAmmount: loanDetails?.loan_amount || 0,
        calculatorInterestRate: (interest_rate || 3) * loanDetails.repayment_schedule_id,
        calculatorMonthsToPay: loanDetails.repayment_schedule_id,
        calculatorTotalAmountToPay: 0,
        remarks: '',
        status: ''

      },
      validationSchema: Yup.object({

        remarks: Yup.string().required('Required'),
      }),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
        setSubmitting(true);





        try {

          let updatedData = {
            loanId: loanId,
            loan_status: values.status,
            remarks: values.remarks
          }



          let res = await axios({
            method: 'post',
            url: `admin/loan/${loanId}/updateStatus/confirmation`,
            data: updatedData
          })


          getLoanDetails();
          toast.success('Successfully updated', {
            onClose: () => {

            },
            position: 'top-right',
            autoClose: 500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light'
          });


          document.getElementById("confirmationModal").close()
          resetForm()
        } catch (error) {
          console.log({ error });
        } finally {
        }




      }
    };
  };


  const result = {
    approved: false,
    message: 'Loan application denied due to the following criteria not meeting the required thresholds:',
    breakdown: {
      creditScore: {
        percentage: 80,
        message: 'Credit score meets the required threshold.'
      },
      income: {
        percentage: 60,
        message: 'Income is below the required minimum.'
      },
      loanToIncomeRatio: {
        percentage: 40,
        message: 'Loan amount exceeds the allowed limit based on income.'
      },
      employmentYears: {
        percentage: 90,
        message: 'Employment history meets the required duration.'
      }
    },
    overallApprovalPercentage: 65
  };


  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState(null);


  const fetchloanPaymentList = async () => {

    let res = await axios({
      method: 'get',
      url: `loan/${selectedLoan?.loan_id}/paymentList`,
      data: {
      }
    });
    let list = res.data.data;
    setloanPaymentList(list)
  };


  useEffect(() => {
    // Check for payment status in URL parameters
    const queryParams = new URLSearchParams(location.search);
    const payment = queryParams.get('payment');

    if (payment === 'success') {
      setPaymentStatus('success');
      toast.success('Payment completed successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });

      // Refresh loan data to show updated payment
      if (loanId) {
        fetchLoanPaymentList(loanId);
      }

      // Clear the URL parameter after handling
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === 'failed') {
      setPaymentStatus('failed');
      toast.error('Payment was not completed. Please try again or contact support.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });

      // Clear the URL parameter after handling
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search]);

  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    if (loanId) {

      const fetchloanPaymentList = async () => {

        let res = await axios({
          method: 'get',
          url: `loan/${loanId}/paymentList`,
          data: {
          }
        });
        let list = res.data.data;
        // setloanPaymentList(list)
      };


      fetchloanPaymentList(loanId);
    }
  }, [loanId, refreshData]);

  return isLoaded && !!loanDetails.loan_id && (
    <>
      <PaymentRedirectHandler setRefreshData={setRefreshData} />
      <Formik {...formikConfig(loanSettings.interest_rate)}>
        {(formikProps) => {
          return <TitleCard
            titleBadge={true}
            title={loanDetails.loan_status}
            topMargin="mt-2"
            TopSideButtons={
              <TopSideButtons
                applySearch={applySearch}
                applyFilter={applyFilter}
                removeFilter={removeFilter}
                faqList={faqList}
                formikProps={formikProps}
                loanDetails={loanDetails}
              />
            }
          >
            <div>



              <LoanManagementTabs
                loanDetails={loanDetails}
                formikProps={formikProps}
                rowIndex={rowIndex} />




            </div>
            <ToastContainer />







            <dialog id="confirmationModal" className="modal">
              <div className="modal-box w-11/12 max-w-2xl">

                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                  onClick={() => {

                    document.getElementById("confirmationModal").close()
                  }}


                >✕</button>

                {/* <div className="modal-header flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg">
                  <h1 className="text-xl font-semibold">Confirmation</h1>

                </div> */}

                <p className="text-sm text-gray-500 mt-1 font-bold"></p>
                <div className="p-2 space-y-4 md:space-y-6 sm:p-4">

                  {
                    loanDetails.loan_id && <LoanEvaluationResult

                      result={result}
                      loanDetails={loanDetails}
                    />

                  }

                  {/* <Alert
                    type={
                      formikProps.values.status === 'Approved' ? 'success' : 'warning'
                    } // Can be "success", "error", "info", "warning"
                    title="Approval Confirmation"
                    description="Are you sure you want to approve this loan application?"

                  /> */}
                  <TextAreaInput
                    isRequired
                    label="Remarks"
                    name="remarks"
                    type="text"
                    // hasTextareaHeight={true}
                    placeholder=""
                    value={formikProps.values.remarks}

                  />

                  <button
                    type="submit"
                    onClick={() => formikProps.handleSubmit()}
                    className={`btn mt-2 justify-end float-right 
                      ${formikProps.values.status === 'Approved' ? "bg-customBlue text-white" : "bg-red-500 text-white"
                      }`}
                    disabled={isSubmitting}>
                    {formikProps.values.status === 'Approved' ? "Approve" : "Reject"}
                  </button>
                </div>
              </div>
            </dialog >

            {paymentStatus && (
              <div className={`alert ${paymentStatus === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
                <div>
                  {paymentStatus === 'success' ? (
                    <>
                      <CheckCircle className="w-6 h-6 mr-2" />
                      <span>Payment completed successfully! Your loan records have been updated.</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 mr-2" />
                      <span>Payment was not completed. Please try again or contact support.</span>
                    </>
                  )}
                </div>
                <div className="flex-none">
                  <button
                    onClick={() => setPaymentStatus(null)}
                    className="btn btn-sm btn-ghost"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

          </TitleCard >


        }}</Formik>


    </>
  );
}

export default LoanApplication;
