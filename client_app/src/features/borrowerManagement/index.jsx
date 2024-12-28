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

import PlayCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import {
  mdiAccount,
  mdiBallotOutline,
  mdiGithub,
  mdiMail,
  mdiUpload,
  mdiAccountPlusOutline,
  mdiPhone,
  mdiLock,
  mdiVanityLight,
  mdiLockOutline,
  mdiCalendarRange,
  mdiPhoneOutline,
  mdiMapMarker,
  mdiEmailCheckOutline,
  mdiAccountHeartOutline,
  mdiCashCheck,
  mdiAccountCreditCardOutline,
  mdiCreditCardOutline
} from '@mdi/js';
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


import LoanCalculator from "./loanCalculator";
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

import { formatAmount } from '../dashboard/helpers/currencyFormat';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};


const TopSideButtons = ({ removeFilter, applyFilter, applySearch, faqList }) => {
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
      {/* <div className="badge badge-neutral mr-2 px-2 p-4 text-blue-950 px-2 py-4 bg-white">Total : {faqList.length}</div> */}

      <button className="btn btn-outline bg-customBlue text-white" onClick={() => document.getElementById('addBorrower').showModal()}>
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

  const [myborrowerList, setborrowerList] = useState([]);

  const prepareAddress = async () => {
    await regions().then(region => {

      console.log({ region })
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
    await provinces().then(data => {

      console.log({ data })
      // setProvince(
      //   province.map(r => {
      //     return {
      //       value: r.province_code,
      //       label: r.province_name
      //     };
      //   })
      // );

    });
    // await provincesByCode('01').then(province => console.log(province));
    // await provinceByName('Rizal').then(province =>
    //   console.log(province.province_code)
    // );
    await cities().then(city => console.log(city));
    await barangays().then(barangays => console.log(barangays));
  };

  const borrowerList = async () => {

    let res = await axios({
      method: 'get',
      url: 'admin/borrower/list',
      data: {

      }
    });
    let list = res.data.data;

    setborrowerList(list)


  };

  useEffect(() => {


    prepareAddress();
    borrowerList()
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
        Header: 'Valid ID',
        accessor: 'profile_pic',
        Cell: ({ row, value }) => {


          const profilePictureUrl = value;

          return (
            <div className="flex justify-center items-center">
              <img
                src={profilePictureUrl || 'https://img.freepik.com/premium-vector/young-smiling-man-avatar-man-with-brown-beard-mustache-hair-wearing-yellow-sweater-sweatshirt-3d-vector-people-character-illustration-cartoon-minimal-style_365941-860.jpg?w=740'} // Fallback to a default image if URL is missing
                alt="Profile Thumbnail"
                className="w-20 h-20 object-cover border border-gray-300 rounded-md" // Use `rounded-md` for moderate corner rounding
              />
            </div>
          );
        }
      },

      {
        Header: 'Full Name',
        accessor: '',
        Cell: ({ row, value }) => {
          let firstName = row.original.first_name;
          let middleName = row.original.middle_name;
          let lastName = row.original.last_name;

          return <span className="">{firstName} {middleName} {lastName}</span>;
        }
      },
      {
        Header: 'Address',
        accessor: '',
        Cell: ({ row }) => {
          const [addressRegion, setAddressRegion] = useState('');
          const [addressProvince, setAddressProvince] = useState('');
          const [addressCity, setAddressCity] = useState('');
          const [addressBaragay, setAddressBarangay] = useState('');



          let region = row.original.address_region;
          let province = row.original.address_province;
          let address_city = row.original.address_city;
          let address_barangay = row.original.address_barangay;

          let findRegion = addressRegions.find(r => r.value === region);


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

          return (
            <span className="">
              {addressRegion}, {addressProvince}, {addressCity}, {addressBaragay}
            </span>
          );
        },
      },

      {
        Header: 'Contact Number',
        accessor: 'contact_number',
        Cell: ({ row, value }) => {
          // let firstName = row.original.first_name;
          // let middleName = row.original.middle_name;
          // let lastName = row.original.last_name;

          return <span className="">{value}</span>;
        }
      },

      {
        Header: 'Current Loan',
        accessor: 'loan_amount',
        Cell: ({ row, value }) => {
          // let firstName = row.original.first_name;
          // let middleName = row.original.middle_name;
          // let lastName = row.original.last_name;

          return <span className="text-green-500 font-bold">{formatCurrency(value)}</span>;
        }
      },
      {
        Header: 'Next Payment Date',
        accessor: '',
        Cell: ({ row, value }) => {
          // let firstName = row.original.first_name;
          // let middleName = row.original.middle_name;
          // let lastName = row.original.last_name;

          return <span className="">{value}</span>;
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

                <button className="btn btn-outline btn-sm" onClick={() => {
                }}>
                  <i class="fa-solid fa-eye"></i>
                </button>

                <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => {




                  }}>
                  <i class="fa-solid fa-edit"></i>
                </button>
              </div>
            )
          );
        }
      },

    ],
    []
  );

  const handleOnChange = e => {
    console.log(e.target.files[0]);
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
  const formikConfig = () => {




    let PersonalInfoTabValidation = {};

    if (currentStep === 0) {
      PersonalInfoTabValidation = {
        first_name: Yup.string().required('Given name is required'),
        middle_name: Yup.string().optional(),
        last_name: Yup.string().required('Last name is required'),
        address_region: Yup.string().required('Region is required'),
        address_province: Yup.string().required('Province is required'),
        address_city: Yup.string().required('City is required'),
        address_barangay: Yup.string().required('Barangay is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        contact_number: Yup.string().matches(/^[0-9]+$/, 'Contact number must be digits').required('Contact number is required'),
        date_of_birth: Yup.date().required('Date of birth is required'),
        age: Yup.number().min(1, 'Age must be greater than 0').required('Age is required'),
        gender: Yup.string().required('Gender is required'),
        nationality: Yup.string().required('Nationality is required'),
        religion: Yup.string().required('Religion is required')
      }
    }
    else if (currentStep === 1) {


      PersonalInfoTabValidation = {
        work_type: Yup.string().required('Work type is required'),
        position: Yup.string().required('Position is required'),
        status: Yup.string().required('Status is required'),
        monthly_income: Yup.number()
          .positive('Monthly income must be a positive number')
          .required('Monthly income is required'),
      }

    }

    // else if (currentStep === 3) {
    //   PersonalInfoTabValidation = {
    //     calculatorLoanAmmount: Yup.number().required('Required'),
    //     calculatorInterestRate: Yup.number().required('Required'),
    //     calculatorMonthsToPay: Yup.number().required('Required'),
    //   }
    // }

    // else if (currentStep === 1) {

    //   console.log("DEx")
    //   PersonalInfoTabValidation = {
    //     borrowerValidID: Yup.string().required("Borrower's Valid ID is required"),
    //     bankStatement: Yup.string().required("Bank Statement is required"),
    //     coMakersValidID: Yup.string().required("Co-maker's Valid ID is required"),
    //   }
    // }




    return {
      initialValues: {
        first_name: '',
        middle_name: '',
        last_name: '',
        address_region: '',
        address_province: '',
        address_city: '',
        address_barangay: '',
        email: '',
        contact_number: '',
        date_of_birth: '',
        age: '',
        gender: '',
        nationality: 'FILIPINO',
        religion: '',
        work_type: '',
        position: '',
        status: '',
        monthly_income: '',


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

          let res = await axios({
            method: 'post',
            url: `admin/borrower/create`,
            data: values
          })



          resetForm();
          borrowerList();
          document.getElementById('addBorrower').close();

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

        } catch (error) {
          // Check if the error response contains a message
          const errorMessage = error?.response?.data?.message || 'Something went wrong';

          // Display the error message using toast
          toast.error(errorMessage, {
            onClose: () => {
              // Optional: handle any action after the toast closes
            },
            position: 'top-right',
            autoClose: 5000,  // Auto close after 5 seconds
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



  return (

    <TitleCard
      title="List"
      topMargin="mt-2"
      TopSideButtons={
        <TopSideButtons
          applySearch={applySearch}
          applyFilter={applyFilter}
          removeFilter={removeFilter}
          faqList={faqList}
        />
      }>
      <div className="">

        <dialog id="addBorrower" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h1 className="font-bold text-lg  p-4 bg-gradient-to-r from-gray-200 to-gray-300
      z-10 text-blue-950 border bg-white
             text-blue-950 rounded-lg">New Borrower</h1>
            <p className="text-sm text-gray-500 mt-1 font-bold"></p>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              <Formik {...formikConfig()}>
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


                  const calculateAge = (dob) => {
                    const today = new Date();
                    const birthDate = new Date(dob);
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const month = today.getMonth();
                    const day = today.getDate();

                    if (month < birthDate.getMonth() || (month === birthDate.getMonth() && day < birthDate.getDate())) {
                      age--;
                    }

                    return age;
                  };


                  useEffect(() => {
                    if (values.date_of_birth) {
                      const age = calculateAge(values.date_of_birth);
                      setFieldValue("age", age); // Automatically update the age field
                    }
                  }, [values.date_of_birth, setFieldValue]);


                  const PersonalInfo = useMemo(() => (
                    <div>
                      <Form className="">


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

                              console.log(e.target.value)
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
                                      console.log({ p });
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

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                          <InputText
                            isRequired
                            placeholder=""
                            label="Email"
                            name="email"
                            type="text"
                            value={values.email} // Bind value to Formik state
                            onBlur={handleBlur}
                            onChange={(e) => {
                              setFieldValue('email', e.target.value); // Use the input value
                            }}
                          />
                          <InputText
                            isRequired
                            placeholder=""
                            label="Contact Number"
                            name="contact_number"
                            type="contact_number"

                            value={values.contact_number}
                            onBlur={handleBlur} // This apparently updates `touched`?
                          />

                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                          <InputText
                            isRequired
                            placeholder=""
                            label="Birth Date"
                            name="date_of_birth"
                            type="date"
                            value={values.date_of_birth} // Bind value to Formik state
                            onBlur={handleBlur}
                            onChange={(e) => {
                              setFieldValue('date_of_birth', e.target.value); // Use the input value
                            }}
                          />
                          <InputText
                            isRequired
                            placeholder=""
                            label="Age"
                            name="age"
                            type="age"

                            value={values.age}
                            onBlur={handleBlur} // This apparently updates `touched`?
                          />

                        </div>


                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">
                          <div className='mt-2'>
                            <Dropdown
                              className="z-50"

                              label="Gender"
                              name="gender"
                              value={values.gender}
                              d
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={[{
                                value: 'MALE',
                                label: 'Male'
                              },
                              {
                                value: 'FEMALE',
                                label: 'Female'
                              }]}
                              affectedInput="address_city"
                              functionToCalled={async code => {

                              }}
                            /></div>
                          <InputText
                            isRequired
                            placeholder=""
                            label="Nationality"
                            name="nationality"
                            type="nationality"

                            value={values.nationality}
                            onBlur={handleBlur} // This apparently updates `touched`?
                          />
                          <InputText
                            isRequired
                            placeholder=""
                            label="Religion"
                            name="religion"
                            type="religion"

                            value={values.religion}
                            onBlur={handleBlur} // This apparently updates `touched`?
                          />


                        </div>


                      </Form>
                    </div>
                  ), [currentStep, errors, values, addressRegions, addressProvince, addressCity, addressBarangay]);


                  const AccountDetails = useMemo(() => (
                    <div>


                      <Form className="">
                        {<div>

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
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mt-4 ">
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


                          </div>

                          <div className="grid grid-cols-1 gap-3 md:grid-cols-1 mt-2">
                            <InputText
                              isRequired
                              placeholder="Monthly Income"
                              label="Monthly Income"
                              name="monthly_income"
                              type="number"

                              value={values.monthly_income}
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
                            console.log({ files })



                          }}
                        >
                          Submit
                        </button> */}
                      </div>
                    );

                  };






                  const Calculator = useMemo(() => (
                    <div>
                      <Form className="">
                        <LoanCalculator
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
                    // {
                    //   label: 'Supporting Documents', content: () => {
                    //     return <SupportingDocuments />
                    //   }
                    // },
                    // {
                    //   label: 'Calculator', content: () => { return Calculator }
                    // }
                  ];

                  const nextStep = async () => {

                    // setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
                    // return true;
                    const formErrors = await validateForm();



                    console.log({ currentStep })

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
                              <button onClick={prevStep} className="btn  bg-gray-200 text-black">
                                Previous
                              </button>
                            )}
                            {currentStep < steps.length - 1 ? (
                              <button onClick={nextStep} className="btn btn-primary bg-buttonPrimary">
                                Next
                              </button>
                            ) : (
                              <button

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
              </Formik> </div>
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

            <div className="modal-header flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg">
              <h1 className="text-xl font-semibold">Loan Details</h1>

            </div>

            <p className="text-sm text-gray-500 mt-1 font-bold"></p>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">

              {selectedLoan.loan_application_id && <Formik
                initialValues={{
                  calculatorLoanAmmount: parseFloat(selectedLoan.loan_amount),
                  calculatorInterestRate: parseFloat(selectedLoan.interest_rate),
                  calculatorMonthsToPay: parseFloat(selectedLoan.repayment_schedule_id),

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

                  console.log({ values })


                  return <LoanCalculator
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
          data={(myborrowerList || []).map(data => {
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
