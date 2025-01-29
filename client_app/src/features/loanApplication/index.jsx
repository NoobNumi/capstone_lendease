import moment from 'moment';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../common/headerSlice';
import TitleCard from '../../components/Cards/TitleCard';
// import { RECENT_LoanApplication } from '../../utils/dummyData';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import SearchBar from '../../components/Input/SearchBar';
import { NavLink, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ViewColumnsIcon from '@heroicons/react/24/outline/EyeIcon';
import PlusCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';


import 'react-tooltip/dist/react-tooltip.css'
// import Tooltip from 'react-tooltip';
import { Tooltip } from 'react-tooltip';
import {
  setAppSettings,
  getFeatureList
} from '../settings/appSettings/appSettingsSlice';

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




import { jwtDecode } from 'jwt-decode';
import checkAuth from '../../app/auth';
import LoanCalculator from "./loanCalculator";
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

import { formatAmount } from './../../features/dashboard/helpers/currencyFormat';


import { jsPDF } from 'jspdf';

const TopSideButtons = ({ removeFilter, applyFilter, applySearch, myLoanList }) => {
  const [filterParam, setFilterParam] = useState('');
  const [searchText, setSearchText] = useState('');

  const locationFilters = [''];

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
  return (
    <div className="inline-block float-right">
      {/* <SearchBar
        searchText={searchText}
        styleClass="mr-4"
        setSearchText={setSearchText}
      />
      {filterParam != '' && (
        <button
          onClick={() => removeAppliedFilter()}
          className="btn btn-xs mr-2 btn-active btn-ghost normal-case">
          {filterParam}
          <XMarkIcon className="w-4 ml-2" />
        </button>
      )} */}
      <div className="badge badge-neutral mr-2 px-4 p-4 bg-white text-blue-950">Total : {myLoanList.length}</div>

      <button className="btn btn-outline bg-blue-950 text-white" onClick={() => document.getElementById('addLoan').showModal()}>
        Add
        <PlusCircleIcon className="h-6 w-6 text-white-500" />
      </button>

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
    </div>
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

  const [myLoanList, setLoanList] = useState([]);

  const loanList = async () => {

    let res = await axios({
      method: 'POST',
      url: 'loan/list',
      data: {

      }
    });
    let list = res.data.data;

    setLoanList(list)


  };

  useEffect(() => {



    loanList()

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

    // //console.log({ list });
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

  // //console.log(users);
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const columns = useMemo(
    () => [

      {
        Header: '#',
        accessor: '',
        Cell: ({ row }) => {
          return <span className="">{row.index + 1}</span>;
        }
      },
      {
        Header: 'Type',
        accessor: 'loan_type_value',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Loan Amount',
        accessor: 'loan_amount',
        Cell: ({ row, value }) => {
          return <span className="">{formatAmount(value)}</span>;
        }
      },
      {
        Header: 'Interest Rate',
        accessor: 'interest_rate',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Months To Pay',
        accessor: 'repayment_schedule_id',
        Cell: ({ row, value }) => {
          return <span className="">{value} Months</span>;
        }
      },
      {
        Header: 'Date Created',
        accessor: 'application_date',
        Cell: ({ row, value }) => {
          return <span className="">

            {value &&
              format(value, 'MMM dd, yyyy hh:mm a')}

          </span>;
        }
      },
      {
        Header: 'Date Approved',
        accessor: 'approval_date',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },

      {
        Header: 'Is Disbursed?',
        accessor: 'disbursement_id',
        Cell: ({ value, row }) => {
          let proof_of_disbursement = row.original.proof_of_disbursement;
          return <h2 className='font-bold'>{proof_of_disbursement ? "Yes" : "No"}</h2>;
        }
      },

      {
        Header: 'Status',
        accessor: 'loan_status',
        Cell: ({ row, value }) => {
          return <StatusPill value={value} />



        }
      },


      {
        Header: 'Action',
        accessor: '',
        Cell: ({ row }) => {
          let loan = row.original;



          return (
            (
              <div className="flex">

                {/* <button className="btn btn-outline btn-sm"

                // onClick={() => {
                //   //  //console.log({ loan })
                //   // setisEditModalOpen(true)
                //   setselectedLoan(loan);

                //   document.getElementById('viewLoan').showModal();
                //   // setFieldValue('Admin_Fname', 'dex');
                // }}

                >

                  <i class="fa-solid fa-eye"></i>
                </button> */}

                <a
                  href={`loan_details/${loan.loan_id}`} // Replace with the actual URL for the loan details
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <i className="fa-solid fa-eye"></i>
                </a>



                {/* <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => {


                    setactiveChildID(l.id);

                  }}>
                  <i class="fa-solid fa-archive"></i>
                </button> */}
              </div>
            )
          );
        }
      },

    ],
    []
  );

  const handleOnChange = e => {
    //console.log(e.target.files[0]);
    setFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('file', file);
      let res = await axios({
        // headers: {
        //   'content-type': 'multipart/form-data'
        // },
        method: 'POST',
        url: 'user/uploadFile',
        data
      });

      setIsSubmitting(false);
      fetchFaqList();
      toast.success(`Uploaded Successfully`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    } catch (error) {
      toast.error(`Something went wrong`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    } finally {
      document.getElementById('my_modal_1').close();
    }
  };


  const [currentStep, setCurrentStep] = useState(0);



  const [selectedUser, setSelectedUser] = useState({});



  const getUser = async () => {

    const token = checkAuth();
    const decoded = jwtDecode(token);
    let user_id = decoded.user_id;

    let res = await axios({
      method: 'GET',
      url: `user/${user_id}`
    });
    let user = res.data.data;




    await regions().then(region => {
      setRegions(
        region.map(r => {
          return {
            value: r.region_code,
            label: r.region_name
          };
        })
      );
    });

    await provincesByCode(user.address_region).then(province => {




      setProvince(
        province.map(r => {
          return {
            value: r.province_code,
            label: r.province_name
          };
        })
      );
    });


    await cities(user.address_province).then(cities => {

      setCity(
        cities.map(r => {
          return {
            value: r.city_code,
            label: r.city_name
          };
        })
      );
    });
    await barangays(user.address_city).then(barangays => {
      setBarangay(
        barangays.map(r => {
          return {
            value: r.brgy_code,
            label: r.brgy_name
          };
        })
      );
    });



    setSelectedUser(user);
    setIsLoaded(true)

  };




  useEffect(() => {
    getUser();




    //console.log({ selectedUser })
    // prepareAddress(selectedUser)



    // setIsLoaded(true);
    ////console.log({ selectedUser: selectedUser });
  }, []);






  const [loanSettings, setLoanSettings] = useState({}); // Changed variable name here



  const fetchloanSettings = async () => {
    try {
      const res = await axios.get(`settings/read/1`); // Using shorthand for axios.get
      const settings = res.data.data; // Changed variable name here
      setLoanSettings(settings); // Changed function call here
    } catch (err) {
      //console.error('Error fetching pricing settings:', err); // Log the error
      setError('Failed to fetch pricing settings'); // Changed error message here
    } finally {
      setIsLoaded(true); // Ensure isLoaded is set to true regardless of success or error
    }
  };

  useEffect(() => {
    fetchloanSettings(); // Changed function call here
  }, []);

  const formikConfig = (selectedUser, loanType) => {

    //console.log({ loanType })




    let PersonalInfoTabValidation = {};

    if (currentStep === 0) {
      PersonalInfoTabValidation = {
        loan_type: Yup.string()
          .required('Required'),
        first_name: Yup.string()
          .required('Required'),

        middle_name: Yup.string()
          .required('Required'),
        last_name: Yup.string()
          .required('Required'),
        // work: Yup.string()
        //   .required('Required'),
        address_region: Yup.string().required('Required field'),
        address_province: Yup.string().required('Required field'),
        address_city: Yup.string().required('Required field'),
        address_barangay: Yup.string().required('Required field'),
        // streetAddress: Yup.string().required('Required field'),
        residence_type: Yup.string()
          .required('Required')
      }
    }
    else if (currentStep === 1) {


      // //console.log({ dex: values.loan_type })

      if (loanType === 'NON-EMPLOYEE LOAN') {
        PersonalInfoTabValidation = {

          has_business: Yup.string().required('Please specify if you own a business'),
          type_of_business: Yup.object().when('has_business', {
            is: (value) => value === 'YES', // Ensure this is a valid condition
            then: (schema) => schema.required('Required'), // Apply validation
            otherwise: (schema) => schema.notRequired(),
          }),
          // Make optional

          business_address: Yup.string().required('Business address is required'),
          income_flow: Yup.string().required('Please specify your income flow'),
          income_amount: Yup.number().positive('Income must be a positive number').required('Income is required'),
          numberField: Yup.number().required('This field is required'),
          loan_security: Yup.string().required('Loan security is required'),
          relationship_to_loan_guarantor: Yup.string().required('Please specify who will help pay your loan if a problem occurs'),

          loan_guarantor: Yup.string().required('Loan guarantor name is required'),
          // loan_guarantor: Yup.string().when('relationship_to_loan_guarantor', {
          //   is: (value) => value !== 'OTHERS',
          //   then: Yup.string().required('Loan guarantor name is required if not "Others"'),
          //   otherwise: Yup.string().notRequired(),
          // })
        }
      }
      else {
        PersonalInfoTabValidation = {
          work_type: Yup.string().required('Work type is required'),
          position: Yup.string().required('Position is required'),
          status: Yup.string().required('Status is required'),
          agency_name: Yup.string().required('Agency name is required'),
          // school_name: Yup.string().when('position', {
          //   is: 'Teacher', // Conditional validation if position is 'Teacher'
          //   then: Yup.string().required('School name is required for teachers'),
          //   otherwise: Yup.string(),
          // }),
          pensioner: Yup.string().required('Please select if you are a pensioner'),


          monthly_pension_amount: Yup.string().when('pensioner', {
            is: (value) => value === 'YES', // Ensure this is a valid condition
            then: (schema) => schema.required('Required'), // Apply validation
            otherwise: (schema) => schema.notRequired(),
          }),

          // monthly_pension: Yup.number()
          //   .typeError('Monthly pension must be a number')
          //   .when('pensioner', {
          //     is: 'YES',
          //     then: Yup.number().required('Monthly pension amount is required'),
          //     otherwise: Yup.number().notRequired(),
          //   }),
          loan_type_specific: Yup.object().required('Loan type is required'),
          // proposed_loan_amount: Yup.number()
          //   .typeError('Loan amount must be a number')
          //   .required('Proposed loan amount is required'),
          // installment_duration: Yup.string().required('Duration is required'),
          numberField: Yup.number().required('Number is required'),
          //   .required('Installment duration is required'),
          loan_security: Yup.string().required('Loan security (ATM/Passbook) is required')
        }
      }

    }

    else if (currentStep === 3) {
      PersonalInfoTabValidation = {
        calculatorLoanAmmount: Yup.number().required('Required'),
        calculatorInterestRate: Yup.number().required('Required'),
        calculatorMonthsToPay: Yup.number().required('Required'),
      }
    }

    else if (currentStep === 4) {

      //console.log("disbursement validation")
      PersonalInfoTabValidation = {
        disbursement_type: Yup.string().required('Disbursement type is required'),
        disbursement_bank_or_wallet_name: Yup.string().when('disbursement_type', {
          is: (val) => val === 'E-WALLET/BANK TRANSFER', // Condition
          then: (schema) => schema.required('Bank/E-Wallet Name is required'), // Apply validation
          otherwise: (schema) => schema.notRequired(), // Make optional
        }),
        disbursement_account_name: Yup.string().when('disbursement_type', {
          is: (val) => val === 'E-WALLET/BANK TRANSFER',
          then: (schema) => schema.required('Account Name is required'),
          otherwise: (schema) => schema.notRequired(),
        }),
        disbursement_account_number: Yup.string().when('disbursement_type', {
          is: (val) => val === 'E-WALLET/BANK TRANSFER',
          then: (schema) =>
            schema
              .matches(/^\d+$/, 'Account Number must be numeric') // Validate numeric
              .required('Account Number is required'),
          otherwise: (schema) => schema.notRequired(),
        }),
      }

      //console.log({ PersonalInfoTabValidation })
    }




    return {
      initialValues: {

        "loan_type": "",
        first_name: selectedUser.first_name,
        middle_name: selectedUser.middle_name,
        last_name: selectedUser.last_name,
        "work": "",
        "address_region": selectedUser.address_region,
        "address_province": selectedUser.address_province,
        "address_city": selectedUser.address_city,
        "address_barangay": selectedUser.address_barangay,
        "residence_type": "",
        "work_type": "",
        "position": "",
        "status": "",
        "agency_name": "",
        "school_name": "",
        "pensioner": "YES",
        "monthly_pension": "",
        "loan_type_specific": "",
        "proposed_loan_amount": "",
        "installment_duration": "",
        "loan_security": "",
        "numberField": "",
        "borrowerValidID": null,
        "bankStatement": null,
        "coMakersValidID": null,



        work_name: null,
        has_business: null,
        type_of_business: null,

        disbursement_type: 'CASH', // The type of disbursement
        disbursement_bank_or_wallet_name: '', // The bank or e-wallet name
        disbursement_account_name: '', // The account holder's name
        disbursement_account_number: '', // The account number

        business_address: null,
        income_flow: null,
        income_amount: null,
        numberField: null,
        loan_security: null,
        relationship_to_loan_guarantor: null,

        loan_guarantor: null,




        calculatorLoanAmmount: 20000,
        calculatorInterestRate: (loanSettings?.interest_rate || 3),
        calculatorMonthsToPay: 6,
        calculatorTotalAmountToPay: 0,

      },
      validationSchema: Yup.object({
        ...PersonalInfoTabValidation

      }),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
        setSubmitting(true);

        console.log({ values })


        try {

          const doc = new jsPDF();

          let data = {
            ...values,
            loan_type_specific: values.loan_type_specific.value,
            type_of_business: values?.type_of_business?.value || '',

          }


          let res = await axios({
            method: 'post',
            url: `loan/create`,
            data: data
          })



          let loan_application_id = res.data.data.loan_application_id

          const formData = new FormData();
          formData.append('bankStatement', values.bankStatement); // Assuming values contains File objects
          formData.append('borrowerValidID', values.borrowerValidID);
          formData.append('coMakersValidID', values.coMakersValidID);
          formData.append('loan_application_id', loan_application_id);

          await axios({
            // headers: {
            //   'content-type': 'multipart/form-data'
            // },
            method: 'POST',
            url: 'loan/upload-files',
            data: formData
          });

          setSubmitting(false);

          resetForm();
          loanList();
          document.getElementById('addLoan').close();

          toast.success('Successfully created!', {
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

          const content = [
            `Loan Type: ${data.loan_type}`,
            `Name: ${data.first_name} ${data.middle_name} ${data.last_name}`,
            `Work: ${data.work || "N/A"}`,
            `Region: ${data.address_region}`,
            `Province: ${data.address_province}`,
            `City: ${data.address_city}`,
            `Barangay: ${data.address_barangay}`,
            `Residence Type: ${data.residence_type}`,
            `Work Type: ${data.work_type}`,
            `Position: ${data.position}`,
            `Status: ${data.status}`,
            `Agency Name: ${data.agency_name}`,
            `Pensioner: ${data.pensioner}`,
            `Loan Type Specific: ${data.loan_type_specific}`,
            `Proposed Loan Amount: ${data.proposed_loan_amount || "N/A"}`,
            `Installment Duration: ${data.installment_duration || "N/A"}`,
            `Loan Security: ${data.loan_security}`,
            `Disbursement Type: ${data.disbursement_type}`,
            `Business Address: ${data.business_address}`,
            `Income Flow: ${data.income_flow}`,
            `Income Amount: ${data.income_amount}`,
            `Relationship to Loan Guarantor: ${data.relationship_to_loan_guarantor}`,
            `Loan Guarantor: ${data.loan_guarantor}`,
            `Calculator Loan Amount: ${data.calculatorLoanAmmount}`,
            `Calculator Interest Rate: ${data.calculatorInterestRate}`,
            `Calculator Months to Pay: ${data.calculatorMonthsToPay}`,
            `Monthly Pension Amount: ${data.monthly_pension_amount}`
          ];

          // Adding a professional header
          doc.setFontSize(18);
          doc.text("Loan Application Details", 105, 20, { align: "center" });
          doc.setFontSize(12);
          doc.text("Generated on: " + new Date().toLocaleDateString(), 105, 28, { align: "center" });

          // Drawing a line
          doc.line(10, 35, 200, 35);

          // Adding content with sections
          const sections = [
            {
              title: "Personal Information", fields: [
                `Name: ${data.first_name} ${data.middle_name} ${data.last_name}`,
                `Work: ${data.work || "N/A"}`,
                `Region: ${data.address_region}`,
                `Province: ${data.address_province}`,
                `City: ${data.address_city}`,
                `Barangay: ${data.address_barangay}`,
                `Residence Type: ${data.residence_type}`
              ]
            },
            {
              title: "Employment Details", fields: [
                `Work Type: ${data.work_type}`,
                `Position: ${data.position}`,
                `Agency Name: ${data.agency_name}`
              ]
            },
            {
              title: "Loan Details", fields: [
                `Loan Type: ${data.loan_type}`,
                `Loan Type Specific: ${data.loan_type_specific}`,
                `Proposed Loan Amount: ${data.calculatorLoanAmmount || "N/A"}`,
                `Calculator Interest Rate: ${data.calculatorInterestRate}`,
                `Installment Duration: ${data.calculatorMonthsToPay || "N/A"}`,
                // `Loan Security: ${data.loan_security}`
              ]
            },
            {
              title: "Financial Information", fields: [
                `Disbursement Type: ${data.disbursement_type}`,
                `Business Address: ${data.business_address}`,
                `Income Flow: ${data.income_flow}`,
                `Income Amount: ${data.income_amount}`,
                `Monthly Pension Amount: ${data.monthly_pension_amount}`
              ]
            },
            {
              title: "Guarantor Details", fields: [
                `Relationship to Loan Guarantor: ${data.relationship_to_loan_guarantor}`,
                `Loan Guarantor: ${data.loan_guarantor}`
              ]
            },

          ];

          let yPosition = 40;

          sections.forEach(section => {
            doc.setFontSize(14);
            doc.text(section.title, 10, yPosition);
            yPosition += 8;

            doc.setFontSize(12);
            section.fields.forEach(field => {
              doc.text(field, 15, yPosition);
              yPosition += 8;
            });

            yPosition += 5;
          });

          // Saving the PDF
          doc.save("loan_details.pdf");


          console.log({ formattedValues })

        } catch (error) {

          console.log(error)


          toast.error('Something went wrong', {
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
        }





      }
    };
  };


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


  const [loanType, setLoanType] = useState('');

  const [selectedDisbursement, setSelectedDisbursement] = useState('');
  return (
    isLoaded &&
    <TitleCard
      title="List"
      topMargin="mt-2"
      TopSideButtons={
        <TopSideButtons
          applySearch={applySearch}
          applyFilter={applyFilter}
          removeFilter={removeFilter}
          myLoanList={myLoanList}
        />
      }>
      <div className="">

        <dialog id="addLoan" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <div>

              <div className="bg-white p-1 rounded-full shadow-lg bg-gradient-to-r from-gray-200 to-gray-300 z-10 text-blue-950 border bg-white rounded flex items-center space-x-4">
                <img
                  src="/LOGO.png"
                  alt="Logo"
                  className="w-20 h-20 rounded-full border-2 border-blue-950"
                />
                <p className="font-bold text-lg">New Loan Application</p>
              </div>

            </div>

            {/* <h2 className="text-xl font-bold">APPLY FOR A LOAN</h2> */}

            <p className="text-sm text-gray-500 mt-1 font-bold"></p>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              {selectedUser.role &&
                <Formik {...formikConfig(selectedUser, loanType)}>
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
                    isSubmitting,

                  }) => {


                    // console.log({errors})

                    // Detect changes in values.loan_type and update state
                    useEffect(() => {
                      if (values.loan_type !== loanType) {
                        //console.log("Loan Type changed to:", values.loan_type);
                        setLoanType(values.loan_type);  // Set state with the updated loan type
                      }
                    }, [values.loan_type, loanType]);

                    const PersonalInfo = useMemo(() => (
                      <div>
                        <Form className="">

                          <Radio
                            isRequired
                            label="Loan Type"
                            name="loan_type" // This should be "loan_type"
                            value={values.loan_type}
                            setFieldValue={setFieldValue}
                            onBlur={handleBlur}
                            options={[
                              { value: 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', label: 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN' },
                              { value: 'NON-EMPLOYEE LOAN', label: 'NON-EMPLOYEE LOAN' }
                            ]}

                          // onChange={(event) => {
                          //   const selectedValue = event.target.value;
                          //   setFieldValue("loan_type", selectedValue); // Update Formik field
                          //   //console.log("Selected Loan Type:", selectedValue);
                          // }}
                          />
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">
                            <InputText
                              isRequired
                              placeholder=""
                              label="Given Name"
                              name="first_name"
                              type="text"
                              value={values.first_name} // Bind value to Formik state
                              onBlur={handleBlur}
                              onChange={(e) => {

                                //console.log(e.target.value)
                                setFieldValue('first_name', e.target.value); // Use the input value
                              }}
                            />
                            <InputText
                              isRequired
                              placeholder=""
                              label="Middle Name"
                              name="middle_name"
                              type="middle_name"

                              value={values.middle_name}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />
                            <InputText
                              isRequired
                              placeholder=""
                              label="Last Name"
                              name="last_name"
                              type="last_name"

                              value={values.last_name}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>

                          <div className="z-50 grid grid-cols-1 gap-3 md:grid-cols-4 ">
                            <Dropdown
                              className="z-50"

                              label="Region"
                              name="address_region"
                              value={values.address_region}

                              onBlur={handleBlur}
                              options={addressRegions}
                              affectedInput="address_province"
                              allValues={values}
                              setFieldValue={setFieldValue}
                              functionToCalled={async regionCode => {
                                if (regionCode) {
                                  setFieldValue('address_province', '');
                                  await provincesByCode(regionCode).then(
                                    province => {
                                      setProvince(
                                        province.map(p => {
                                          return {
                                            value: p.province_code,
                                            label: p.province_name
                                          };
                                        })
                                      );
                                    }
                                  );
                                }
                              }}
                            />

                            <Dropdown
                              className="z-50"

                              label="Province"
                              name="address_province"
                              value={values.address_province}
                              d
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={addressProvince}
                              affectedInput="address_city"
                              functionToCalled={async code => {
                                if (code) {
                                  await cities(code).then(cities => {
                                    setCity(
                                      cities.map(p => {
                                        return {
                                          value: p.city_code,
                                          label: p.city_name
                                        };
                                      })
                                    );
                                  });
                                }
                              }}
                            />
                            <Dropdown
                              className="z-50"

                              label="City"
                              name="address_city"
                              // value={values.civilStatus}
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={addressCity}
                              affectedInput="address_barangay"
                              functionToCalled={async code => {
                                if (code) {
                                  await barangays(code).then(cities => {
                                    setBarangay(
                                      cities.map(p => {
                                        //console.log({ p });
                                        return {
                                          value: p.brgy_code,
                                          label: p.brgy_name
                                        };
                                      })
                                    );
                                  });
                                }
                              }}
                            />
                            <Dropdown
                              className="z-50"

                              label="Barangay"
                              name="address_barangay"
                              value={values.address_barangay}

                              onBlur={handleBlur}
                              options={addressBarangay}
                              affectedInput=""
                              functionToCalled={async code => { }}
                              setFieldValue={setFieldValue}
                            />
                          </div>
                          <Radio
                            setFieldValue={setFieldValue}
                            label="Residence Type"
                            name="residence_type"
                            placeholder=""
                            value={values.residence_type}

                            onBlur={handleBlur}
                            options={[
                              {
                                name: 'OWN',
                                displayName: 'Own'
                              }, {
                                name: 'RENT',
                                displayName: 'Rent'
                              }].map(val => {
                                return {
                                  value: val.name,
                                  label: val.displayName
                                };
                              })}
                          />
                        </Form>
                      </div>
                    ), [currentStep, errors, values, addressRegions, addressProvince, addressCity, addressBarangay, values.loan_type]);


                    const AccountDetails = useMemo(() => (
                      <div>


                        <Form className="">
                          {values.loan_type === 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN' && <div>
                            <div class="flex justify-center items-center">
                              <h1 class="text-center font-bold text-blue-950">{values.loan_type}</h1>
                            </div>
                            <div className="z-50 grid grid-cols-1 gap-3 md:grid-cols-2 ">

                              <Dropdown
                                // icons={mdiAccount}
                                label="Work Type"
                                name="work_type"
                                placeholder=""
                                value={values.work_type}
                                setFieldValue={setFieldValue}
                                onBlur={handleBlur}
                                options={[
                                  {
                                    name: 'Private Employee',
                                    displayName: 'Private Employee'
                                  }, {
                                    name: 'Public Employee',
                                    displayName: 'Public Employee'
                                  }].map(val => {
                                    return {
                                      value: val.name,
                                      label: val.displayName
                                    };
                                  })}

                              />


                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">
                              <InputText
                                isRequired
                                placeholder=""
                                label="Position"
                                name="position"
                                type="position"

                                value={values.position}
                                onBlur={handleBlur} // This apparently updates `touched`?
                              />
                              <InputText
                                isRequired
                                placeholder=""
                                label="Status"
                                name="status"
                                type="status"

                                value={values.status}
                                onBlur={handleBlur} // This apparently updates `touched`?
                              />
                              <InputText
                                isRequired
                                placeholder=""
                                label="Agency Name"
                                name="agency_name"
                                type="agency_name"

                                value={values.agency_name}
                                onBlur={handleBlur} // This apparently updates `touched`?
                              />

                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">
                              <InputText
                                isRequired
                                placeholder=""
                                label="If a teacher, name of school presently assigned"
                                name="name_of_school"
                                type="name_of_school"

                                value={values.name_of_school}
                                onBlur={handleBlur} // This apparently updates `touched`?
                              />

                            </div>

                            <div className="mt-4 z-50 grid grid-cols-1 gap-3 md:grid-cols-2 ">
                              <div className='mt-2'>


                                <Radio
                                  isRequired
                                  label="Pensioner?"
                                  name="pensioner" // This should be "loan_type"
                                  value={values.pensioner}
                                  setFieldValue={setFieldValue}
                                  onBlur={handleBlur}
                                  options={[
                                    { value: 'YES', label: 'YES' },
                                    { value: 'NO', label: 'NO' }
                                  ]}




                                />

                              </div>


                              {
                                values.pensioner === 'YES' ? <InputText

                                  isRequired
                                  placeholder=""
                                  label="Amount of Monthly Pension"
                                  name="monthly_pension_amount"
                                  type="number"

                                  value={values.monthly_pension_amount}
                                  onBlur={handleBlur} // This apparently updates `touched`?
                                /> : null
                              }


                            </div>
                            <div className="mt-4 z-50 grid grid-cols-1 gap-3 md:grid-cols-2 ">



                              {/* <InputText

                                isRequired
                                placeholder=""
                                label="Proposed loan amount"
                                name="proposed_loan_amount"
                                type="number"

                                value={values.proposed_loan_amount}
                                onBlur={handleBlur} // This apparently updates `touched`?
                              /> */}

                            </div>
                            <div className="mt-4 z-50 grid grid-cols-1 gap-3 md:grid-cols-3 ">
                              {/* <div className='mt-2'>
                                <Dropdown
                                  // icons={mdiAccount}
                                  label="Installment Duration (Months)"
                                  name="installment_duration"
                                  placeholder=""
                                  value={values.installment_duration}
                                  setFieldValue={setFieldValue}
                                  onBlur={handleBlur}
                                  options={[
                                    {
                                      name: '1',
                                      displayName: '1'
                                    },
                                  ].map(val => {
                                    return {
                                      value: val.name,
                                      label: val.displayName
                                    };
                                  })}

                                />

                              </div> */}

                              <div className='mt-2'>
                                <Dropdown
                                  canAddOptions={true}
                                  // icons={mdiAccount}
                                  label="Type of Loan"
                                  name="loan_type_specific"
                                  placeholder=""
                                  value={values.loan_type_specific}

                                  onBlur={handleBlur}
                                  setFieldValue={setFieldValue}
                                  options={[
                                    {
                                      name: 'HOUSING LOAN',
                                      displayName: 'HOUSING LOAN'
                                    },
                                    {
                                      name: 'OTHERS',
                                      displayName: 'OTHERS'
                                    }].map(val => {
                                      return {
                                        value: val.name,
                                        label: val.displayName
                                      };
                                    })}
                                  onChange={(newValue) => {


                                    console.log({ newValue })
                                    // setSelectedOptions(newValue);
                                    setFieldValue('loan_type_specific', newValue)
                                    // setSelectedOptions(newValue);
                                  }}

                                />

                              </div>
                              <InputText

                                isRequired
                                placeholder=""
                                label="No"
                                name="numberField"
                                type="number"

                                value={values.numberField}
                                onBlur={handleBlur} // This apparently updates `touched`?
                              />
                              <InputText
                                isRequired
                                placeholder="ATM/Passbook number"
                                label="Loan Security"
                                name="loan_security"
                                type="text"

                                value={values.loan_security}
                                onBlur={handleBlur} // This apparently updates `touched`?
                              />

                            </div>
                            {/* <div className="grid grid-cols-1 gap-3 md:grid-cols-1 mt-2">
                           
                            </div> */}
                          </div>
                          }

                          {values.loan_type !== 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN' && <div>


                            <div class="flex justify-center items-center">
                              <h1 class="text-center font-bold text-blue-950">{values.loan_type}</h1>
                            </div>




                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                              <div className='mt-4'>

                                <Radio
                                  isRequired
                                  label="Do you own a business"
                                  name="has_business" // This should be "loan_type"
                                  value={values.has_business}
                                  setFieldValue={setFieldValue}
                                  onBlur={handleBlur}
                                  options={[
                                    { value: 'YES', label: 'YES' },
                                    { value: 'NO', label: 'NO' }
                                  ]}
                                />
                              </div>

                              <div className='mt-4'>

                                {
                                  values.has_business === 'YES' &&
                                  <Dropdown
                                    isMulti={false}
                                    canAddOptions={true}
                                    className="z-50"
                                    label="Type of Business"
                                    name="type_of_business"
                                    value={values.type_of_business}

                                    onBlur={handleBlur}
                                    options={[
                                      { value: 'Corporation', label: 'Corporation' },
                                      { value: 'Nonprofit', label: 'Nonprofit' },
                                      { value: 'Cooperative', label: 'Cooperative' },
                                      { value: 'Franchise', label: 'Franchise' },
                                    ]}
                                    affectedInput=""
                                    functionToCalled={async code => { }}
                                    // setFieldValue={setFieldValue}
                                    onChange={(newValue) => {


                                      console.log({ newValue })
                                      // setSelectedOptions(newValue);
                                      setFieldValue('type_of_business', newValue)
                                      // setSelectedOptions(newValue);
                                    }}
                                  />

                                }</div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">

                              <InputText
                                isRequired
                                placeholder="Enter your business address"
                                label="Business Address"
                                name="business_address"
                                type="text"

                                value={values.business_address}
                                onBlur={handleBlur} // This apparently updates `touched`?
                              />


                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                              <div className='mt-4'>

                                <Radio
                                  isRequired
                                  label="Income Flow"
                                  name="income_flow" // This should be "loan_type"
                                  value={values.income_flow}
                                  setFieldValue={setFieldValue}
                                  onBlur={handleBlur}
                                  options={[
                                    { value: 'DAILY', label: 'DAILY' },
                                    { value: 'WEEKLY', label: 'WEEKLY' },
                                    { value: 'MONTHLY', label: 'MONTHLY' }
                                  ]}
                                />
                              </div>

                              <InputText
                                isRequired
                                placeholder="Enter your income"
                                label="Income"
                                name="income_amount"
                                type="number"

                                value={values.income_amount}
                                onBlur={handleBlur} // This apparently updates `touched`?
                              />


                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">

                              <InputText

                                isRequired
                                placeholder=""
                                label="No"
                                name="numberField"
                                type="number"

                                value={values.numberField}
                                onBlur={handleBlur} // This apparently updates `touched`?
                              />
                              <InputText
                                isRequired
                                placeholder="ATM/Passbook number"
                                label="Loan Security"
                                name="loan_security"
                                type="text"

                                value={values.loan_security}
                                onBlur={handleBlur} // This apparently updates `touched`?
                              />  </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                              <div className='mt-4'>

                                <Radio
                                  isRequired
                                  label="If a problem occurs and you fail to pay your loan, who is responsible for helping you to pay it: *"
                                  name="relationship_to_loan_guarantor" // This should be "loan_type"
                                  value={values.relationship_to_loan_guarantor}
                                  setFieldValue={setFieldValue}
                                  onBlur={handleBlur}
                                  options={[
                                    { value: 'SPOUSE', label: 'SPOUSE' },
                                    { value: 'CHILD', label: 'CHILD' },
                                    { value: 'MOTHER', label: 'MOTHER' },
                                    { value: 'OTHERS', label: 'OTHERS' }
                                  ]}
                                />
                              </div>

                              <InputText
                                isRequired
                                placeholder="Indicate the name"
                                label="Loan Guarantor"
                                name="loan_guarantor"
                                type="text"
                                value={values.loan_guarantor}
                                onBlur={handleBlur} // This apparently updates `touched`?
                              />
                            </div>
                          </div>
                          }

                        </Form>
                      </div>
                    ), [currentStep, errors, values]);



                    const SupportingDocuments = () => {

                      let hasError1 = errors['borrowerValidID'];
                      let hasError2 = errors['bankStatement'];
                      let hasError3 = errors['coMakersValidID'];
                      return (
                        <div className="space-y-4">
                          {/* Borrower's Valid ID */}
                          <h1 className="font-bold text-lg text-center">Upload Supporting Documents</h1>
                          <div

                            className={`${hasError1 ? "space-y-4 p-4 border-2 rounded border-red-500" : ""
                              }`}>


                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Borrower's Valid ID
                            </label>
                            <DropzoneArea
                              fieldName="borrowerValidID"
                              files={files}
                              dropzoneProps={dropzoneProps("borrowerValidID")}
                              setFieldValue={setFieldValue}
                              errors={errors}
                            />
                            {errors.borrowerValidID && <p className="text-red-500 text-sm mt-2">{errors.borrowerValidID}</p>}
                          </div>

                          {/* Bank Statement */}
                          <div

                            className={`${hasError2 ? "space-y-4 p-4 border-2 rounded border-red-500" : ""
                              }`}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bank Statement
                            </label>
                            <DropzoneArea
                              fieldName="bankStatement"
                              files={files}
                              dropzoneProps={dropzoneProps("bankStatement")}
                              setFieldValue={setFieldValue}
                              errors={errors}
                            />
                            {errors.bankStatement && <p className="text-red-500 text-sm mt-2">{errors.bankStatement}</p>}
                          </div>

                          {/* Co-maker's Valid ID */}
                          <div

                            className={`${hasError2 ? "space-y-4 p-4 border-2 rounded border-red-500" : ""
                              }`}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Co-maker's Valid ID
                            </label>
                            <DropzoneArea
                              fieldName="coMakersValidID"
                              files={files}
                              dropzoneProps={dropzoneProps("coMakersValidID")}
                              setFieldValue={setFieldValue}
                              errors={errors}
                            />

                            {errors.coMakersValidID && <p className="text-red-500 text-sm mt-2">{errors.coMakersValidID}</p>}
                          </div>

                          {/* Submit */}
                          {/* <button
                          type="button"
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => {
                            //console.log({ files })



                          }}
                        >
                          Submit
                        </button> */}
                        </div>
                      );

                    };










                    const DisbursementDetails = useMemo(() => (
                      <div>


                        <Form className="">


                          <div>


                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                              <div className='mt-4'>

                                <Radio
                                  isRequired
                                  label="Preferred Disbursement Type*"
                                  name="disbursement_type" // This should be "loan_type"
                                  value={values.disbursement_type}
                                  setFieldValue={setFieldValue}
                                  onBlur={handleBlur}
                                  options={[
                                    { value: 'CASH', label: 'CASH' },
                                    { value: 'E-WALLET/BANK TRANSFER', label: 'E-WALLET/BANK TRANSFER' }
                                  ]}
                                />
                              </div>


                              {values.disbursement_type === 'CASH' && (
                                <div className="mt-4 col-span-2">
                                  <div className="bg-yellow-100 border border-yellow-500 text-yellow-700 p-4 rounded">
                                    <p className="font-semibold">Info:</p>
                                    <p>Please visit the office to collect your cash disbursement upon approval.</p>
                                  </div>
                                </div>
                              )}


                            </div>


                            {values.disbursement_type === 'E-WALLET/BANK TRANSFER' && (

                              <div>
                                <div className="mt-4 col-span-2">
                                  <div className="bg-yellow-100 border border-yellow-500 text-yellow-700 p-4 rounded">
                                    <p className="font-semibold">Important:</p>
                                    <p>
                                      Please carefully review and double-check your bank or e-wallet details. Disbursements are
                                      irreversible once sent.
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                  <div className='mt-2'>
                                    <Dropdown
                                      // icons={mdiAccount}
                                      label="Bank/E-Wallet Name"
                                      name="disbursement_bank_or_wallet_name"
                                      placeholder=""
                                      value={values.disbursement_bank_or_wallet_name}
                                      setFieldValue={setFieldValue}
                                      onBlur={handleBlur}
                                      options={[
                                        {
                                          name: 'Gcash',
                                          displayName: 'Gcash'
                                        }, {
                                          name: 'Paymaya',
                                          displayName: 'Paymaya'
                                        },
                                        {
                                          name: 'BDO',
                                          displayName: 'BDO'
                                        },
                                        {
                                          name: 'BPI',
                                          displayName: 'BPI'
                                        }
                                      ].map(val => {
                                        return {
                                          value: val.name,
                                          label: val.displayName
                                        };
                                      })}

                                    />
                                  </div>
                                  {/* <InputText
                                    isRequired
                                    placeholder="Bank/E-Wallet Name"
                                    label="Bank/E-Wallet Name"
                                    name="disbursement_bank_or_wallet_name"
                                    type="text"
                                    value={values.disbursement_bank_or_wallet_name}
                                    onBlur={handleBlur}
                                  // onChange={(e) => setFieldValue('disbursement_bank_or_wallet_name', e.target.value)}
                                  /> */}

                                  <InputText
                                    isRequired
                                    placeholder="Account Name"
                                    label="Account Name"
                                    name="disbursement_account_name"
                                    type="text"
                                    value={values.disbursement_account_name}
                                    onBlur={handleBlur}
                                  // onChange={(e) => setFieldValue('disbursement_account_name', e.target.value)}
                                  />
                                  <InputText
                                    isRequired
                                    placeholder="Account Number"
                                    label="Account Number"
                                    name="disbursement_account_number"
                                    type="text"
                                    value={values.disbursement_account_number}
                                    onBlur={handleBlur}
                                  // onChange={(e) => setFieldValue('disbursement_account_number', e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>


                        </Form>
                      </div>
                    ), [currentStep, errors, values]);




                    const Calculator = useMemo(() => (
                      <div>
                        <Form className="">
                          <LoanCalculator
                            isReadOnly={false}
                            values={values}
                            setFieldValue={setFieldValue}
                            handleBlur={handleBlur}
                            calculatorLoanAmmount={values.calculatorLoanAmmount}
                            calculatorInterestRate={values.calculatorInterestRate}
                            calculatorMonthsToPay={values.calculatorMonthsToPay}
                            calculatorTotalAmountToPay={values.calculatorTotalAmountToPay}
                          />
                        </Form>
                      </div>
                    ), [currentStep, errors, values]);


                    const Confirmation = () => {
                      const [isVisible, setIsVisible] = useState(true);
                      const [isChecked, setIsChecked] = useState(false);

                      const closeAlert = () => {
                        if (isChecked) {
                          setIsVisible(false);
                        } else {
                          alert("You must agree to the terms and conditions before proceeding.");
                        }
                      };
                      return <div className="mt-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">Note</h3>
                            <p className="mt-2">Collateral is required for bigger loan amount (such as land title, house and lot, and the likes)</p>
                          </div>
                          <button

                            className="text-yellow-700 hover:text-yellow-900 font-semibold"
                          >

                          </button>
                        </div>
                        <div className="flex items-center mt-4">
                          <input
                            type="checkbox"
                            id="terms"
                            checked={isChecked}
                            onChange={() => setIsChecked(!isChecked)}
                            className="h-5 w-5 text-blue-500"
                          />
                          <label htmlFor="terms" className="ml-2 text-smf text-gray-700">
                            I further certify that the cited information’s are the best of my knowledge tru, correct, and voluntary
                          </label>
                        </div>
                      </div>
                    }

                    const steps = [

                      {
                        label: 'Personal Information', content: () => {
                          return PersonalInfo
                        }
                      },
                      {
                        label: 'Work Details', content: () => {
                          return AccountDetails
                        }
                      },
                      {
                        label: 'Supporting Documents', content: () => {
                          return <SupportingDocuments />
                        }
                      },
                      {
                        label: 'Calculator', content: () => { return Calculator }
                      },
                      {
                        label: 'Disbursement Details', content: () => {
                          return DisbursementDetails
                        }
                      },
                    ];

                    const nextStep = async () => {

                      // setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
                      // return true;
                      const formErrors = await validateForm();



                      //console.log({ currentStep })

                      if (currentStep === 2) {
                        const validateFields = (fields, setFieldError) => {
                          const fieldErrors = {
                            borrowerValidID: "Borrower's Valid ID is required",
                            bankStatement: "Bank Statement is required",
                            coMakersValidID: "Co-maker's Valid ID is required",
                          };

                          // Loop through fields to check and set errors
                          Object.keys(fieldErrors).forEach((field) => {
                            if (!fields[field]) {
                              setFieldError(field, fieldErrors[field]);
                            }
                          });
                        };


                        let { borrowerValidID, bankStatement, coMakersValidID } = values;
                        if (!borrowerValidID || !bankStatement || !coMakersValidID) {

                          validateFields({ borrowerValidID, bankStatement, coMakersValidID }, setFieldError);


                          return true


                        }
                        else {
                          setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
                        }
                      } else {
                        // Dynamically set errors using setFieldError
                        for (const [field, error] of Object.entries(formErrors)) {

                          setFieldTouched(field, true); // Mark field as touched
                          setFieldError(field, error); // Set error for each field dynamically
                        }

                        if (Object.keys(formErrors).length === 0) {
                          //  handleSubmit(); // Only proceed to next step if there are no errors
                          setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
                        }
                      }





                    };

                    const prevStep = () => {
                      setCurrentStep((prev) => Math.max(prev - 1, 0));
                    };

                    // const stepContent = useMemo(() => steps[currentStep].content(), [currentStep]);



                    return (
                      <div>
                        <div className="mt-4">
                          <div className="">
                            {/* Step Navigation Menu */}
                            <div className="flex justify-between mb-4">
                              {steps.map((step, index) => (
                                <div
                                  key={index}
                                  className={`cursor-pointer text-center flex-1 ${currentStep === index ? 'text-customBlue  font-bold' : 'text-gray-400'
                                    }`}
                                  onClick={() => index <= currentStep && setCurrentStep(index)}
                                >
                                  <span>{step.label}</span>
                                  <div
                                    className={`mt-2 h-1 rounded ${currentStep === index ? 'bg-customBlue' : 'bg-transparent'
                                      }`}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* <h2 className="text-xl font-bold mb-4">{steps[currentStep].label}</h2> */}


                            {steps[currentStep].content()}
                            <div className="flex justify-between mt-4">
                              {currentStep > 0 && (
                                <button onClick={prevStep}
                                  className="btn  bg-gray-200 text-black">
                                  Previous
                                </button>
                              )}
                              {currentStep < steps.length - 1 ? (
                                <button onClick={nextStep} className="btn btn-primary bg-buttonPrimary">
                                  Next
                                </button>
                              ) : (
                                <button
                                  type='submit'
                                  onClick={handleSubmit}

                                  disabled={isSubmitting}

                                  className="btn btn-success bg-buttonPrimary text-white">

                                  {isSubmitting ? (
                                    <span className="w-4 h-4 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mr-2"></span>

                                  ) : (
                                    "" // Default text
                                  )}
                                  Submit
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  }}
                </Formik>
              } </div>
          </div>
        </dialog >


        <dialog id="viewLoan" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">

            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                setselectedLoan({})
                document.getElementById("viewLoan").close()
              }}


            >✕</button>

            <div className="modal-header flex items-center justify-between p-4 bg-gradient-to-r from-gray-200 to-gray-300
      z-10 text-blue-950 border bg-white text-blue-950  rounded-t-lg">
              <h1 className="text-xl font-bold">Loan Details</h1>

            </div>

            <p className="text-sm text-gray-500 mt-1 font-bold"></p>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              <StatusPill value={selectedLoan.loan_status} />
              {selectedLoan.loan_application_id && <Formik
                initialValues={{
                  calculatorLoanAmmount: parseFloat(selectedLoan.loan_amount),
                  calculatorInterestRate: parseFloat(selectedLoan.interest_rate),
                  calculatorMonthsToPay: parseFloat(selectedLoan.repayment_schedule_id),
                  loan_status: selectedLoan.loan_status
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



                  return <LoanCalculator
                    selectedLoan={selectedLoan}
                    isReadOnly={true}
                    values={values}
                    setFieldValue={setFieldValue}
                    handleBlur={handleBlur}
                    calculatorLoanAmmount={values.calculatorLoanAmmount}
                    calculatorInterestRate={values.calculatorInterestRate}
                    calculatorMonthsToPay={values.calculatorMonthsToPay}
                    calculatorTotalAmountToPay={values.calculatorTotalAmountToPay}
                  />


                }}</Formik>
              }

            </div>
          </div>
        </dialog >
        <Table
          style={{ overflow: 'wrap' }}
          className="table-sm"
          columns={columns}
          data={(myLoanList || []).map(data => {
            return {
              ...data

            };
          })}
          searchField="lastName"
        />
      </div >

      <ToastContainer />









    </TitleCard >

  );
}

export default LoanApplication;
