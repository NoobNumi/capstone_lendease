import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Table, { StatusPill } from '../../pages/protected/DataTables/Table';
import { formatAmount } from '../dashboard/helpers/currencyFormat';
import { format } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import checkAuth from '../../app/auth';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import InputText from '../../components/Input/InputText';
import Dropdown from '../../components/Input/Dropdown';

import {
  regions,
  provinces,
  cities,
  barangays,
  provincesByCode,
  regionByCode
} from 'select-philippines-address';
const Tab1Content = ({
  selectedUser,
  userId
}) => {




  const [address_region, setaddress_region] = useState('');
  const [address_province, setaddress_province] = useState('');
  const [address_city, setaddress_cities] = useState('');
  const [address_barangay, setaddress_barangay] = useState('');

  const [addressRegions, setRegions] = useState([]);
  const [addressProvince, setProvince] = useState([]);
  const [addressCity, setCity] = useState([]);
  const [addressBarangay, setBarangay] = useState([]);





  const prepareAddress = async selectedUser => {
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

    await provincesByCode(selectedUser.address_region).then(province => {




      setProvince(
        province.map(r => {
          return {
            value: r.province_code,
            label: r.province_name
          };
        })
      );
    });


    await cities(selectedUser.address_province).then(cities => {

      console.log({ cities })
      setCity(
        cities.map(r => {
          return {
            value: r.city_code,
            label: r.city_name
          };
        })
      );
    });
    await barangays(selectedUser.address_city).then(barangays => {



      setBarangay(
        barangays.map(r => {
          return {
            value: r.brgy_code,
            label: r.brgy_name
          };
        })
      );
    });
  };


  useEffect(() => {




    prepareAddress(selectedUser)


  }, []);


  // const token = checkAuth();
  // const decoded = jwtDecode(token);

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setprofilePhotoPreview] = useState(null);
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    console.log({ file })
    setProfilePhoto(file)
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setprofilePhotoPreview(reader.result); // Set the image preview

      };
      reader.readAsDataURL(file);
    }
  };


  const formikConfig = (selectedUser) => {


    return {
      initialValues: {
        role: 'Borrower',
        email: '',
        password: '',
        showPassword: false,
        first_name: '',
        middle_name: '',
        last_name: '',
        contact_number: '',
        "address_region": '',
        "address_province": '',
        "address_city": '',
        "address_barangay": '',
        date_of_birth: '',
        gender: '',
        nationality: 'FILIPINO',
      },
      validationSchema: Yup.object({
        // role: Yup.string().required('Required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string()
          .min(8, 'Password must be at least 8 characters long')
          .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
          .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
          .matches(/[0-9]/, 'Password must contain at least one number')
          .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
          .required('Password is required'),
        first_name: Yup.string().required('First name is required'),
        last_name: Yup.string().required('Last name is required'),
        date_of_birth: Yup.date().required('Date of birth is required'),
        contact_number: Yup.string().required('Phone number is required'),
        address_region: Yup.string().required('Region is required'),
        address_province: Yup.string().required('Province is required'),
        address_city: Yup.string().required('City is required'),
        address_barangay: Yup.string().required('Barangay is required'),
        gender: Yup.string().required('Required'),
        nationality: Yup.string().required('Required'),
      }),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting }) => {
        setSubmitting(true);

        try {






          // let { type, ...others } = values

          console.log({ values })
          let res = await axios({
            method: 'post',
            url: `user/register`,
            data: {

              ...values
            }
          });


          await axios.post('auth/send-verification-email', { email: values.email });

          toast.success('Account created successfully. Please check your email.', {
            onClose: () => {
              // window.location.reload(); // Reloads the current window
            },
            position: 'top-right',
            autoClose: 300, // Short duration for auto-close (300ms)
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
          });






          return true





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
        } finally {
        }
      }
    };
  };



  return <div>
    <div className="p-1 space-y-4 md:space-y-6 sm:p-4">

      <Formik {...formikConfig(selectedUser)}>
        {({
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


          console.log({ errors })

          return (
            <Form className="">



              {/* <Dropdown
                className="z-50"

                label="Role"
                name="role"
                value={values.role}

                onBlur={handleBlur}
                options={[
                  {
                    value: 'Borrower',
                    label: 'Borrower',
                  },
                  {
                    value: 'Loan Officer',
                    label: 'Loan Officer',
                  },
                  {
                    value: 'Collector',
                    label: 'Collector',
                  }
                ]}
                affectedInput="role"
                allValues={values}
                setFieldValue={setFieldValue}

              /> */}
              <InputText

                label="Email"
                name="email"
                type="text"
                placeholder="Enter your email"
                value={values.email}
                onBlur={handleBlur} // This apparently updates `touched`?
              />

              <InputText
                label="Password"
                name="password"
                type={values.showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={values.password}
                onBlur={handleBlur}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setFieldValue('showPassword', !values.showPassword)}
                    className="focus:outline-none"
                  >
                    {values.showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                }
              />
              <hr class="border-t-2 border-gray-200 my-4"></hr>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">
                <InputText

                  label="First Name"
                  name="first_name"
                  type="text"
                  placeholder=""
                  value={values.first_name}
                  onBlur={handleBlur} // This apparently updates `touched`?
                />


                <InputText

                  label="Middle Name"
                  name="middle_name"
                  type="text"
                  placeholder=""
                  value={values.middle_name}
                  onBlur={handleBlur} // This apparently updates `touched`?
                />

                <InputText

                  label="Last Name"
                  name="last_name"
                  type="text"
                  placeholder=""
                  value={values.last_name}
                  onBlur={handleBlur} // This apparently updates `touched`?
                />
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 ">
                <InputText

                  label="Birth Date"
                  name="date_of_birth"
                  type="date"
                  placeholder=""
                  value={values.date_of_birth}
                  onBlur={handleBlur} // This apparently updates `touched`?
                />

                <InputText

                  label="Phone Number"
                  name="contact_number"
                  type="text"
                  placeholder=""
                  value={values.contact_number}
                  onBlur={handleBlur} // This apparently updates `touched`?
                />
              </div>

              <div className="z-50 grid grid-cols-1 gap-3 md:grid-cols-2 ">
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

              </div>

              <div className="z-50 grid grid-cols-1 gap-3 md:grid-cols-2 ">

                <Dropdown
                  className="z-50"
                  label="City"
                  name="address_city"
                  value={values.address_city}
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

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                <div className='mt-2'>
                  <Dropdown
                    label="Gender"
                    name="gender"
                    value={values.gender}
                    onBlur={handleBlur}
                    setFieldValue={setFieldValue}
                    options={[
                      { value: 'MALE', label: 'Male' },
                      { value: 'FEMALE', label: 'Female' }
                    ]}
                  />
                </div>

                <InputText

                  isRequired
                  label="Nationality"
                  name="nationality"
                  type="text"
                  value={values.nationality}
                  onBlur={handleBlur}
                  onChange={(e) => setFieldValue('nationality', e.target.value)}
                />
              </div>

              <button
                type="submit"
                className={
                  'w-full btn mt-4 shadow-lg  bg-blue-950 font-bold text-white align-right'
                }>
                Register
              </button>
              <div className="text-center text-blue-950 mt-2">
                <a href="/login">
                  <span className="text-sm hover:text-buttonPrimary hover:underline cursor-pointer transition duration-200">
                    Already have account? Login
                  </span>
                </a>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div></div>
}

function ForgotPassword() {
  const [activeTab, setActiveTab] = useState(1); // State to control active tab
  const INITIAL_USER_OBJ = { emailId: "" };
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [userObj, setUserObj] = useState(INITIAL_USER_OBJ);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState({});
  const params = useParams();
  let userId = params.userId;

  const [selectedUser, setSelectedUser] = useState({});


  const getUser = async () => {
    // let res = await axios.get(`user/${userId}`);
    // let user = res.data.data;


    // setSelectedUser(user);
    setIsLoaded(true);
  };


  useEffect(() => {
    getUser();

  }, []);




  return (

    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-2 shadow-lg bg-gradient-to-r from-gray-100 to-gray-100 rounded-lg max-w-xl w-full">
        <div className="bg-white rounded bg-gradient-to-r from-gray-100 to-gray-300 z-10 text-blue-950 border bg-white rounded flex items-center space-x-4">
          <img
            src="/LOGO.png"
            alt="Logo"
            className="w-20 h-20 rounded-full border-2 border-blue-950"
          />
          <p className="font-bold text-lg">Create an account</p>
        </div>
        <Tab1Content />

      </div>
      <ToastContainer />
    </div>

  );
}

export default ForgotPassword;



