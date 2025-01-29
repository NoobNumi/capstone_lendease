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

import PersonalInfoForm from './PersonalInfoForm';

import PersonalInfoFormCreate from './PersonalInfoForm';

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

function LoanApplication({ role }) {


  //console.log({ role })

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
  const [selectedLoan, setselectedLoan] = useState(null);
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

  };

  const borrowerList = async () => {


    let route_name = 'loan_officer';

    if (role === 'Collector') {
      route_name = 'collector';
    }

    let res = await axios({
      method: 'get',
      url: `admin/${route_name}/list`,
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
        Header: 'Profile Picture',
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
        Header: 'email',
        accessor: 'email',
        Cell: ({ row, value }) => {

          return <span className="">{value}</span>;
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
        Header: 'Is Verified',
        accessor: 'is_verified ',
        Cell: ({ row, value }) => {
          // let firstName = row.original.first_name;
          // let middleName = row.original.middle_name;
          // let lastName = row.original.last_name;

          return <span className="">{value ? 'YES' : 'NO'}</span>;
        }
      },



      {
        Header: 'Action',
        accessor: '',
        Cell: ({ row }) => {
          let user = row.original;



          return (
            (
              <div className="flex">

                <button className="btn btn-outline btn-sm" onClick={() => {

                  setselectedLoan(user);

                  document.getElementById('addBorrower').showModal();
                }}>
                  <i class="fa-solid fa-edit"></i>
                </button>

                {/* <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => {




                  }}>
                  <i class="fa-solid fa-edit"></i>
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
  const formikConfig = (selectUser) => {



    //console.log({ selectUser })

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
        nationality: Yup.string().required('Nationality is required')
      }
    }



    return {
      initialValues: {
        first_name: selectUser?.first_name || '',
        middle_name: selectUser?.middle_name || '',
        last_name: selectUser?.last_name || '',
        address_region: selectUser?.address_region || '',
        address_province: selectUser?.address_province || '',
        address_city: selectUser?.address_city || '',
        address_barangay: selectUser?.address_barangay || '',
        email: selectUser?.email || '',
        contact_number: selectUser?.contact_number || '',
        date_of_birth: selectUser?.date_of_birth || '',
        age: selectUser?.age || '',
        gender: selectUser?.gender || '',
        nationality: selectUser?.nationality || 'FILIPINO',
        religion: selectUser?.religion || '',
        work_type: selectUser?.work_type || '',
        position: selectUser?.position || '',
        status: selectUser?.status || '',
        monthly_income: selectUser?.monthly_income || '',

      },
      validationSchema: Yup.object({
        ...PersonalInfoTabValidation

      }),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
        setSubmitting(true);




        try {





          console.log({ role })


          if (role === 'Collector') {


            if (selectedLoan && selectedLoan.collector_id) {
              let res = await axios({
                method: 'put',
                url: `admin/collector/update/${selectedLoan.collector_id}`,
                data: { ...values, role: 'Collector' }
              })
              resetForm();
              borrowerList();
              document.getElementById('addBorrower').close();

              setselectedLoan(null)

              toast.success('Successfully Updated!', {
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


            } else {

              let res = await axios({
                method: 'post',
                url: `admin/collector/create`,
                data: { ...values, role: 'Collector' }
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

            }

          }

          else if (role === 'Loan Officer') {

            if (selectedLoan && selectedLoan.officer_id) {
              let res = await axios({
                method: 'put',
                url: `admin/loan_officer/update/${selectedLoan.officer_id}`,
                data: { ...values, role: 'Loan Officer' }
              })
              resetForm();
              borrowerList();
              document.getElementById('addBorrower').close();

              setselectedLoan(null)

              toast.success('Successfully Updated!', {
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


            } else {

              let res = await axios({
                method: 'post',
                url: `admin/loan_officer/create`,
                data: { ...values, role: 'Loan Officer' }
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

            }

          }








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

  //console.log({ selectedLoan })

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
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"

                onClick={() => {
                  setselectedLoan(null)
                }}
              >✕</button>
            </form>
            <h1 className="font-bold text-lg  p-4 bg-gradient-to-r from-gray-200 to-gray-300
      z-10 text-blue-950 border bg-white
             text-blue-950 rounded-lg">New Account</h1>
            <p className="text-sm text-gray-500 mt-1 font-bold"></p>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              {/* {(!selectedLoan.officer_id || !selectedLoan.collector_id) &&


                <PersonalInfoForm
                  selectedLoan={selectedLoan}
                  addressRegions={addressRegions}
                  addressProvince={addressProvince}
                  setProvince={setProvince}
                  setCity={setCity}
                  addressCity={addressCity}
                  addressBarangay={addressBarangay}
                  setBarangay={setBarangay}
                  formikConfig={formikConfig}
                  provincesByCode={provincesByCode}
                  regions={regions}
                  provinces={provinces}
                  cities={cities}
                  barangays={barangays}
                />

              } */}
              {
                selectedLoan === null && <PersonalInfoFormCreate
                  selectedLoan={selectedLoan}
                  addressRegions={addressRegions}
                  addressProvince={addressProvince}
                  setProvince={setProvince}
                  setCity={setCity}
                  addressCity={addressCity}
                  addressBarangay={addressBarangay}
                  setBarangay={setBarangay}
                  formikConfig={formikConfig}
                  provincesByCode={provincesByCode}
                  regions={regions}
                  provinces={provinces}
                  cities={cities}
                  barangays={barangays}
                />
              }

              {((selectedLoan && selectedLoan.officer_id) || (selectedLoan && selectedLoan.collector_id)) && <PersonalInfoForm
                selectedLoan={selectedLoan}
                addressRegions={addressRegions}
                addressProvince={addressProvince}
                setProvince={setProvince}
                setCity={setCity}
                addressCity={addressCity}
                addressBarangay={addressBarangay}
                setBarangay={setBarangay}
                formikConfig={formikConfig}
                provincesByCode={provincesByCode}
                regions={regions}
                provinces={provinces}
                cities={cities}
                barangays={barangays}
              />

              }
              {/* 
              {(!selectedLoan.officer_id || !selectedLoan.collector_id) && <PersonalInfoForm
                selectedLoan={selectedLoan}
                addressRegions={addressRegions}
                addressProvince={addressProvince}
                setProvince={setProvince}
                setCity={setCity}
                addressCity={addressCity}
                addressBarangay={addressBarangay}
                setBarangay={setBarangay}
                formikConfig={formikConfig}
                provincesByCode={provincesByCode}
                regions={regions}
                provinces={provinces}
                cities={cities}
                barangays={barangays}
              />

              } */}
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
