import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table, { StatusPill } from "../../pages/protected/DataTables/Table";
import { formatAmount } from "../dashboard/helpers/currencyFormat";
import { format } from "date-fns";
import { jwtDecode } from "jwt-decode";
import checkAuth from "../../app/auth";
import { Formik, useField, useFormik, Form } from "formik";
import * as Yup from "yup";
import InputText from "../../components/Input/InputText";
import Dropdown from "../../components/Input/Dropdown";

import {
  regions,
  provinces,
  cities,
  barangays,
  provincesByCode,
  regionByCode,
} from "select-philippines-address";
const Tab1Content = ({ selectedUser, userId }) => {
  console.log({ selectedUser });
  const [showOldPassword, setOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [address_region, setaddress_region] = useState("");
  const [address_province, setaddress_province] = useState("");
  const [address_city, setaddress_cities] = useState("");
  const [address_barangay, setaddress_barangay] = useState("");

  const [addressRegions, setRegions] = useState([]);
  const [addressProvince, setProvince] = useState([]);
  const [addressCity, setCity] = useState([]);
  const [addressBarangay, setBarangay] = useState([]);

  const toggleOldPassword = () => {
    setOldPassword((prev) => !prev);
  };

  const toggleNewPassword = () => {
    setShowNewPassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const prepareAddress = async (selectedUser) => {
    await regions().then((region) => {
      setRegions(
        region.map((r) => {
          return {
            value: r.region_code,
            label: r.region_name,
          };
        })
      );
    });

    await provincesByCode(selectedUser.address_region).then((province) => {
      setProvince(
        province.map((r) => {
          return {
            value: r.province_code,
            label: r.province_name,
          };
        })
      );
    });

    await cities(selectedUser.address_province).then((cities) => {
      console.log({ cities });
      setCity(
        cities.map((r) => {
          return {
            value: r.city_code,
            label: r.city_name,
          };
        })
      );
    });
    await barangays(selectedUser.address_city).then((barangays) => {
      setBarangay(
        barangays.map((r) => {
          return {
            value: r.brgy_code,
            label: r.brgy_name,
          };
        })
      );
    });
  };

  useEffect(() => {
    if (selectedUser.role) {
      prepareAddress(selectedUser);
    }
  }, []);

  const token = checkAuth();
  const decoded = jwtDecode(token);

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setprofilePhotoPreview] = useState(null);
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    console.log({ file });
    setProfilePhoto(file);
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
        role: selectedUser.role,
        first_name: selectedUser.first_name,
        middle_name: selectedUser.middle_name,
        last_name: selectedUser.last_name,
        contact_number: selectedUser.contact_number,
        date_of_birth: selectedUser.date_of_birth
          ? selectedUser.date_of_birth.split("T")[0]
          : "", // Format as YYYY-MM-DD
        address_region: selectedUser.address_region,
        address_province: selectedUser.address_province,
        address_city: selectedUser.address_city,
        address_barangay: selectedUser.address_barangay,
        password: "",
        new_password: "",
        confirm_password: "",
      },
      validationSchema: Yup.object({
        first_name: Yup.string().required("First name is required"),
        last_name: Yup.string().required("Last name is required"),
        contact_number: Yup.string()
          .matches(/^\d{11}$/, "Phone number must be exactly 11 digits")
          .required("Phone number is required"),
        password: Yup.string().when("new_password", {
          is: (newPwd) => !!newPwd,
          then: (schema) => schema.required("Current password is required"),
        }),
        new_password: Yup.string(),
        confirm_password: Yup.string().when("new_password", {
          is: (newPassword) => !!newPassword,
          then: (schema) =>
            schema
              .required("Confirm password is required")
              .oneOf([Yup.ref("new_password")], "Passwords must match"),
        }),
      }),
      onSubmit: async (values, { setSubmitting }) => {
        setSubmitting(true);

        try {
          // Handle password change if any password field is filled
          if (
            values.password ||
            values.new_password ||
            values.confirm_password
          ) {
            if (
              !values.password ||
              !values.new_password ||
              !values.confirm_password
            ) {
              toast.error("Please complete all password fields.");
              setSubmitting(false);
              return;
            }

            if (values.new_password !== values.confirm_password) {
              toast.error("New password and confirm password do not match.");
              setSubmitting(false);
              return;
            }

            await axios.put(`user/${userId}/change-password`, {
              password: values.password,
              new_password: values.new_password,
              confirm_password: values.confirm_password,
            });

            toast.success(
              "Password updated successfully. Please log in again.",
              {
                onClose: () => {
                  window.location.href = "/login";
                },
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
              }
            );

            return; // Skip profile update after password change
          }

          // Proceed with other profile updates if no password change
          await axios.put(`user/${userId}`, {
            role: selectedUser.role,
            first_name: values.first_name,
            last_name: values.last_name,
            contact_number: values.contact_number,
          });

          toast.success("Profile updated successfully", {
            position: "top-right",
            autoClose: 300,
          });
        } catch (error) {
          console.log({ error });
          toast.error("An error occurred, please try again.");
        } finally {
          setSubmitting(false);
        }
      },
    };
  };

  return (
    <div>
      <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
        {selectedUser.role && (
          <Formik enableReinitialize {...formikConfig(selectedUser)}>
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
              isSubmitting,
            }) => {
              return (
                <Form className="">
                  <div className="flex items-center justify-center">
                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <img
                        src={
                          profilePhotoPreview ||
                          selectedUser.profile_pic ||
                          "https://via.placeholder.com/150"
                        }
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-gray-300 shadow-md object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-600 text-sm">
                          {selectedUser.profile_pic || profilePhoto
                            ? ""
                            : "Upload Photo"}
                        </span>
                      </span>
                    </label>
                  </div>
                  <InputText
                    disabled
                    label="Role"
                    name="role"
                    type="text"
                    placeholder=""
                    value={values.role}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
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
                      functionToCalled={async (regionCode) => {
                        if (regionCode) {
                          setFieldValue("address_province", "");
                          await provincesByCode(regionCode).then((province) => {
                            setProvince(
                              province.map((p) => {
                                return {
                                  value: p.province_code,
                                  label: p.province_name,
                                };
                              })
                            );
                          });
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
                      functionToCalled={async (code) => {
                        if (code) {
                          await cities(code).then((cities) => {
                            setCity(
                              cities.map((p) => {
                                return {
                                  value: p.city_code,
                                  label: p.city_name,
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
                      value={values.address_city}
                      setFieldValue={setFieldValue}
                      onBlur={handleBlur}
                      options={addressCity}
                      affectedInput="address_barangay"
                      functionToCalled={async (code) => {
                        if (code) {
                          await barangays(code).then((cities) => {
                            setBarangay(
                              cities.map((p) => {
                                console.log({ p });
                                return {
                                  value: p.brgy_code,
                                  label: p.brgy_name,
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
                      functionToCalled={async (code) => {}}
                      setFieldValue={setFieldValue}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <InputText
                      label="Old Password"
                      name="password"
                      type={showOldPassword ? "text" : "password"}
                      placeholder="Type your old password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      endAdornment={
                        <button
                          type="button"
                          onClick={toggleOldPassword}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showOldPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                clipRule="evenodd"
                              />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          )}
                        </button>
                      }
                    />
                    <InputText
                      label="New Password"
                      name="new_password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Type your New password"
                      value={values.new_password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      endAdornment={
                        <button
                          type="button"
                          onClick={toggleNewPassword}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showNewPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                clipRule="evenodd"
                              />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          )}
                        </button>
                      }
                    />
                    <InputText
                      label="Confirm Password"
                      name="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={values.confirm_password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      endAdornment={
                        <button
                          type="button"
                          onClick={toggleConfirmPassword}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showConfirmPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                clipRule="evenodd"
                              />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          )}
                        </button>
                      }
                    />
                  </div>

                  {/* <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                                    <InputText

                                        label="Username"
                                        name="Username"
                                        type="text"
                                        placeholder=""
                                        value={values.Username}
                                        onBlur={handleBlur} 
                                    />
                                    <InputText

                                        label="Password"
                                        name="Password"
                                        type="text"
                                        placeholder=""
                                        value={values.Password}
                                        onBlur={handleBlur} 
                                    />
                                </div> */}
                  <button
                    type="submit"
                    className={
                      "btn mt-4 shadow-lg  bg-blue-950 font-bold text-white"
                    }
                  >
                    Update
                  </button>
                </Form>
              );
            }}
          </Formik>
        )}{" "}
      </div>
    </div>
  );
};

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
    let res = await axios.get(`user/${userId}`);
    let user = res.data.data;

    setSelectedUser(user);
    setIsLoaded(true);
  };

  useEffect(() => {
    getUser();
  }, []);

  return selectedUser ? (
    <div className="flex h-screen">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          {/* <h2 className="text-2xl font-bold mb-4">My profile</h2> */}

          {selectedUser.role && (
            <Tab1Content selectedUser={selectedUser} userId={userId} />
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  ) : (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Unknown User</h1>
        <p className="text-lg text-gray-600">
          We couldn't find the user you're looking for.
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
